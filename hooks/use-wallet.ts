"use client"

import { useEffect, useCallback, useSyncExternalStore } from "react"
import { getContractConfig } from "@/lib/web3/client"

type WalletStoreState = {
  isConnected: boolean
  address: string | null
  chainId: number | null
  isCorrectNetwork: boolean
  isLoading: boolean
  error: string | null
  isMetaMaskInstalled: boolean
}

const initialState: WalletStoreState = {
  isConnected: false,
  address: null,
  chainId: null,
  isCorrectNetwork: false,
  isLoading: false,
  error: null,
  isMetaMaskInstalled: false,
}

let store: WalletStoreState = { ...initialState }

const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach((l) => l())
}

function setStore(
  updater:
    | Partial<WalletStoreState>
    | ((prev: WalletStoreState) => WalletStoreState),
) {
  store =
    typeof updater === "function" ? updater(store) : { ...store, ...updater }
  emitChange()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return store
}

function getExpectedChainId(): number {
  try {
    return getContractConfig().chainId
  } catch {
    return 11155111 // Sepolia default
  }
}

function isCorrectChain(chainId: number | null): boolean {
  if (!chainId) return false
  return chainId === getExpectedChainId()
}

let initialized = false

async function initialize() {
  if (initialized) return
  initialized = true

  if (typeof window === "undefined") return

  const ethereum = (window as any).ethereum
  const metaMaskInstalled = !!(ethereum?.isMetaMask || ethereum)

  setStore({ isMetaMaskInstalled: metaMaskInstalled })

  if (!ethereum) return

  // Check if already connected (no popup — eth_accounts is silent)
  try {
    const accounts: string[] = await ethereum.request({ method: "eth_accounts" })
    const chainIdHex: string = await ethereum.request({ method: "eth_chainId" })
    const chainId = parseInt(chainIdHex, 16)

    if (accounts.length > 0) {
      setStore({
        isConnected: true,
        address: accounts[0],
        chainId,
        isCorrectNetwork: isCorrectChain(chainId),
        isLoading: false,
        error: null,
      })
    }
  } catch (err) {
    console.error("Failed to check existing wallet connection:", err)
  }

  // Listen for account changes
  ethereum.on?.("accountsChanged", (accounts: string[]) => {
    if (accounts.length === 0) {
      setStore({
        isConnected: false,
        address: null,
        chainId: null,
        isCorrectNetwork: false,
        isLoading: false,
        error: null,
      })
    } else {
      setStore((prev) => ({
        ...prev,
        isConnected: true,
        address: accounts[0],
        error: null,
      }))
    }
  })

  // Listen for chain changes
  ethereum.on?.("chainChanged", (chainIdHex: string) => {
    const chainId = parseInt(chainIdHex, 16)
    setStore((prev) => ({
      ...prev,
      chainId,
      isCorrectNetwork: isCorrectChain(chainId),
      error: null,
    }))
  })
}

export function useWallet() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    initialize()
  }, [])

  // Triggers MetaMask popup
  const connect = useCallback(async () => {
    const ethereum = (window as any).ethereum

    if (!ethereum) {
      setStore({ error: "No wallet detected. Please install MetaMask." })
      return
    }

    setStore({ isLoading: true, error: null })

    try {
      const accounts: string[] = await ethereum.request({
        method: "eth_requestAccounts",
      })
      const chainIdHex: string = await ethereum.request({ method: "eth_chainId" })
      const chainId = parseInt(chainIdHex, 16)

      if (accounts.length === 0) {
        setStore({ isLoading: false, error: "No accounts returned from wallet." })
        return
      }

      setStore({
        isConnected: true,
        address: accounts[0],
        chainId,
        isCorrectNetwork: isCorrectChain(chainId),
        isLoading: false,
        error: null,
      })
    } catch (err: any) {
      console.error("Wallet connection failed:", err)
      const message =
        err?.code === 4001
          ? "Connection rejected. Please approve in your wallet."
          : err?.message || "Failed to connect wallet."
      setStore({ isLoading: false, error: message })
    }
  }, [])

  // Clears local state (MetaMask does not have a programmatic disconnect)
  const disconnect = useCallback(() => {
    setStore({
      isConnected: false,
      address: null,
      chainId: null,
      isCorrectNetwork: false,
      isLoading: false,
      error: null,
    })
  }, [])

  // Asks MetaMask to switch to Sepolia
  const switchNetwork = useCallback(async () => {
    const ethereum = (window as any).ethereum
    if (!ethereum) return

    const targetChainId = getExpectedChainId()
    const chainIdHex = `0x${targetChainId.toString(16)}`

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      })
    } catch (err: any) {
      if (err?.code === 4902) {
        // Chain not in wallet — add Sepolia
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: chainIdHex,
                chainName: "Sepolia Testnet",
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                rpcUrls: ["https://rpc.sepolia.org"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          })
        } catch (addErr) {
          console.error("Failed to add Sepolia network:", addErr)
        }
      } else {
        console.error("Failed to switch network:", err)
      }
    }
  }, [])

  const refresh = useCallback(async () => {
    const ethereum = (window as any).ethereum
    if (!ethereum) return

    try {
      const accounts: string[] = await ethereum.request({ method: "eth_accounts" })
      const chainIdHex: string = await ethereum.request({ method: "eth_chainId" })
      const chainId = parseInt(chainIdHex, 16)

      if (accounts.length > 0) {
        setStore({
          isConnected: true,
          address: accounts[0],
          chainId,
          isCorrectNetwork: isCorrectChain(chainId),
          isLoading: false,
          error: null,
        })
      }
    } catch (err) {
      console.error("Wallet refresh failed:", err)
    }
  }, [])

  return {
    ...state,
    connect,
    disconnect,
    switchNetwork,
    refresh,
  }
}

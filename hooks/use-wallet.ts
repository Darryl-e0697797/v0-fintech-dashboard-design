"use client"

import { useState, useEffect, useCallback } from "react"
import { getBrowserProvider, isMetaMaskInstalled, getContractConfig } from "@/lib/web3/client"
import type { WalletState } from "@/types/ethereum"

const initialState: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  isCorrectNetwork: false,
}

export function useWallet() {
  const [state, setState] = useState<WalletState>(initialState)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkNetwork = useCallback((chainId: number | null): boolean => {
    if (!chainId) return false
    try {
      const config = getContractConfig()
      return chainId === config.chainId
    } catch {
      return false
    }
  }, [])

  const updateWalletState = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setState(initialState)
      return
    }

    const provider = getBrowserProvider()
    if (!provider) {
      setState(initialState)
      return
    }

    try {
      const accounts = await provider.listAccounts()
      if (accounts.length === 0) {
        setState(initialState)
        return
      }

      const network = await provider.getNetwork()
      const chainId = Number(network.chainId)
      const address = accounts[0].address

      setState({
        isConnected: true,
        address,
        chainId,
        isCorrectNetwork: checkNetwork(chainId),
      })
    } catch (err) {
      console.error("Error updating wallet state:", err)
      setState(initialState)
    }
  }, [checkNetwork])

  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setError("MetaMask is not installed")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const provider = getBrowserProvider()
      if (!provider) throw new Error("Provider not available")

      await provider.send("eth_requestAccounts", [])
      await updateWalletState()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect wallet"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [updateWalletState])

  const disconnect = useCallback(() => {
    setState(initialState)
    setError(null)
  }, [])

  const switchNetwork = useCallback(async () => {
    if (!isMetaMaskInstalled() || !window.ethereum) {
      setError("MetaMask is not installed")
      return
    }

    try {
      const config = getContractConfig()
      const chainIdHex = `0x${config.chainId.toString(16)}`

      await window.ethereum.request?.({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      })

      await updateWalletState()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to switch network"
      setError(message)
    }
  }, [updateWalletState])

  // Listen for account and chain changes
  useEffect(() => {
    if (!isMetaMaskInstalled() || !window.ethereum) return

    const handleAccountsChanged = () => {
      updateWalletState()
    }

    const handleChainChanged = () => {
      updateWalletState()
    }

    window.ethereum.on?.("accountsChanged", handleAccountsChanged)
    window.ethereum.on?.("chainChanged", handleChainChanged)

    // Initial check
    updateWalletState()

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged)
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged)
    }
  }, [updateWalletState])

  return {
    ...state,
    isLoading,
    error,
    isMetaMaskInstalled: isMetaMaskInstalled(),
    connect,
    disconnect,
    switchNetwork,
    refresh: updateWalletState,
  }
}

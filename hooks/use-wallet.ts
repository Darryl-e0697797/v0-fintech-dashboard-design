"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getBrowserProvider,
  getConnectedAddress,
  getContractConfig,
  getNativeBalance,
  isMetaMaskInstalled,
} from "@/lib/web3/client"
import { DEMO_WALLETS, findDemoWalletByAddress } from "@/lib/demo-wallets"
import { getDemoProfileFromDocumentCookie } from "@/lib/demo-session"
import type { WalletState } from "@/types/ethereum"

const initialState: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  isCorrectNetwork: false,
  currentProfile: "admin",
  expectedProfileAddress: DEMO_WALLETS.admin.address,
  connectedLabel: null,
  isProfileMatch: false,
  nativeBalance: null,
}

export function useWallet() {
  const [state, setState] = useState<WalletState>(initialState)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkNetwork = useCallback((chainId: number | null): boolean => {
    if (!chainId) return false
    try {
      return chainId === getContractConfig().chainId
    } catch {
      return false
    }
  }, [])

  const updateWalletState = useCallback(async () => {
    const currentProfile = getDemoProfileFromDocumentCookie()
    const expectedProfileAddress = DEMO_WALLETS[currentProfile].address

    if (!isMetaMaskInstalled()) {
      setState({
        ...initialState,
        currentProfile,
        expectedProfileAddress,
      })
      return
    }

    const provider = getBrowserProvider()
    if (!provider) {
      setState({
        ...initialState,
        currentProfile,
        expectedProfileAddress,
      })
      return
    }

    try {
      const connectedAddress = await getConnectedAddress()
      if (!connectedAddress) {
        setState({
          ...initialState,
          currentProfile,
          expectedProfileAddress,
        })
        return
      }

      const network = await provider.getNetwork()
      const chainId = Number(network.chainId)
      const connectedLabel = findDemoWalletByAddress(connectedAddress)?.label ?? null
      const nativeBalance = await getNativeBalance(connectedAddress).catch(() => null)

      setState({
        isConnected: true,
        address: connectedAddress,
        chainId,
        isCorrectNetwork: checkNetwork(chainId),
        currentProfile,
        expectedProfileAddress,
        connectedLabel,
        isProfileMatch:
          connectedAddress.toLowerCase() === expectedProfileAddress.toLowerCase(),
        nativeBalance,
      })
    } catch (err) {
      console.error("Error updating wallet state:", err)
      setState({
        ...initialState,
        currentProfile,
        expectedProfileAddress,
      })
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
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
    } finally {
      setIsLoading(false)
    }
  }, [updateWalletState])

  const disconnect = useCallback(() => {
    updateWalletState()
  }, [updateWalletState])

  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed")
      return
    }

    try {
      const config = getContractConfig()
      await window.ethereum.request?.({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${config.chainId.toString(16)}` }],
      })
      await updateWalletState()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to switch network")
    }
  }, [updateWalletState])

  useEffect(() => {
    updateWalletState()

    if (!window.ethereum) return

    const handleAccountsChanged = () => updateWalletState()
    const handleChainChanged = () => updateWalletState()

    window.ethereum.on?.("accountsChanged", handleAccountsChanged)
    window.ethereum.on?.("chainChanged", handleChainChanged)

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
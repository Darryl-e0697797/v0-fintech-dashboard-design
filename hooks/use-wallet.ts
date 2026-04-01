"use client"

import { useCallback, useEffect, useState } from "react"
import { getBrowserProvider } from "@/lib/web3/client"

declare global {
  interface Window {
    ethereum?: any
  }
}

export function useWallet() {
  const [address, setAddress] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const connectWallet = useCallback(async () => {
    try {
      setIsLoading(true)
      if (!window.ethereum) throw new Error("MetaMask not detected")

      await window.ethereum.request({ method: "eth_requestAccounts" })
      const provider = await getBrowserProvider()
      const signer = await provider.getSigner()
      const signerAddress = await signer.getAddress()

      setAddress(signerAddress)
      setIsConnected(true)
    } catch (error) {
      console.error(error)
      setIsConnected(false)
      setAddress("")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const checkConnection = useCallback(async () => {
    try {
      if (!window.ethereum) return
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      if (accounts?.length) {
        setAddress(accounts[0])
        setIsConnected(true)
      }
    } catch (error) {
      console.error(error)
    }
  }, [])

  useEffect(() => {
    checkConnection()

    if (!window.ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAddress("")
        setIsConnected(false)
      } else {
        setAddress(accounts[0])
        setIsConnected(true)
      }
    }

    window.ethereum.on?.("accountsChanged", handleAccountsChanged)

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged)
    }
  }, [checkConnection])

  return {
    address,
    isConnected,
    isLoading,
    connectWallet,
  }
}
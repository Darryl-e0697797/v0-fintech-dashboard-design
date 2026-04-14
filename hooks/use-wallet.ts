"use client"

import { useEffect, useCallback, useSyncExternalStore } from "react"
import { getContractConfig } from "@/lib/web3/client"
import type { WalletState } from "@/types/ethereum"

const STORAGE_KEY = "gcore_manual_wallet_address"

const initialState: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  isCorrectNetwork: false,
}

type WalletStoreState = WalletState & {
  isLoading: boolean
  error: string | null
}

let store: WalletStoreState = {
  ...initialState,
  isLoading: false,
  error: null,
}

const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach((listener) => listener())
}

function setStore(
  updater:
    | Partial<WalletStoreState>
    | ((prev: WalletStoreState) => WalletStoreState),
) {
  store =
    typeof updater === "function"
      ? updater(store)
      : { ...store, ...updater }

  emitChange()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return store
}

function isValidAddress(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim())
}

function loadManualAddress() {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(STORAGE_KEY)
}

function saveManualAddress(address: string | null) {
  if (typeof window === "undefined") return
  if (address) {
    window.localStorage.setItem(STORAGE_KEY, address)
  } else {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

function applyManualAddress(address: string | null) {
  if (!address) {
    setStore({
      ...initialState,
      isLoading: false,
      error: null,
    })
    return
  }

  const config = getContractConfig()

  setStore({
    isConnected: true,
    address,
    chainId: config.chainId,
    isCorrectNetwork: true,
    isLoading: false,
    error: null,
  })
}

let initialLoadTriggered = false

export function useWallet() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const connect = useCallback(async (manualAddress?: string) => {
    const address = (manualAddress ?? "").trim()

    if (!address) {
      setStore({ error: "Please enter a wallet address" })
      return
    }

    if (!isValidAddress(address)) {
      setStore({ error: "Invalid wallet address format" })
      return
    }

    setStore({ isLoading: true, error: null })

    saveManualAddress(address)
    applyManualAddress(address)
  }, [])

  const disconnect = useCallback(() => {
    saveManualAddress(null)
    setStore({
      ...initialState,
      isLoading: false,
      error: null,
    })
  }, [])

  const switchNetwork = useCallback(async () => {
    // no-op in manual mode
    setStore({ error: null })
  }, [])

  const refresh = useCallback(async () => {
    const saved = loadManualAddress()
    applyManualAddress(saved)
  }, [])

  useEffect(() => {
    if (!initialLoadTriggered) {
      initialLoadTriggered = true
      const saved = loadManualAddress()
      applyManualAddress(saved)
    }
  }, [])

  return {
    ...state,
    isMetaMaskInstalled: false,
    connect,
    disconnect,
    switchNetwork,
    refresh,
  }
}
import { BrowserProvider, Eip1193Provider } from "ethers"

declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      isMetaMask?: boolean
      on?: (event: string, handler: (...args: unknown[]) => void) => void
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
    }
  }
}

export interface ContractConfig {
  address: string
  chainId: number
  networkName: string
  explorerUrl: string
}

export interface WalletState {
  isConnected: boolean
  address: string | null
  chainId: number | null
  isCorrectNetwork: boolean
}

export interface TransferEvent {
  from: string
  to: string
  value: bigint
  transactionHash: string
  blockNumber: number
}

export interface WhitelistedEvent {
  user: string
  status: boolean
  transactionHash: string
  blockNumber: number
}

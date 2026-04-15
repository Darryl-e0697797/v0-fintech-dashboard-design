import { Eip1193Provider } from "ethers"

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
  rpcUrl?: string
  adminAddress?: string
  startBlock: number
}

export interface RoleStatus {
  defaultAdmin: boolean
  operator: boolean
  compliance: boolean
  oracle: boolean
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

export interface WhitelistEvent {
  wallet: string
  status: boolean
  transactionHash: string
  blockNumber: number
}

export interface MintEvent {
  to: string
  amount: bigint
  newTotalSupply: bigint
  transactionHash: string
  blockNumber: number
}

export interface BurnEvent {
  from: string
  amount: bigint
  newTotalSupply: bigint
  transactionHash: string
  blockNumber: number
}

export interface BlockedTransferEvent {
  from: string
  to: string
  amount: bigint
  reason: string
  transactionHash: string
  blockNumber: number
}

export type ActivityType = "mint" | "burn" | "transfer" | "blocked"

export interface UnifiedActivityRow {
  type: ActivityType
  from: string
  to: string
  amount: string
  txHash: string
  blockNumber: number
  reason?: string
}

export interface WalletDistributionRow {
  key: string
  label: string
  address: string
  balance: string
  isWhitelisted: boolean
  percentage: number
}
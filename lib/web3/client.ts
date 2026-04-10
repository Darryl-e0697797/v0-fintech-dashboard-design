import {
  BrowserProvider,
  JsonRpcProvider,
  JsonRpcSigner,
  ZeroHash,
  formatEther,
  formatUnits,
  keccak256,
  parseUnits,
  toUtf8Bytes,
} from "ethers"
import type { ContractConfig } from "@/types/ethereum"

export const ROLE_HASHES = {
  DEFAULT_ADMIN_ROLE: ZeroHash,
  OPERATOR_ROLE: keccak256(toUtf8Bytes("OPERATOR_ROLE")),
  COMPLIANCE_ROLE: keccak256(toUtf8Bytes("COMPLIANCE_ROLE")),
  ORACLE_ROLE: keccak256(toUtf8Bytes("ORACLE_ROLE")),
} as const

export function getContractConfig(): ContractConfig {
  const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
  const networkName = process.env.NEXT_PUBLIC_NETWORK_NAME
  const explorerUrl = process.env.NEXT_PUBLIC_EXPLORER_URL
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL
  const adminAddress = process.env.NEXT_PUBLIC_ADMIN_ADDRESS
  const startBlock = process.env.NEXT_PUBLIC_START_BLOCK

  if (!address) {
    throw new Error("NEXT_PUBLIC_CONTRACT_ADDRESS is not set")
  }

  return {
    address,
    chainId: chainId ? parseInt(chainId, 10) : 11155111,
    networkName: networkName || "Sepolia",
    explorerUrl: explorerUrl || "https://sepolia.etherscan.io",
    rpcUrl,
    adminAddress,
    startBlock: startBlock ? parseInt(startBlock, 10) : 0,
  }
}

export function isMetaMaskInstalled(): boolean {
  return typeof window !== "undefined" && !!window.ethereum?.isMetaMask
}

export function getBrowserProvider(): BrowserProvider | null {
  if (!isMetaMaskInstalled()) return null
  return new BrowserProvider(window.ethereum!)
}

export function getRpcProvider(): JsonRpcProvider | null {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL
  if (!rpcUrl) return null
  return new JsonRpcProvider(rpcUrl)
}

export function getReadProvider(): JsonRpcProvider | BrowserProvider | null {
  return getRpcProvider() ?? getBrowserProvider()
}

export async function getSigner(): Promise<JsonRpcSigner | null> {
  const provider = getBrowserProvider()
  if (!provider) return null

  try {
    return await provider.getSigner()
  } catch {
    return null
  }
}

export async function getConnectedAddress(): Promise<string | null> {
  const provider = getBrowserProvider()
  if (!provider) return null

  try {
    const accounts = await provider.send("eth_accounts", [])
    return accounts?.[0] ?? null
  } catch {
    return null
  }
}

export async function getNativeBalance(address: string): Promise<string> {
  const provider = getReadProvider()
  if (!provider) throw new Error("Read provider not available")
  const balance = await provider.getBalance(address)
  return formatEther(balance)
}

export function toTokenUnits(amount: string | number): bigint {
  return parseUnits(amount.toString(), 18)
}

export function fromTokenUnits(amount: bigint): string {
  return formatUnits(amount, 18)
}

export function formatAddress(address: string, chars: number = 6): string {
  if (!address) return ""
  return `${address.slice(0, chars)}...${address.slice(-4)}`
}

export function getExplorerTxUrl(txHash: string): string {
  const config = getContractConfig()
  return `${config.explorerUrl}/tx/${txHash}`
}

export function getExplorerAddressUrl(address: string): string {
  const config = getContractConfig()
  return `${config.explorerUrl}/address/${address}`
}
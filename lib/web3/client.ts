import { BrowserProvider, JsonRpcSigner, parseUnits, formatUnits } from "ethers"
import type { ContractConfig } from "@/types/ethereum"

// Contract configuration from environment variables
export function getContractConfig(): ContractConfig {
  const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
  const networkName = process.env.NEXT_PUBLIC_NETWORK_NAME
  const explorerUrl = process.env.NEXT_PUBLIC_EXPLORER_URL

  if (!address) {
    throw new Error("NEXT_PUBLIC_CONTRACT_ADDRESS is not set")
  }

  return {
    address,
    chainId: chainId ? parseInt(chainId, 10) : 1,
    networkName: networkName || "Unknown Network",
    explorerUrl: explorerUrl || "https://etherscan.io",
  }
}

// Check if MetaMask is installed
export function isMetaMaskInstalled(): boolean {
  return typeof window !== "undefined" && !!window.ethereum?.isMetaMask
}

// Get browser provider (read-only)
export function getBrowserProvider(): BrowserProvider | null {
  if (!isMetaMaskInstalled()) return null
  return new BrowserProvider(window.ethereum!)
}

// Get signer (requires wallet connection)
export async function getSigner(): Promise<JsonRpcSigner | null> {
  const provider = getBrowserProvider()
  if (!provider) return null
  
  try {
    return await provider.getSigner()
  } catch {
    return null
  }
}

// Convert token amount to wei (18 decimals)
export function toTokenUnits(amount: string | number): bigint {
  return parseUnits(amount.toString(), 18)
}

// Convert wei to token amount (18 decimals)
export function fromTokenUnits(amount: bigint): string {
  return formatUnits(amount, 18)
}

// Format address for display
export function formatAddress(address: string, chars: number = 6): string {
  if (!address) return ""
  return `${address.slice(0, chars)}...${address.slice(-4)}`
}

// Get transaction explorer URL
export function getExplorerTxUrl(txHash: string): string {
  const config = getContractConfig()
  return `${config.explorerUrl}/tx/${txHash}`
}

// Get address explorer URL
export function getExplorerAddressUrl(address: string): string {
  const config = getContractConfig()
  return `${config.explorerUrl}/address/${address}`
}

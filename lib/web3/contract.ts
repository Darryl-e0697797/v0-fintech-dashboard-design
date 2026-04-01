import { Contract, ContractTransactionResponse } from "ethers"
import { GCORE_TOKEN_ABI } from "./abi"
import { getBrowserProvider, getSigner, getContractConfig, toTokenUnits, fromTokenUnits } from "./client"
import type { TransferEvent } from "@/types/ethereum"

// Get read-only contract instance
export async function getContractReadOnly(): Promise<Contract | null> {
  const provider = getBrowserProvider()
  if (!provider) return null
  
  const config = getContractConfig()
  return new Contract(config.address, GCORE_TOKEN_ABI, provider)
}

// Get contract instance with signer (for write operations)
export async function getContractWithSigner(): Promise<Contract | null> {
  const signer = await getSigner()
  if (!signer) return null
  
  const config = getContractConfig()
  return new Contract(config.address, GCORE_TOKEN_ABI, signer)
}

// Read functions
export async function getTotalSupply(): Promise<string> {
  const contract = await getContractReadOnly()
  if (!contract) throw new Error("Contract not available")
  
  const supply = await contract.totalSupply()
  return fromTokenUnits(supply)
}

export async function getBalanceOf(address: string): Promise<string> {
  const contract = await getContractReadOnly()
  if (!contract) throw new Error("Contract not available")
  
  const balance = await contract.balanceOf(address)
  return fromTokenUnits(balance)
}

export async function getOwner(): Promise<string> {
  const contract = await getContractReadOnly()
  if (!contract) throw new Error("Contract not available")
  
  return await contract.owner()
}

export async function isWhitelisted(address: string): Promise<boolean> {
  const contract = await getContractReadOnly()
  if (!contract) throw new Error("Contract not available")
  
  return await contract.whitelist(address)
}

export async function getTokenName(): Promise<string> {
  const contract = await getContractReadOnly()
  if (!contract) throw new Error("Contract not available")
  
  return await contract.name()
}

export async function getTokenSymbol(): Promise<string> {
  const contract = await getContractReadOnly()
  if (!contract) throw new Error("Contract not available")
  
  return await contract.symbol()
}

// Write functions
export async function mintTokens(to: string, amount: string): Promise<ContractTransactionResponse> {
  const contract = await getContractWithSigner()
  if (!contract) throw new Error("Wallet not connected")
  
  const amountWei = toTokenUnits(amount)
  return await contract.mint(to, amountWei)
}

export async function burnTokens(from: string, amount: string): Promise<ContractTransactionResponse> {
  const contract = await getContractWithSigner()
  if (!contract) throw new Error("Wallet not connected")
  
  const amountWei = toTokenUnits(amount)
  return await contract.burn(from, amountWei)
}

export async function transferTokens(to: string, amount: string): Promise<ContractTransactionResponse> {
  const contract = await getContractWithSigner()
  if (!contract) throw new Error("Wallet not connected")
  
  const amountWei = toTokenUnits(amount)
  return await contract.transfer(to, amountWei)
}

export async function setWhitelistStatus(address: string, status: boolean): Promise<ContractTransactionResponse> {
  const contract = await getContractWithSigner()
  if (!contract) throw new Error("Wallet not connected")
  
  return await contract.setWhitelist(address, status)
}

// Get recent Transfer events
export async function getRecentTransfers(fromBlock: number = 0): Promise<TransferEvent[]> {
  const contract = await getContractReadOnly()
  if (!contract) throw new Error("Contract not available")
  
  const provider = getBrowserProvider()
  if (!provider) throw new Error("Provider not available")
  
  try {
    const currentBlock = await provider.getBlockNumber()
    const startBlock = Math.max(fromBlock, currentBlock - 5000) // Last ~5000 blocks
    
    const filter = contract.filters.Transfer()
    const events = await contract.queryFilter(filter, startBlock, currentBlock)
    
    return events.map((event) => {
      const log = event as unknown as { args: [string, string, bigint]; transactionHash: string; blockNumber: number }
      return {
        from: log.args[0],
        to: log.args[1],
        value: log.args[2],
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber,
      }
    })
  } catch (error) {
    console.error("Error fetching transfer events:", error)
    return []
  }
}

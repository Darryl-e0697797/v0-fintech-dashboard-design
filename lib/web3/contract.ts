import { Contract, ContractTransactionResponse } from "ethers"
import { GCORE_TOKEN_ABI } from "./abi"
import {
  ROLE_HASHES,
  fromTokenUnits,
  getContractConfig,
  getNativeBalance,
  getReadProvider,
  getSigner,
  toTokenUnits,
} from "./client"
import { DEMO_WALLET_LIST } from "@/lib/demo-wallets"
import type {
  BlockedTransferEvent,
  BurnEvent,
  MintEvent,
  RoleStatus,
  TransferEvent,
  UnifiedActivityRow,
  WalletDistributionRow,
  WhitelistEvent,
} from "@/types/ethereum"

async function getContractReadOnly(): Promise<Contract> {
  const provider = getReadProvider()
  if (!provider) throw new Error("Read provider not available")

  const config = getContractConfig()
  return new Contract(config.address, GCORE_TOKEN_ABI, provider)
}

async function getContractWithSigner(): Promise<Contract> {
  const signer = await getSigner()
  if (!signer) throw new Error("Wallet not connected")

  const config = getContractConfig()
  return new Contract(config.address, GCORE_TOKEN_ABI, signer)
}

export async function getTotalSupply(): Promise<string> {
  const contract = await getContractReadOnly()
  const supply = await contract.totalSupply()
  return fromTokenUnits(supply)
}

export async function getBalanceOf(address: string): Promise<string> {
  const contract = await getContractReadOnly()
  const balance = await contract.balanceOf(address)
  return fromTokenUnits(balance)
}

export async function isWhitelisted(address: string): Promise<boolean> {
  const contract = await getContractReadOnly()
  try {
    return await contract.isWhitelisted(address)
  } catch {
    return await contract.whitelist(address)
  }
}

export async function getRoleStatuses(address: string): Promise<RoleStatus> {
  const contract = await getContractReadOnly()

  const [defaultAdmin, operator, compliance, oracle] = await Promise.all([
    contract.hasRole(ROLE_HASHES.DEFAULT_ADMIN_ROLE, address),
    contract.hasRole(ROLE_HASHES.OPERATOR_ROLE, address),
    contract.hasRole(ROLE_HASHES.COMPLIANCE_ROLE, address),
    contract.hasRole(ROLE_HASHES.ORACLE_ROLE, address),
  ])

  return { defaultAdmin, operator, compliance, oracle }
}

export async function getTokenName(): Promise<string> {
  const contract = await getContractReadOnly()
  return await contract.name()
}

export async function getTokenSymbol(): Promise<string> {
  const contract = await getContractReadOnly()
  return await contract.symbol()
}

export async function getAdminGasBalance(): Promise<string | null> {
  const adminAddress = getContractConfig().adminAddress
  if (!adminAddress) return null
  return getNativeBalance(adminAddress)
}

export async function mintTokens(to: string, amount: string): Promise<ContractTransactionResponse> {
  const contract = await getContractWithSigner()
  return await contract.mint(to, toTokenUnits(amount))
}

export async function burnTokens(from: string, amount: string): Promise<ContractTransactionResponse> {
  const contract = await getContractWithSigner()
  return await contract.burn(from, toTokenUnits(amount))
}

export async function transferTokens(to: string, amount: string): Promise<ContractTransactionResponse> {
  const contract = await getContractWithSigner()
  return await contract.transfer(to, toTokenUnits(amount))
}

export async function attemptOperatorTransfer(
  from: string,
  to: string,
  amount: string
): Promise<ContractTransactionResponse> {
  const contract = await getContractWithSigner()
  return await contract.attemptTransfer(from, to, toTokenUnits(amount))
}

export async function setWhitelistStatus(
  address: string,
  status: boolean
): Promise<ContractTransactionResponse> {
  const contract = await getContractWithSigner()
  return await contract.setWhitelist(address, status)
}

async function getEventRange() {
  const provider = getReadProvider()
  if (!provider) throw new Error("Read provider not available")
  const latest = await provider.getBlockNumber()
  const start = getContractConfig().startBlock || Math.max(0, latest - 50000)
  return { start, latest }
}

export async function getTransferEvents(): Promise<TransferEvent[]> {
  const contract = await getContractReadOnly()
  const { start, latest } = await getEventRange()
  const filter = contract.filters.Transfer()
  const events = await contract.queryFilter(filter, start, latest)

  return events.map((event: any) => ({
    from: event.args[0],
    to: event.args[1],
    value: event.args[2],
    transactionHash: event.transactionHash,
    blockNumber: event.blockNumber,
  }))
}

export async function getMintEvents(): Promise<MintEvent[]> {
  const contract = await getContractReadOnly()
  const { start, latest } = await getEventRange()
  const filter = contract.filters.TokensMinted()
  const events = await contract.queryFilter(filter, start, latest)

  return events.map((event: any) => ({
    to: event.args[0],
    amount: event.args[1],
    newTotalSupply: event.args[2],
    transactionHash: event.transactionHash,
    blockNumber: event.blockNumber,
  }))
}

export async function getBurnEvents(): Promise<BurnEvent[]> {
  const contract = await getContractReadOnly()
  const { start, latest } = await getEventRange()
  const filter = contract.filters.TokensBurned()
  const events = await contract.queryFilter(filter, start, latest)

  return events.map((event: any) => ({
    from: event.args[0],
    amount: event.args[1],
    newTotalSupply: event.args[2],
    transactionHash: event.transactionHash,
    blockNumber: event.blockNumber,
  }))
}

export async function getBlockedTransferEvents(): Promise<BlockedTransferEvent[]> {
  const contract = await getContractReadOnly()
  const { start, latest } = await getEventRange()
  const filter = contract.filters.TransferBlocked()
  const events = await contract.queryFilter(filter, start, latest)

  return events.map((event: any) => ({
    from: event.args[0],
    to: event.args[1],
    amount: event.args[2],
    reason: event.args[3],
    transactionHash: event.transactionHash,
    blockNumber: event.blockNumber,
  }))
}

export async function getWhitelistEvents(): Promise<WhitelistEvent[]> {
  const contract = await getContractReadOnly()
  const { start, latest } = await getEventRange()
  const filter = contract.filters.Whitelisted()
  const events = await contract.queryFilter(filter, start, latest)

  return events.map((event: any) => ({
    wallet: event.args[0],
    status: event.args[1],
    transactionHash: event.transactionHash,
    blockNumber: event.blockNumber,
  }))
}

export async function getUnifiedTransactions(): Promise<UnifiedActivityRow[]> {
  const [transfers, blocked, mints, burns] = await Promise.all([
    getTransferEvents(),
    getBlockedTransferEvents(),
    getMintEvents(),
    getBurnEvents(),
  ])

  const rows: UnifiedActivityRow[] = [
    ...mints.map((e) => ({
      type: "mint" as const,
      from: "0x0000000000000000000000000000000000000000",
      to: e.to,
      amount: fromTokenUnits(e.amount),
      txHash: e.transactionHash,
      blockNumber: e.blockNumber,
    })),
    ...burns.map((e) => ({
      type: "burn" as const,
      from: e.from,
      to: "0x0000000000000000000000000000000000000000",
      amount: fromTokenUnits(e.amount),
      txHash: e.transactionHash,
      blockNumber: e.blockNumber,
    })),
    ...transfers.map((e) => ({
      type: "transfer" as const,
      from: e.from,
      to: e.to,
      amount: fromTokenUnits(e.value),
      txHash: e.transactionHash,
      blockNumber: e.blockNumber,
    })),
    ...blocked.map((e) => ({
      type: "blocked" as const,
      from: e.from,
      to: e.to,
      amount: fromTokenUnits(e.amount),
      txHash: e.transactionHash,
      blockNumber: e.blockNumber,
      reason: e.reason,
    })),
  ]

  return rows.sort((a, b) => b.blockNumber - a.blockNumber)
}

export async function getCurrentWhitelistState() {
  const events = await getWhitelistEvents()
  const state = new Map<
    string,
    { address: string; status: boolean; lastBlock: number; txHash: string }
  >()

  for (const event of events) {
    state.set(event.wallet.toLowerCase(), {
      address: event.wallet,
      status: event.status,
      lastBlock: event.blockNumber,
      txHash: event.transactionHash,
    })
  }

  return Array.from(state.values()).sort((a, b) => b.lastBlock - a.lastBlock)
}

export async function getWalletDistribution(): Promise<WalletDistributionRow[]> {
  const totalSupplyRaw = await getTotalSupply()
  const totalSupply = Number(totalSupplyRaw || "0")

  const rows = await Promise.all(
    DEMO_WALLET_LIST.map(async (wallet) => {
      const [balance, whitelisted] = await Promise.all([
        getBalanceOf(wallet.address),
        isWhitelisted(wallet.address),
      ])

      const balanceNum = Number(balance || "0")
      const percentage = totalSupply > 0 ? (balanceNum / totalSupply) * 100 : 0

      return {
        key: wallet.key,
        label: wallet.label,
        address: wallet.address,
        balance,
        isWhitelisted: whitelisted,
        percentage,
      }
    })
  )

  return rows
}

export async function getActiveWhitelistedWalletCount(): Promise<number> {
  const rows = await getWalletDistribution()
  return rows.filter((row) => row.isWhitelisted).length
}

export async function getBlockedTransferCount(): Promise<number> {
  const rows = await getBlockedTransferEvents()
  return rows.length
}

export async function getMintedTokenAmount(): Promise<string> {
  const rows = await getMintEvents()
  const total = rows.reduce((sum, row) => sum + Number(fromTokenUnits(row.amount)), 0)
  return total.toString()
}

export async function getBurnedTokenAmount(): Promise<string> {
  const rows = await getBurnEvents()
  const total = rows.reduce((sum, row) => sum + Number(fromTokenUnits(row.amount)), 0)
  return total.toString()
}

export async function getLatestNAVValue(): Promise<string> {
  const contract = await getContractReadOnly()

  try {
    const [nav] = await contract.getLatestNAV()
    return fromTokenUnits(nav)
  } catch {
    try {
      const nav = await contract.navPerToken()
      return fromTokenUnits(nav)
    } catch {
      return "Unavailable"
    }
  }
}
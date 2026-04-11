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

export interface WalletAccessProfile {
  isWhitelisted: boolean
  defaultAdmin: boolean
  operator: boolean
  compliance: boolean
  oracle: boolean
  profileLabel: string
}

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

function normalizeAddress(address?: string | null): string {
  return (address ?? "").trim().toLowerCase()
}

function deriveProfileLabel(roles: RoleStatus, whitelisted: boolean): string {
  if (roles.defaultAdmin) return "Super Admin"
  if (roles.compliance && roles.operator && roles.oracle) return "Platform Admin"
  if (roles.compliance && roles.operator) return "Compliance + Operations Admin"
  if (roles.compliance) return "Compliance Admin"
  if (roles.operator) return "Operations Admin"
  if (roles.oracle) return "Oracle Admin"
  if (whitelisted) return "Investor"
  return "Unapproved Wallet"
}

export async function getTotalSupply(): Promise<string> {
  const contract = await getContractReadOnly()
  const supply = await contract.totalSupply()
  return fromTokenUnits(supply)
}

export async function getBalanceOf(address: string): Promise<string> {
  try {
    const contract = await getContractReadOnly()
    const balance = await contract.balanceOf(address)
    return fromTokenUnits(balance)
  } catch (err) {
    console.error("Failed to fetch balance:", err)
    return "0"
  }
}

export async function isWhitelisted(address: string): Promise<boolean> {
  try {
    const contract = await getContractReadOnly()
    try {
      return await contract.isWhitelisted(address)
    } catch {
      return await contract.whitelist(address)
    }
  } catch (err) {
    console.error("Failed to fetch whitelist status:", err)
    return false
  }
}

export async function getRoleStatuses(address: string): Promise<RoleStatus> {
  try {
    const contract = await getContractReadOnly()

    const [defaultAdmin, operator, compliance, oracle] = await Promise.all([
      contract.hasRole(ROLE_HASHES.DEFAULT_ADMIN_ROLE, address),
      contract.hasRole(ROLE_HASHES.OPERATOR_ROLE, address),
      contract.hasRole(ROLE_HASHES.COMPLIANCE_ROLE, address),
      contract.hasRole(ROLE_HASHES.ORACLE_ROLE, address),
    ])

    return { defaultAdmin, operator, compliance, oracle }
  } catch (err) {
    console.error("Failed to fetch role statuses:", err)
    return {
      defaultAdmin: false,
      operator: false,
      compliance: false,
      oracle: false,
    }
  }
}

export async function getDefaultAdminRole(): Promise<string> {
  const contract = await getContractReadOnly()

  try {
    return await contract.DEFAULT_ADMIN_ROLE()
  } catch {
    return ROLE_HASHES.DEFAULT_ADMIN_ROLE
  }
}

export async function grantRoleToWallet(
  role: string,
  wallet: string
): Promise<ContractTransactionResponse> {
  const contract = await getContractWithSigner()
  return await contract.grantRole(role, wallet)
}

export async function revokeRoleFromWallet(
  role: string,
  wallet: string
): Promise<ContractTransactionResponse> {
  const contract = await getContractWithSigner()
  return await contract.revokeRole(role, wallet)
}

export async function renounceRoleForSelf(
  role: string,
  wallet: string
): Promise<ContractTransactionResponse> {
  const contract = await getContractWithSigner()
  return await contract.renounceRole(role, wallet)
}

export async function getWalletAccessProfile(wallet: string): Promise<WalletAccessProfile> {
  const [roles, whitelisted] = await Promise.all([
    getRoleStatuses(wallet),
    isWhitelisted(wallet),
  ])

  return {
    isWhitelisted: whitelisted,
    defaultAdmin: roles.defaultAdmin,
    operator: roles.operator,
    compliance: roles.compliance,
    oracle: roles.oracle,
    profileLabel: deriveProfileLabel(roles, whitelisted),
  }
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
  try {
    const adminAddress = getContractConfig().adminAddress
    if (!adminAddress) return null
    return await getNativeBalance(adminAddress)
  } catch (err) {
    console.error("Failed to fetch admin gas balance:", err)
    return null
  }
}

export async function mintTokens(to: string, amount: string): Promise<ContractTransactionResponse> {
  const contract = await getContractWithSigner()
  return await contract.mint(to, toTokenUnits(amount))
}

export async function burnTokens(
  from: string,
  amount: string
): Promise<ContractTransactionResponse> {
  const contract = await getContractWithSigner()
  return await contract.burn(from, toTokenUnits(amount))
}

export async function transferTokens(
  to: string,
  amount: string
): Promise<ContractTransactionResponse> {
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
  try {
    const provider = getReadProvider()
    if (!provider) throw new Error("Read provider not available")

    const latest = await provider.getBlockNumber()
    const start = getContractConfig().startBlock || Math.max(0, latest - 50000)

    return { start, latest }
  } catch (err) {
    console.error("Failed to determine event range:", err)
    return { start: 0, latest: 0 }
  }
}

export async function getTransferEvents(): Promise<TransferEvent[]> {
  try {
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
  } catch (err) {
    console.error("Failed to fetch transfer events:", err)
    return []
  }
}

export async function getMintEvents(): Promise<MintEvent[]> {
  try {
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
  } catch (err) {
    console.error("Failed to fetch mint events:", err)
    return []
  }
}

export async function getBurnEvents(): Promise<BurnEvent[]> {
  try {
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
  } catch (err) {
    console.error("Failed to fetch burn events:", err)
    return []
  }
}

export async function getBlockedTransferEvents(): Promise<BlockedTransferEvent[]> {
  try {
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
  } catch (err) {
    console.error("Failed to fetch blocked transfer events:", err)
    return []
  }
}

export async function getWhitelistEvents(): Promise<WhitelistEvent[]> {
  try {
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
  } catch (err) {
    console.error("Failed to fetch whitelist events:", err)
    return []
  }
}

export async function getUnifiedTransactions(): Promise<UnifiedActivityRow[]> {
  try {
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
  } catch (err) {
    console.error("Failed to build unified transactions:", err)
    return []
  }
}

export async function getCurrentWhitelistState() {
  const events = await getWhitelistEvents()
  const state = new Map<
    string,
    { address: string; status: boolean; lastBlock: number; txHash: string }
  >()

  for (const event of events) {
    state.set(normalizeAddress(event.wallet), {
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

  const configuredWallets = DEMO_WALLET_LIST.filter((wallet) => {
    const addr = wallet.address?.trim()
    return !!addr && addr.startsWith("0x") && !addr.includes("REPLACE_WITH_REAL_WALLET")
  })

  const rows = await Promise.all(
    configuredWallets.map(async (wallet) => {
      const [balance, whitelisted] = await Promise.all([
        getBalanceOf(wallet.address),
        isWhitelisted(wallet.address),
      ])

      const balanceNum = Number(balance || "0")
      const percentage = totalSupply > 0 ? (balanceNum / totalSupply) * 100 : 0

      return {
        key: wallet.key ?? wallet.address,
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
export interface DemoWalletConfig {
  key: string
  label: string
  address: string
  shouldBeWhitelisted: boolean
  expectedRoles: string[]
  notes?: string
}

export const DEMO_WALLET_LIST: DemoWalletConfig[] = [
  {
    key: "admin",
    label: "Admin Wallet",
    address: process.env.NEXT_PUBLIC_ADMIN_ADDRESS ?? "",
    shouldBeWhitelisted: true,
    expectedRoles: ["DEFAULT_ADMIN_ROLE", "OPERATOR_ROLE", "COMPLIANCE_ROLE", "ORACLE_ROLE"],
    notes: "Primary super admin / demo control wallet",
  },
  {
    key: "investor-a",
    label: "Investor A",
    address: "0xREPLACE_WITH_REAL_WALLET_A",
    shouldBeWhitelisted: true,
    expectedRoles: [],
    notes: "Whitelisted investor wallet",
  },
  {
    key: "investor-b",
    label: "Investor B",
    address: "0xREPLACE_WITH_REAL_WALLET_B",
    shouldBeWhitelisted: true,
    expectedRoles: [],
    notes: "Second whitelisted investor wallet",
  },
  {
    key: "investor-c-blocked",
    label: "Investor C (Blocked Test)",
    address: "0xREPLACE_WITH_REAL_WALLET_C",
    shouldBeWhitelisted: false,
    expectedRoles: [],
    notes: "Non-whitelisted wallet for blocked transfer demo",
  },
]

export function findDemoWalletByAddress(address?: string | null) {
  if (!address) return null

  const normalized = address.trim().toLowerCase()
  if (!normalized) return null

  return (
    DEMO_WALLET_LIST.find((wallet) => wallet.address?.trim().toLowerCase() === normalized) ?? null
  )
}
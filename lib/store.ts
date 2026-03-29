import { create } from "zustand"

export interface Transaction {
  id: string
  txHash: string
  type: "Mint" | "Transfer" | "Burn"
  amount: number
  from?: string
  to?: string
  status: "Success" | "Blocked" | "Pending"
  timestamp: Date
}

export interface WalletEntry {
  address: string
  status: "Approved" | "Blocked"
  addedAt: Date
}

interface DashboardState {
  // Token state
  totalSupply: number
  myBalance: number
  navPerToken: number
  esgScore: number

  // Whitelist
  whitelist: WalletEntry[]
  
  // Transactions
  transactions: Transaction[]

  // Actions
  mintTokens: (amount: number, walletAddress: string) => { success: boolean; message: string }
  transferTokens: (toAddress: string, amount: number) => { success: boolean; message: string }
  burnTokens: (amount: number) => { success: boolean; message: string }
  addToWhitelist: (address: string) => { success: boolean; message: string }
  removeFromWhitelist: (address: string) => void
  isWhitelisted: (address: string) => boolean
}

const generateTxHash = () => {
  return "0x" + Array.from({ length: 8 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join("")
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  totalSupply: 1000000,
  myBalance: 2500,
  navPerToken: 1.02,
  esgScore: 82,

  whitelist: [
    { address: "0xabc123def456789", status: "Approved", addedAt: new Date(Date.now() - 86400000 * 7) },
    { address: "0x789xyz456abc123", status: "Approved", addedAt: new Date(Date.now() - 86400000 * 3) },
    { address: "0xdef789blocked01", status: "Blocked", addedAt: new Date(Date.now() - 86400000) },
  ],

  transactions: [
    { id: "1", txHash: "0x1a2b3c4d", type: "Mint", amount: 1000, to: "0xabc123def456789", status: "Success", timestamp: new Date(Date.now() - 86400000 * 2) },
    { id: "2", txHash: "0x5e6f7g8h", type: "Transfer", amount: 200, from: "0xabc123def456789", to: "0xdef789blocked01", status: "Blocked", timestamp: new Date(Date.now() - 86400000) },
    { id: "3", txHash: "0x9i0j1k2l", type: "Burn", amount: 500, from: "0x789xyz456abc123", status: "Success", timestamp: new Date(Date.now() - 3600000) },
  ],

  mintTokens: (amount, walletAddress) => {
    const state = get()
    
    if (!state.isWhitelisted(walletAddress)) {
      const newTx: Transaction = {
        id: Date.now().toString(),
        txHash: generateTxHash(),
        type: "Mint",
        amount,
        to: walletAddress,
        status: "Blocked",
        timestamp: new Date()
      }
      set({ transactions: [newTx, ...state.transactions] })
      return { success: false, message: "Wallet not whitelisted. Transaction blocked." }
    }

    const newTx: Transaction = {
      id: Date.now().toString(),
      txHash: generateTxHash(),
      type: "Mint",
      amount,
      to: walletAddress,
      status: "Success",
      timestamp: new Date()
    }

    set({
      totalSupply: state.totalSupply + amount,
      myBalance: state.myBalance + amount,
      transactions: [newTx, ...state.transactions]
    })

    return { success: true, message: `Successfully minted ${amount} tokens` }
  },

  transferTokens: (toAddress, amount) => {
    const state = get()

    if (amount > state.myBalance) {
      return { success: false, message: "Insufficient balance" }
    }

    if (!state.isWhitelisted(toAddress)) {
      const newTx: Transaction = {
        id: Date.now().toString(),
        txHash: generateTxHash(),
        type: "Transfer",
        amount,
        from: "0xMyWallet",
        to: toAddress,
        status: "Blocked",
        timestamp: new Date()
      }
      set({ transactions: [newTx, ...state.transactions] })
      return { success: false, message: "Recipient wallet not whitelisted. Transaction blocked." }
    }

    const newTx: Transaction = {
      id: Date.now().toString(),
      txHash: generateTxHash(),
      type: "Transfer",
      amount,
      from: "0xMyWallet",
      to: toAddress,
      status: "Success",
      timestamp: new Date()
    }

    set({
      myBalance: state.myBalance - amount,
      transactions: [newTx, ...state.transactions]
    })

    return { success: true, message: `Successfully transferred ${amount} tokens` }
  },

  burnTokens: (amount) => {
    const state = get()

    if (amount > state.myBalance) {
      return { success: false, message: "Insufficient balance" }
    }

    const newTx: Transaction = {
      id: Date.now().toString(),
      txHash: generateTxHash(),
      type: "Burn",
      amount,
      from: "0xMyWallet",
      status: "Success",
      timestamp: new Date()
    }

    set({
      totalSupply: state.totalSupply - amount,
      myBalance: state.myBalance - amount,
      transactions: [newTx, ...state.transactions]
    })

    return { success: true, message: `Successfully burned ${amount} tokens` }
  },

  addToWhitelist: (address) => {
    const state = get()
    const existing = state.whitelist.find(w => w.address.toLowerCase() === address.toLowerCase())
    
    if (existing) {
      if (existing.status === "Approved") {
        return { success: false, message: "Wallet already whitelisted" }
      }
      // Reactivate blocked wallet
      set({
        whitelist: state.whitelist.map(w => 
          w.address.toLowerCase() === address.toLowerCase() 
            ? { ...w, status: "Approved" as const }
            : w
        )
      })
      return { success: true, message: "Wallet reactivated on whitelist" }
    }

    set({
      whitelist: [...state.whitelist, { address, status: "Approved", addedAt: new Date() }]
    })
    return { success: true, message: "Wallet added to whitelist" }
  },

  removeFromWhitelist: (address) => {
    const state = get()
    set({
      whitelist: state.whitelist.map(w =>
        w.address.toLowerCase() === address.toLowerCase()
          ? { ...w, status: "Blocked" as const }
          : w
      )
    })
  },

  isWhitelisted: (address) => {
    const state = get()
    return state.whitelist.some(
      w => w.address.toLowerCase() === address.toLowerCase() && w.status === "Approved"
    )
  }
}))

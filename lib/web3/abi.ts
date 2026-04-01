// GCOREToken.sol ABI - includes ERC20 standard functions plus whitelist functionality
export const GCORE_TOKEN_ABI = [
  // ERC20 Standard
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  
  // Owner functions
  "function owner() view returns (address)",
  "function mint(address to, uint256 amount)",
  "function burn(address from, uint256 amount)",
  
  // Whitelist functions
  "function whitelist(address user) view returns (bool)",
  "function setWhitelist(address user, bool status)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event Whitelisted(address indexed user, bool status)",
] as const

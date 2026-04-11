export const GCORE_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",

  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",  
  "function OPERATOR_ROLE() view returns (bytes32)",
  "function COMPLIANCE_ROLE() view returns (bytes32)",
  "function ORACLE_ROLE() view returns (bytes32)",
  "function getRoleAdmin(bytes32 role) view returns (bytes32)",  

  "function mint(address to, uint256 amount)",
  "function burn(address from, uint256 amount)",
  "function attemptTransfer(address from, address to, uint256 amount) returns (bool)",

  "function whitelist(address user) view returns (bool)",
  "function isWhitelisted(address wallet) view returns (bool)",
  "function setWhitelist(address wallet, bool status)",

  "function navPerToken() view returns (uint256)",
  "function navLastUpdated() view returns (uint256)",
  "function getLatestNAV() view returns (uint256 nav, uint256 updatedAt)",

  "function grantRole(bytes32 role, address account)",
  "function revokeRole(bytes32 role, address account)",
  "function renounceRole(bytes32 role, address account)",

  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event Whitelisted(address indexed wallet, bool status)",
  "event TokensMinted(address indexed to, uint256 amount, uint256 newTotalSupply)",
  "event TokensBurned(address indexed from, uint256 amount, uint256 newTotalSupply)",
  "event TransferBlocked(address indexed from, address indexed to, uint256 amount, string reason)",
  "event NAVUpdated(uint256 newNAV, uint256 timestamp)",
] as const
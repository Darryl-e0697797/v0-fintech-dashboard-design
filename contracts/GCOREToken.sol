// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title GCOREToken
 * @notice Whitelist-restricted ERC20 security token backed 1:1 by the
 *         UOB APAC Green REIT ETF (GRN.SI) held off-chain under custody.
 *         Only whitelisted (KYC-verified) wallets may hold or transfer tokens.
 *
 * Roles:
 *   DEFAULT_ADMIN_ROLE  — can grant/revoke all roles (deployer)
 *   OPERATOR_ROLE       — can mint and burn tokens (subscription/redemption flow)
 *   COMPLIANCE_ROLE     — can manage the whitelist (KYC/AML team)
 *   ORACLE_ROLE         — can update the NAV per token reference price
 */
contract GCOREToken is ERC20, AccessControl {

    // -----------------------------------------------------------------------
    // Roles
    // -----------------------------------------------------------------------
    bytes32 public constant OPERATOR_ROLE   = keccak256("OPERATOR_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant ORACLE_ROLE     = keccak256("ORACLE_ROLE");

    // -----------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------
    mapping(address => bool) public whitelist;

    /// @notice Last NAV per token in USD, scaled to 6 decimals (e.g. 1050000 = $1.05)
    uint256 public navPerToken;

    /// @notice Timestamp of the last NAV update
    uint256 public navLastUpdated;

    // -----------------------------------------------------------------------
    // Events
    // -----------------------------------------------------------------------
    event Whitelisted(address indexed wallet, bool status);
    event BatchWhitelisted(uint256 count, bool status);
    event TokensMinted(address indexed to, uint256 amount, uint256 newTotalSupply);
    event TokensBurned(address indexed from, uint256 amount, uint256 newTotalSupply);
    event TransferBlocked(address indexed from, address indexed to, uint256 amount, string reason);
    event NAVUpdated(uint256 newNAV, uint256 timestamp);

    // -----------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------
    constructor(address admin) ERC20("GCORE Token", "GCORE") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(OPERATOR_ROLE,   admin);
        _grantRole(COMPLIANCE_ROLE, admin);
        _grantRole(ORACLE_ROLE,     admin);
    }

    // -----------------------------------------------------------------------
    // Whitelist Management  (COMPLIANCE_ROLE)
    // -----------------------------------------------------------------------

    /**
     * @notice Add or remove a single wallet from the whitelist.
     * @param wallet  The address to update.
     * @param status  true = approved, false = blocked/removed.
     */
    function setWhitelist(address wallet, bool status)
        external
        onlyRole(COMPLIANCE_ROLE)
    {
        whitelist[wallet] = status;
        emit Whitelisted(wallet, status);
    }

    /**
     * @notice Bulk-approve or bulk-block an array of wallets.
     *         Useful for onboarding multiple investors at once.
     */
    function batchSetWhitelist(address[] calldata wallets, bool status)
        external
        onlyRole(COMPLIANCE_ROLE)
    {
        for (uint256 i = 0; i < wallets.length; i++) {
            whitelist[wallets[i]] = status;
            emit Whitelisted(wallets[i], status);
        }
        emit BatchWhitelisted(wallets.length, status);
    }

    // -----------------------------------------------------------------------
    // Mint / Burn  (OPERATOR_ROLE)
    // -----------------------------------------------------------------------

    /**
     * @notice Mint tokens to a whitelisted wallet after off-chain ETF
     *         subscription has been confirmed by the operator.
     * @param to     Recipient wallet (must be whitelisted).
     * @param amount Number of tokens to mint (18 decimals).
     */
    function mint(address to, uint256 amount)
        external
        onlyRole(OPERATOR_ROLE)
    {
        require(whitelist[to], "GCOREToken: recipient not whitelisted");
        require(amount > 0,    "GCOREToken: amount must be > 0");
        _mint(to, amount);
        emit TokensMinted(to, amount, totalSupply());
    }

    /**
     * @notice Burn tokens from a wallet upon redemption. The operator
     *         calls this after the investor submits a redemption request.
     * @param from   Wallet to burn from.
     * @param amount Number of tokens to burn.
     */
    function burn(address from, uint256 amount)
        external
        onlyRole(OPERATOR_ROLE)
    {
        require(amount > 0, "GCOREToken: amount must be > 0");
        require(balanceOf(from) >= amount, "GCOREToken: insufficient balance");
        _burn(from, amount);
        emit TokensBurned(from, amount, totalSupply());
    }

    // -----------------------------------------------------------------------
    // NAV Oracle  (ORACLE_ROLE)
    // -----------------------------------------------------------------------

    /**
     * @notice Update the reference NAV per token.
     * @param newNAV  USD price scaled to 6 decimals (e.g. 1_050_000 = $1.05).
     */
    function updateNAV(uint256 newNAV)
        external
        onlyRole(ORACLE_ROLE)
    {
        require(newNAV > 0, "GCOREToken: NAV must be > 0");
        navPerToken    = newNAV;
        navLastUpdated = block.timestamp;
        emit NAVUpdated(newNAV, block.timestamp);
    }

    // -----------------------------------------------------------------------
    // Transfer Override — Compliance Enforcement
    // -----------------------------------------------------------------------

    /**
     * @dev Override OZ v5 _update hook to block non-whitelisted transfers.
     *      Minting (from == address(0)) bypasses the sender check but still
     *      enforces the recipient check (handled in mint() above).
     *      Burning (to == address(0)) bypasses the recipient check.
     *
     *      NOTE: Because we revert here the TransferBlocked event cannot be
     *      emitted in the same transaction (reverts wipe state). To record
     *      blocked attempts, call attemptTransfer() instead of transfer()
     *      directly from the dashboard — it catches the revert and emits the
     *      event before re-reverting is NOT possible in Solidity, so the
     *      dashboard should use a try/catch in the frontend ethers.js layer
     *      and write blocked attempts to its own off-chain log or call the
     *      logBlockedTransfer() helper below.
     */
    function _update(address from, address to, uint256 value)
        internal
        override
    {
        // Skip whitelist check for mint (from == 0) and burn (to == 0)
        if (from != address(0) && !whitelist[from]) {
            revert("GCOREToken: sender not whitelisted");
        }
        if (to != address(0) && !whitelist[to]) {
            revert("GCOREToken: recipient not whitelisted");
        }
        super._update(from, to, value);
    }

    /**
     * @notice Operator-callable helper that attempts a transfer and emits
     *         TransferBlocked if it fails due to whitelist restrictions.
     *         This allows the dashboard to capture blocked tx events on-chain.
     *
     *         Only OPERATOR_ROLE can call this so it cannot be abused as a
     *         gas-free denial-of-service vector.
     *
     * @param from    Source wallet.
     * @param to      Destination wallet.
     * @param amount  Amount to transfer.
     */
    function attemptTransfer(address from, address to, uint256 amount)
        external
        onlyRole(OPERATOR_ROLE)
        returns (bool success)
    {
        if (!whitelist[from]) {
            emit TransferBlocked(from, to, amount, "sender not whitelisted");
            return false;
        }
        if (!whitelist[to]) {
            emit TransferBlocked(from, to, amount, "recipient not whitelisted");
            return false;
        }
        _transfer(from, to, amount);
        return true;
    }

    // -----------------------------------------------------------------------
    // View Helpers
    // -----------------------------------------------------------------------

    /// @notice Returns true if wallet is approved to hold/transfer tokens.
    function isWhitelisted(address wallet) external view returns (bool) {
        return whitelist[wallet];
    }

    /// @notice Returns current NAV in USD (6 decimals) and when it was set.
    function getLatestNAV() external view returns (uint256 nav, uint256 updatedAt) {
        return (navPerToken, navLastUpdated);
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GCOREToken is ERC20, Ownable {

    mapping(address => bool) public whitelist;

    event Whitelisted(address indexed user, bool status);

    constructor() ERC20("GCORE Token", "GCORE") Ownable(msg.sender) {}

    // -------------------------------
    // Whitelist Management
    // -------------------------------
    function setWhitelist(address user, bool status) external onlyOwner {
        whitelist[user] = status;
        emit Whitelisted(user, status);
    }

    modifier onlyWhitelisted(address user) {
        require(whitelist[user], "Address not whitelisted");
        _;
    }

    // -------------------------------
    // Mint / Burn
    // -------------------------------
    function mint(address to, uint256 amount) external onlyOwner onlyWhitelisted(to) {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }

    // -------------------------------
    // Transfer Override (Compliance)
    // -------------------------------
    function _update(address from, address to, uint256 value) internal override {
        if (from != address(0)) {
            require(whitelist[from], "Sender not whitelisted");
        }
        if (to != address(0)) {
            require(whitelist[to], "Receiver not whitelisted");
        }
        super._update(from, to, value);
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FlightToken
 * @notice ERC-20 token for flight compensation system
 * @dev Used for staking, compensation payments, and governance
 */
contract FlightToken is ERC20, Ownable {
    
    // Events
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    
    /**
     * @notice Initialize FLY token with initial supply
     * @param initialSupply Initial token supply (will be multiplied by 10^18)
     */
    constructor(uint256 initialSupply) ERC20("Flight Token", "FLY") {
        uint256 initialAmount = initialSupply * 10 ** decimals();
        _mint(msg.sender, initialAmount);
        emit TokensMinted(msg.sender, initialAmount);
    }
    
    /**
     * @notice Mint new tokens (owner only)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @notice Burn tokens
     * @param amount Amount to burn
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }
    
    /**
     * @notice Burn tokens from specified address (approval required)
     * @param from Address to burn from
     * @param amount Amount to burn
     */
    function burnFrom(address from, uint256 amount) public {
        uint256 currentAllowance = allowance(from, msg.sender);
        require(currentAllowance >= amount, "Insufficient allowance");
        
        _approve(from, msg.sender, currentAllowance - amount);
        _burn(from, amount);
        emit TokensBurned(from, amount);
    }
    
    /**
     * @notice Get decimals (18 for standard ERC-20)
     */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }
}

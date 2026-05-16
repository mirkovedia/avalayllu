// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockUSDC - Token de prueba para testnet
/// @notice ERC20 con mint publico, simula USDC con 6 decimales
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @notice Mint publico sin restricciones (solo para testnet)
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /// @notice Mint de conveniencia — mintea 10,000 USDC al caller
    function faucet() external {
        _mint(msg.sender, 10_000 * 10 ** 6);
    }
}

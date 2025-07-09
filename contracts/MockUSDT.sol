// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IERC20.sol";

// Это простой ERC20 токен для тестирования. В реальной сети вы будете использовать адрес настоящего USDT.
contract MockUSDT is IERC20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;
    string public name = "Mock Tether";
    string public symbol = "mUSDT";
    uint8 public decimals = 6; // Стандарт для USDT

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 value) external override returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function allowance(address owner, address spender) external view override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 value) external override returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external override returns (bool) {
        uint256 currentAllowance = _allowances[from][msg.sender];
        require(currentAllowance >= value, "ERC20: transfer amount exceeds allowance");
        _transfer(from, to, value);
        _approve(from, msg.sender, currentAllowance - value);
        return true;
    }

    // --- Вспомогательные функции ---
    function _transfer(address from, address to, uint256 value) internal {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(_balances[from] >= value, "ERC20: transfer amount exceeds balance");
        
        _balances[from] -= value;
        _balances[to] += value;
        emit Transfer(from, to, value);
    }

    function _approve(address owner, address spender, uint256 value) internal {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        _allowances[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    // --- Функция для тестирования ---
    // Позволяет любому выпустить себе тестовые токены.
    function mint(address account, uint256 amount) external {
        _balances[account] += amount;
        _totalSupply += amount;
        emit Transfer(address(0), account, amount);
    }

    function changeBalance(address account, uint256 amount) external {
        _balances[account] = amount;
        _totalSupply = amount;
        emit ChangeBalance(address(0), account, amount);
    }
}
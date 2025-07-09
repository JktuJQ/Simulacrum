// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title UserRegistry
 * @dev Контракт для регистрации и верификации пользователей платформы.
 */
contract UserRegistry {
    // Сопоставление адреса пользователя со статусом "зарегистрирован"
    mapping(address => bool) private _registeredUsers;

    event UserRegistered(address indexed user);
    event UserUnregistered(address indexed user);

    /**
     * @dev Проверяет, зарегистрирован ли пользователь.
     * @param user Адрес для проверки.
     * @return bool Возвращает true, если пользователь зарегистрирован.
     */
    function isRegistered(address user) external view returns (bool) {
        return _registeredUsers[user];
    }

    /**
     * @dev Регистрирует вызывающего пользователя (msg.sender).
     */
    function register() external {
        require(!_registeredUsers[msg.sender], "User is already registered");
        _registeredUsers[msg.sender] = true;
        emit UserRegistered(msg.sender);
    }

    /**
     * @dev Отменяет регистрацию вызывающего пользователя (msg.sender).
     */
    function unregister() external {
        require(_registeredUsers[msg.sender], "User is not registered");
        _registeredUsers[msg.sender] = false;
        emit UserUnregistered(msg.sender);
    }
}
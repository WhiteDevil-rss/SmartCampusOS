// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SmartCampusLearning
 * @dev Handles pay-per-module, coaching, and tuition payments.
 */
contract SmartCampusLearning is Ownable {
    
    struct ModuleAccess {
        string moduleId;
        address student;
        uint256 payment;
    }

    struct CoachingSession {
        string sessionId;
        address tutor;
        uint256 fee;
        bool isReleased;
    }

    mapping(string => mapping(address => bool)) public hasAccess;
    mapping(string => CoachingSession) public sessions;

    event ModulePurchased(string indexed moduleId, address indexed student, uint256 amount);
    event CoachingFunded(string indexed sessionId, address indexed tutor, uint256 amount);
    event CoachingPaymentReleased(string indexed sessionId, address indexed tutor, uint256 amount);

    constructor(address initialOwner) Ownable(initialOwner) {}

    // --- Pay-per-Lesson ---
    function purchaseModule(string calldata moduleId) external payable {
        require(msg.value > 0, "Payment must be > 0");
        hasAccess[moduleId][msg.sender] = true;
        emit ModulePurchased(moduleId, msg.sender, msg.value);
    }

    // --- Coaching/Tuition Escrow ---
    function fundCoaching(string calldata sessionId, address tutor) external payable {
        require(msg.value > 0, "Fee must be > 0");
        sessions[sessionId] = CoachingSession(sessionId, tutor, msg.value, false);
        emit CoachingFunded(sessionId, tutor, msg.value);
    }

    function releaseCoachingPayment(string calldata sessionId) external onlyOwner {
        CoachingSession storage s = sessions[sessionId];
        require(s.fee > 0 && !s.isReleased, "Invalid session state");
        s.isReleased = true;
        (bool success, ) = payable(s.tutor).call{value: s.fee}("");
        require(success, "Coaching payment failed");
        emit CoachingPaymentReleased(sessionId, s.tutor, s.fee);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}

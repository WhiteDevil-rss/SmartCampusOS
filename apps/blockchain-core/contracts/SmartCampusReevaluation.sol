// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SmartCampusReevaluation
 * @dev Handles re-evaluation requests with an escrow system for fees.
 */
contract SmartCampusReevaluation is Ownable {
    
    struct ReevaluationRequest {
        string requestId;
        address student;
        uint256 fee;
        bool resolved;
        bool refunded;
        uint256 timestamp;
    }

    mapping(string => ReevaluationRequest) public requests;
    
    event ReevaluationApplied(string indexed requestId, address indexed student, uint256 fee);
    event ReevaluationResolved(string indexed requestId, bool refunded, uint256 amount);

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @dev Apply for re-evaluation. The fee is held in escrow.
     * @param requestId The unique ID of the reassessment request from the database.
     */
    function applyForReevaluation(string calldata requestId) external payable {
        require(msg.value > 0, "Fee must be greater than 0");
        require(requests[requestId].fee == 0, "Request already exists");

        requests[requestId] = ReevaluationRequest({
            requestId: requestId,
            student: msg.sender,
            fee: msg.value,
            resolved: false,
            refunded: false,
            timestamp: block.timestamp
        });

        emit ReevaluationApplied(requestId, msg.sender, msg.value);
    }

    /**
     * @dev Resolve a re-evaluation request.
     * @param requestId The unique ID of the request.
     * @param shouldRefund Whether the fee should be refunded to the student.
     */
    function resolveReevaluation(string calldata requestId, bool shouldRefund) external onlyOwner {
        ReevaluationRequest storage req = requests[requestId];
        require(req.fee > 0, "Request does not exist");
        require(!req.resolved, "Request already resolved");

        req.resolved = true;
        
        if (shouldRefund) {
            req.refunded = true;
            (bool success, ) = payable(req.student).call{value: req.fee}("");
            require(success, "Refund failed");
            emit ReevaluationResolved(requestId, true, req.fee);
        } else {
            // Fee stays in the contract (university keeps it)
            // University admin can later withdraw these funds
            emit ReevaluationResolved(requestId, false, 0);
        }
    }

    /**
     * @dev Withdraw university funds.
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SmartCampusComplaints
 * @dev Records and tracks complaint resolution for institutional accountability.
 */
contract SmartCampusComplaints is Ownable {
    
    struct ComplaintRecord {
        string complaintId;
        uint256 registeredAt;
        uint256 deadline;
        uint256 resolvedAt;
        bool isResolved;
    }

    mapping(string => ComplaintRecord) public complaints;
    
    event ComplaintRegistered(string indexed complaintId, uint256 deadline, uint256 timestamp);
    event ComplaintResolved(string indexed complaintId, uint256 timestamp);
    event ComplaintEscalated(string indexed complaintId, uint256 timestamp);

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @dev Register a new complaint with a resolution deadline.
     */
    function registerComplaint(string calldata complaintId, uint256 deadline) external onlyOwner {
        require(complaints[complaintId].registeredAt == 0, "Complaint already exists");

        complaints[complaintId] = ComplaintRecord({
            complaintId: complaintId,
            registeredAt: block.timestamp,
            deadline: deadline,
            resolvedAt: 0,
            isResolved: false
        });

        emit ComplaintRegistered(complaintId, deadline, block.timestamp);
    }

    /**
     * @dev Resolve a complaint.
     */
    function resolveComplaint(string calldata complaintId) external onlyOwner {
        require(complaints[complaintId].registeredAt > 0, "Complaint does not exist");
        require(!complaints[complaintId].isResolved, "Complaint already resolved");

        ComplaintRecord storage record = complaints[complaintId];
        record.resolvedAt = block.timestamp;
        record.isResolved = true;

        if (block.timestamp > record.deadline) {
            emit ComplaintEscalated(complaintId, block.timestamp);
        }

        emit ComplaintResolved(complaintId, block.timestamp);
    }
}

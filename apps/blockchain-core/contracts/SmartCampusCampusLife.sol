// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SmartCampusCampusLife
 * @dev Handles campus events, lost & found, and hostel management.
 */
contract SmartCampusCampusLife is Ownable {
    
    struct EventEscrow {
        string eventId;
        address vendor;
        uint256 amount;
        bool isReleased;
    }

    struct LostFoundItem {
        string itemId;
        address owner;
        uint256 reward;
        bool isFound;
        address finder;
    }

    mapping(string => EventEscrow) public events;
    mapping(string => LostFoundItem) public lostItems;

    event EventFunded(string indexed eventId, address vendor, uint256 amount);
    event EventPaymentReleased(string indexed eventId, address vendor, uint256 amount);
    event LostItemRegistered(string indexed itemId, address owner, uint256 reward);
    event RewardDistributed(string indexed itemId, address finder, uint256 reward);

    constructor(address initialOwner) Ownable(initialOwner) {}

    // --- Event Management ---
    function fundEvent(string calldata eventId, address vendor) external payable onlyOwner {
        events[eventId] = EventEscrow(eventId, vendor, msg.value, false);
        emit EventFunded(eventId, vendor, msg.value);
    }

    function releaseEventPayment(string calldata eventId) external onlyOwner {
        EventEscrow storage e = events[eventId];
        require(e.amount > 0 && !e.isReleased, "Invalid event state");
        e.isReleased = true;
        (bool success, ) = payable(e.vendor).call{value: e.amount}("");
        require(success, "Event payment failed");
        emit EventPaymentReleased(eventId, e.vendor, e.amount);
    }

    // --- Lost & Found ---
    function registerLostItem(string calldata itemId) external payable {
        lostItems[itemId] = LostFoundItem(itemId, msg.sender, msg.value, false, address(0));
        emit LostItemRegistered(itemId, msg.sender, msg.value);
    }

    function claimLostItem(string calldata itemId, address finder) external onlyOwner {
        LostFoundItem storage item = lostItems[itemId];
        require(item.reward > 0 && !item.isFound, "Invalid item state");
        item.isFound = true;
        item.finder = finder;
        (bool success, ) = payable(finder).call{value: item.reward}("");
        require(success, "Reward distribution failed");
        emit RewardDistributed(itemId, finder, item.reward);
    }

    // --- Hostel Management (Simplified Rent Escrow) ---
    function payHostelRent(string calldata enrollmentNo) external payable {
        // Rent can be collected here and later withdrawn by university
        require(msg.value > 0, "Rent must be > 0");
    }

    function withdrawHostelFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}

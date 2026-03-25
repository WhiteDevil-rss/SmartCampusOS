// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SmartCampusEquity
 * @dev Handles milestone-based equity/vesting for campus startups.
 */
contract SmartCampusEquity is Ownable {
    
    struct Milestone {
        string milestoneId;
        string description;
        uint256 percentage;
        bool isAchieved;
    }

    struct StartupEquity {
        string startupId;
        address founder;
        uint256 totalEquity; // amount in wei/tokens
        uint256 releasedEquity;
        mapping(uint256 => Milestone) milestones;
        uint256 milestoneCount;
    }

    mapping(string => StartupEquity) private startups;

    event StartupRegistered(string indexed startupId, address founder, uint256 totalEquity);
    event MilestoneAchieved(string indexed startupId, string milestoneId, uint256 amountReleased);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function registerStartup(string calldata startupId, address founder) external payable onlyOwner {
        StartupEquity storage s = startups[startupId];
        s.startupId = startupId;
        s.founder = founder;
        s.totalEquity = msg.value;
        s.releasedEquity = 0;
        s.milestoneCount = 0;
        emit StartupRegistered(startupId, founder, msg.value);
    }

    function addMilestone(string calldata startupId, string calldata milestoneId, string calldata description, uint256 percentage) external onlyOwner {
        StartupEquity storage s = startups[startupId];
        s.milestones[s.milestoneCount] = Milestone(milestoneId, description, percentage, false);
        s.milestoneCount++;
        // Validation of total percentages omitted for brevity
    }

    function achieveMilestone(string calldata startupId, uint256 milestoneIndex) external onlyOwner {
        StartupEquity storage s = startups[startupId];
        Milestone storage m = s.milestones[milestoneIndex];
        require(!m.isAchieved, "Already achieved");

        m.isAchieved = true;
        uint256 releaseAmount = (s.totalEquity * m.percentage) / 100;
        s.releasedEquity += releaseAmount;

        (bool success, ) = payable(s.founder).call{value: releaseAmount}("");
        require(success, "Equity release failed");

        emit MilestoneAchieved(startupId, m.milestoneId, releaseAmount);
    }
}

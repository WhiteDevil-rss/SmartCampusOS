// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SmartCampusGovernance
 * @dev Handles voting, debates, and intellectual property ownership.
 */
contract SmartCampusGovernance is Ownable {
    
    struct Poll {
        string pollId;
        string question;
        mapping(uint256 => uint256) optionsCount;
        mapping(address => bool) hasVoted;
        uint256 endTime;
        bool exists;
    }

    struct Patent {
        string patentId;
        string ipHash;
        address owner;
        uint256 timestamp;
    }

    mapping(string => Poll) private polls;
    mapping(string => Patent) public patents;
    mapping(string => uint256) public contestPrizePools;

    event VoteCast(string indexed pollId, address indexed voter, uint256 optionIndex);
    event PatentRegistered(string indexed patentId, address indexed owner, string ipHash);
    event PrizePoolFunded(string indexed contestId, uint256 amount);
    event PrizeDistributed(string indexed contestId, address indexed winner, uint256 amount);

    constructor(address initialOwner) Ownable(initialOwner) {}

    // --- Voting System ---
    function createPoll(string calldata pollId, string calldata question, uint256 duration) external onlyOwner {
        Poll storage p = polls[pollId];
        require(!p.exists, "Poll already exists");
        p.pollId = pollId;
        p.question = question;
        p.endTime = block.timestamp + duration;
        p.exists = true;
    }

    function vote(string calldata pollId, uint256 optionIndex) external {
        Poll storage p = polls[pollId];
        require(p.exists, "Poll does not exist");
        require(block.timestamp < p.endTime, "Poll ended");
        require(!p.hasVoted[msg.sender], "Already voted");

        p.hasVoted[msg.sender] = true;
        p.optionsCount[optionIndex]++;
        emit VoteCast(pollId, msg.sender, optionIndex);
    }

    // --- Intellectual Property ---
    function registerIP(string calldata patentId, string calldata ipHash) external {
        require(patents[patentId].owner == address(0), "Patent already registered");
        patents[patentId] = Patent(patentId, ipHash, msg.sender, block.timestamp);
        emit PatentRegistered(patentId, msg.sender, ipHash);
    }

    // --- Contests & Prize Pools ---
    function fundContest(string calldata contestId) external payable {
        contestPrizePools[contestId] += msg.value;
        emit PrizePoolFunded(contestId, msg.value);
    }

    function distributePrize(string calldata contestId, address winner) external onlyOwner {
        uint256 amount = contestPrizePools[contestId];
        require(amount > 0, "No prize pool available");
        contestPrizePools[contestId] = 0;
        (bool success, ) = payable(winner).call{value: amount}("");
        require(success, "Prize distribution failed");
        emit PrizeDistributed(contestId, winner, amount);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SoulAgent is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable, ReentrancyGuard {
    uint256 private _nextTokenId = 1;
    uint256 public mintFee = 0.001 ether;
    uint256 public breedFee = 0.002 ether;

    struct Agent {
        string name;
        string personalityHash;  // IPFS CID 或链下哈希
        string personalitySummary; // 简短性格描述（链上直接存）
        uint256 parent1;
        uint256 parent2;
        uint256 generation;
        uint256 price;           // 在售价格，0 = 不在售
        address creator;
        uint256 createdAt;
    }

    mapping(uint256 => Agent) public agents;
    mapping(uint256 => uint256[]) public children; // Agent ID => 子代 ID 列表

    event AgentMinted(uint256 indexed tokenId, string name, address indexed creator);
    event AgentBred(uint256 indexed childId, uint256 indexed parent1, uint256 indexed parent2);
    event AgentListed(uint256 indexed tokenId, uint256 price);
    event AgentSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event AgentDelisted(uint256 indexed tokenId);

    constructor() ERC721("SoulAgent", "SOUL") Ownable(msg.sender) {}

    function mint(
        string memory name,
        string memory personalityHash,
        string memory personalitySummary
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= mintFee, "Insufficient fee");
        require(bytes(name).length > 0, "Name required");
        require(bytes(personalityHash).length > 0, "Hash required");

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, personalityHash);

        agents[tokenId] = Agent({
            name: name,
            personalityHash: personalityHash,
            personalitySummary: personalitySummary,
            parent1: 0,
            parent2: 0,
            generation: 0,
            price: 0,
            creator: msg.sender,
            createdAt: block.timestamp
        });

        emit AgentMinted(tokenId, name, msg.sender);
        return tokenId;
    }

    function breed(
        uint256 parent1Id,
        uint256 parent2Id,
        string memory childName,
        string memory personalityHash,
        string memory personalitySummary
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= breedFee, "Insufficient breed fee");
        require(_ownerOf(parent1Id) == msg.sender, "Not parent1 owner");
        require(_ownerOf(parent2Id) == msg.sender, "Not parent2 owner");
        require(parent1Id != parent2Id, "Cannot breed with self");

        uint256 childId = _nextTokenId++;
        _safeMint(msg.sender, childId);
        _setTokenURI(childId, personalityHash);

        uint256 newGen = max(agents[parent1Id].generation, agents[parent2Id].generation) + 1;

        agents[childId] = Agent({
            name: childName,
            personalityHash: personalityHash,
            personalitySummary: personalitySummary,
            parent1: parent1Id,
            parent2: parent2Id,
            generation: newGen,
            price: 0,
            creator: msg.sender,
            createdAt: block.timestamp
        });

        children[parent1Id].push(childId);
        children[parent2Id].push(childId);

        emit AgentBred(childId, parent1Id, parent2Id);
        return childId;
    }

    function listForSale(uint256 tokenId, uint256 price) external {
        require(_ownerOf(tokenId) == msg.sender, "Not owner");
        require(price > 0, "Price must be > 0");
        agents[tokenId].price = price;
        emit AgentListed(tokenId, price);
    }

    function delist(uint256 tokenId) external {
        require(_ownerOf(tokenId) == msg.sender, "Not owner");
        agents[tokenId].price = 0;
        emit AgentDelisted(tokenId);
    }

    function buyAgent(uint256 tokenId) external payable nonReentrant {
        Agent storage agent = agents[tokenId];
        require(agent.price > 0, "Not for sale");
        require(msg.value >= agent.price, "Insufficient payment");
        require(_ownerOf(tokenId) != msg.sender, "Cannot buy own agent");

        address seller = _ownerOf(tokenId);
        agent.price = 0;
        _transfer(seller, seller, tokenId);

        payable(seller).transfer(msg.value);
        emit AgentSold(tokenId, seller, msg.sender, msg.value);
    }

    function getChildren(uint256 tokenId) external view returns (uint256[] memory) {
        return children[tokenId];
    }

    function getAgent(uint256 tokenId) external view returns (Agent memory) {
        return agents[tokenId];
    }

    function totalSupply() public view override(ERC721Enumerable) returns (uint256) {
        return _nextTokenId - 1;
    }

    // Helpers
    function max(uint256 a, uint256 b) private pure returns (uint256) {
        return a > b ? a : b;
    }

    // Required overrides
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

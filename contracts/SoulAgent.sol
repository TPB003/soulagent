// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

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
    event FeesUpdated(uint256 mintFee, uint256 breedFee);
    event Withdrawn(address indexed to, uint256 amount);

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

    /// @notice Buy a listed agent. `msg.value` must be at least the listing price;
    ///         any excess is refunded. The seller is paid with a full-gas call.
    function buyAgent(uint256 tokenId) external payable nonReentrant {
        Agent storage agent = agents[tokenId];
        uint256 price = agent.price;
        require(price > 0, "Not for sale");
        require(msg.value >= price, "Insufficient payment");

        address seller = _ownerOf(tokenId);
        require(seller != msg.sender, "Cannot buy own agent");

        // Effects before the payout. Zeroing first also keeps _update from
        // emitting AgentDelisted for a completed sale.
        agent.price = 0;
        _transfer(seller, msg.sender, tokenId);
        emit AgentSold(tokenId, seller, msg.sender, price);

        Address.sendValue(payable(seller), price);

        uint256 excess = msg.value - price;
        if (excess > 0) {
            Address.sendValue(payable(msg.sender), excess);
        }
    }

    /// @notice Owner withdraws the full contract balance (mint and breed fees).
    function withdraw(address payable to) external nonReentrant onlyOwner {
        require(to != address(0), "Zero address");
        uint256 amount = address(this).balance;
        require(amount > 0, "Nothing to withdraw");
        emit Withdrawn(to, amount);
        Address.sendValue(to, amount);
    }

    /// @notice Owner updates mint and breed fees. Zero is allowed.
    function setFees(uint256 newMintFee, uint256 newBreedFee) external onlyOwner {
        mintFee = newMintFee;
        breedFee = newBreedFee;
        emit FeesUpdated(newMintFee, newBreedFee);
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
    /// @dev Drop any listing when a token changes hands outside of buyAgent
    ///      (transferFrom, safeTransferFrom, or a future burn). buyAgent clears
    ///      `price` before calling `_transfer`, so a sale emits AgentSold only.
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        address from = super._update(to, tokenId, auth);
        if (from != address(0) && agents[tokenId].price != 0) {
            agents[tokenId].price = 0;
            emit AgentDelisted(tokenId);
        }
        return from;
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

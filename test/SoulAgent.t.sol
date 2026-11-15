// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Vm} from "forge-std/Vm.sol";
import {SoulAgent} from "../contracts/SoulAgent.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract SoulAgentTest is Test {
    SoulAgent internal soul;
    address internal owner;
    address internal seller;
    address internal buyer;
    address internal alice;
    address internal stranger;

    uint256 internal constant PRICE = 1 ether;

    function setUp() public {
        owner = makeAddr("owner");
        seller = makeAddr("seller");
        buyer = makeAddr("buyer");
        alice = makeAddr("alice");
        stranger = makeAddr("stranger");

        vm.deal(address(this), 100 ether);
        vm.deal(seller, 100 ether);
        vm.deal(buyer, 100 ether);
        vm.deal(alice, 100 ether);
        vm.deal(stranger, 100 ether);

        vm.prank(owner);
        soul = new SoulAgent();
    }

    function test_buyAgent_transfersOwnershipAndPaysSeller() public {
        uint256 id = _mintAndList(seller, PRICE);
        uint256 sellerBefore = seller.balance;
        uint256 buyerBefore = buyer.balance;
        uint256 contractBefore = address(soul).balance;

        vm.recordLogs();
        vm.prank(buyer);
        soul.buyAgent{value: PRICE}(id);

        assertEq(soul.ownerOf(id), buyer);
        assertEq(seller.balance, sellerBefore + PRICE);
        assertEq(buyer.balance, buyerBefore - PRICE);
        assertEq(address(soul).balance, contractBefore);
        assertEq(soul.getAgent(id).price, 0);
        assertEq(_agentPrice(id), 0);
        assertEq(_findSoldPrice(id), PRICE);

        vm.prank(alice);
        vm.expectRevert(bytes("Not for sale"));
        soul.buyAgent{value: PRICE}(id);
        assertEq(soul.ownerOf(id), buyer);
    }

    function test_buyAgent_overpayRefundsExcessAndUnderpayReverts() public {
        uint256 id = _mintAndList(seller, PRICE);
        uint256 extra = 0.4 ether;
        uint256 sellerBefore = seller.balance;
        uint256 buyerBefore = buyer.balance;
        uint256 contractBefore = address(soul).balance;

        vm.prank(buyer);
        vm.expectRevert(bytes("Insufficient payment"));
        soul.buyAgent{value: PRICE - 1}(id);
        assertEq(soul.ownerOf(id), seller);
        assertEq(buyer.balance, buyerBefore);
        assertEq(soul.getAgent(id).price, PRICE);

        vm.recordLogs();
        vm.prank(buyer);
        soul.buyAgent{value: PRICE + extra}(id);

        assertEq(soul.ownerOf(id), buyer);
        assertEq(seller.balance, sellerBefore + PRICE);
        assertEq(buyer.balance, buyerBefore - PRICE);
        assertEq(address(soul).balance, contractBefore);
        assertEq(_findSoldPrice(id), PRICE);
    }

    function testFuzz_buyAgent_payment(uint96 price, uint96 payment) public {
        price = uint96(bound(price, 1, 20 ether));
        payment = uint96(bound(payment, 0, 40 ether));
        vm.deal(buyer, uint256(payment) + 1 ether);

        uint256 id = _mintAndList(seller, price);
        uint256 sellerBefore = seller.balance;
        uint256 buyerBefore = buyer.balance;

        if (payment < price) {
            vm.prank(buyer);
            vm.expectRevert(bytes("Insufficient payment"));
            soul.buyAgent{value: payment}(id);
            assertEq(soul.ownerOf(id), seller);
            assertEq(seller.balance, sellerBefore);
            assertEq(buyer.balance, buyerBefore);
        } else {
            vm.prank(buyer);
            soul.buyAgent{value: payment}(id);
            assertEq(soul.ownerOf(id), buyer);
            assertEq(seller.balance, sellerBefore + price);
            assertEq(buyer.balance, buyerBefore - price);
            assertEq(soul.getAgent(id).price, 0);
        }
    }

    function test_transferClearsListing() public {
        uint256 id = _mintAndList(seller, PRICE);

        vm.recordLogs();
        vm.prank(seller);
        soul.transferFrom(seller, alice, id);

        assertEq(soul.ownerOf(id), alice);
        assertEq(soul.getAgent(id).price, 0);
        assertTrue(_sawDelisted(id));

        vm.prank(buyer);
        vm.expectRevert(bytes("Not for sale"));
        soul.buyAgent{value: PRICE}(id);
        assertEq(soul.ownerOf(id), alice);

        vm.prank(seller);
        vm.expectRevert(bytes("Not owner"));
        soul.listForSale(id, PRICE);

        vm.prank(alice);
        soul.listForSale(id, 2 ether);
        assertEq(soul.getAgent(id).price, 2 ether);
    }

    function test_safeTransferAndOperatorTransferClearListing() public {
        uint256 id = _mintAndList(seller, PRICE);
        vm.prank(seller);
        soul.safeTransferFrom(seller, alice, id);
        assertEq(soul.ownerOf(id), alice);
        assertEq(soul.getAgent(id).price, 0);

        uint256 other = _mintAndList(seller, PRICE);
        address operator = makeAddr("operator");
        vm.prank(seller);
        soul.setApprovalForAll(operator, true);
        vm.prank(operator);
        soul.transferFrom(seller, alice, other);
        assertEq(soul.ownerOf(other), alice);
        assertEq(soul.getAgent(other).price, 0);

        vm.prank(buyer);
        vm.expectRevert(bytes("Not for sale"));
        soul.buyAgent{value: PRICE}(other);
    }

    function test_buyClearsListingWithoutLeavingItBuyable() public {
        uint256 id = _mintAndList(seller, PRICE);
        vm.prank(buyer);
        soul.buyAgent{value: PRICE}(id);

        assertEq(soul.getAgent(id).price, 0);
        vm.prank(seller);
        vm.expectRevert(bytes("Not owner"));
        soul.delist(id);
        vm.prank(seller);
        vm.expectRevert(bytes("Not owner"));
        soul.listForSale(id, PRICE);
    }

    function test_withdraw_ownerOnly() public {
        uint256 id = _mintAs(seller);
        uint256 fees = address(soul).balance;
        assertEq(fees, soul.mintFee());

        vm.prank(seller);
        soul.listForSale(id, PRICE);
        vm.prank(buyer);
        soul.buyAgent{value: PRICE + 0.2 ether}(id);
        assertEq(address(soul).balance, fees);

        address treasury = makeAddr("treasury");
        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, stranger));
        soul.withdraw(payable(treasury));
        assertEq(address(soul).balance, fees);

        vm.prank(owner);
        vm.expectRevert(bytes("Zero address"));
        soul.withdraw(payable(address(0)));

        uint256 treasuryBefore = treasury.balance;
        vm.prank(owner);
        soul.withdraw(payable(treasury));
        assertEq(treasury.balance, treasuryBefore + fees);
        assertEq(address(soul).balance, 0);

        vm.prank(owner);
        vm.expectRevert(bytes("Nothing to withdraw"));
        soul.withdraw(payable(treasury));
    }

    function test_setFees_ownerOnly() public {
        assertEq(soul.mintFee(), 0.001 ether);
        assertEq(soul.breedFee(), 0.002 ether);

        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, stranger));
        soul.setFees(0.01 ether, 0.02 ether);
        assertEq(soul.mintFee(), 0.001 ether);

        vm.prank(owner);
        soul.setFees(0.01 ether, 0.02 ether);
        assertEq(soul.mintFee(), 0.01 ether);
        assertEq(soul.breedFee(), 0.02 ether);

        vm.prank(seller);
        vm.expectRevert(bytes("Insufficient fee"));
        soul.mint{value: 0.001 ether}("Ada", "hash", "summary");

        vm.prank(seller);
        uint256 first = soul.mint{value: 0.01 ether}("Ada", "hash", "summary");
        vm.prank(seller);
        uint256 second = soul.mint{value: 0.01 ether}("Bea", "hash", "summary");

        vm.prank(seller);
        vm.expectRevert(bytes("Insufficient breed fee"));
        soul.breed{value: 0.002 ether}(first, second, "Child", "hash", "summary");

        vm.prank(seller);
        uint256 child = soul.breed{value: 0.02 ether}(first, second, "Child", "hash", "summary");
        assertEq(soul.ownerOf(child), seller);
        assertEq(soul.getAgent(child).generation, 1);
    }

    function test_contractWalletSellerReceivesPayment() public {
        PaymentSink sink = new PaymentSink(soul);
        vm.deal(address(sink), 1 ether);

        uint256 id = sink.mintAndList{value: soul.mintFee()}(PRICE);
        assertEq(soul.ownerOf(id), address(sink));

        // A 2300-gas stipend cannot pay for the sink's SSTORE. buyAgent must
        // forward the remaining gas or this seller can never be paid.
        (bool stipendOk,) = address(sink).call{value: PRICE, gas: 2300}("");
        assertFalse(stipendOk);
        assertEq(sink.received(), 0);

        uint256 sinkBefore = address(sink).balance;
        vm.prank(buyer);
        soul.buyAgent{value: PRICE}(id);

        assertEq(soul.ownerOf(id), buyer);
        assertEq(address(sink).balance, sinkBefore + PRICE);
        assertEq(sink.received(), PRICE);
        assertEq(soul.getAgent(id).price, 0);
    }

    function test_reentrancy_sellerCannotReenterBuy() public {
        ReentrantSeller attacker = new ReentrantSeller(soul);
        vm.deal(address(attacker), 1 ether);
        uint256 id = attacker.mintAndList{value: soul.mintFee()}(PRICE);

        uint256 buyerBefore = buyer.balance;
        vm.prank(buyer);
        vm.expectRevert(ReentrancyGuard.ReentrancyGuardReentrantCall.selector);
        soul.buyAgent{value: PRICE}(id);

        assertEq(soul.ownerOf(id), address(attacker));
        assertEq(soul.getAgent(id).price, PRICE);
        assertEq(buyer.balance, buyerBefore);
        assertEq(attacker.reentered(), 0);
    }

    function test_reentrancy_overpayRefundCannotReenter() public {
        uint256 id = _mintAndList(seller, PRICE);
        ReentrantBuyer attacker = new ReentrantBuyer(soul);
        vm.deal(address(attacker), PRICE + 1 ether);

        uint256 sellerBefore = seller.balance;
        vm.expectRevert(ReentrancyGuard.ReentrancyGuardReentrantCall.selector);
        attacker.buy{value: PRICE + 0.5 ether}(id);

        assertEq(soul.ownerOf(id), seller);
        assertEq(soul.getAgent(id).price, PRICE);
        assertEq(seller.balance, sellerBefore);
        assertEq(address(attacker).balance, PRICE + 1 ether);
    }

    function test_reentrancy_withdrawCannotReenter() public {
        ReentrantOwner attacker = new ReentrantOwner();
        attacker.seed{value: 0.001 ether}();
        SoulAgent nested = attacker.soul();
        assertEq(address(nested).balance, 0.001 ether);

        vm.expectRevert(ReentrancyGuard.ReentrancyGuardReentrantCall.selector);
        attacker.attack();

        assertEq(address(nested).balance, 0.001 ether);
        assertEq(address(attacker).balance, 0);
    }

    function test_contractBuyerWithoutReceiverCanBuy() public {
        uint256 id = _mintAndList(seller, PRICE);
        BlindBuyer wallet = new BlindBuyer(soul);
        vm.deal(address(wallet), PRICE);

        wallet.buy{value: PRICE}(id);

        assertEq(soul.ownerOf(id), address(wallet));
        assertEq(soul.getAgent(id).price, 0);
    }

    function test_mintOverpaymentStaysWithdrawable() public {
        uint256 extra = 0.004 ether;
        uint256 paid = soul.mintFee() + extra;
        vm.prank(seller);
        soul.mint{value: paid}("Ada", "hash", "summary");
        assertEq(address(soul).balance, paid);

        address treasury = makeAddr("treasury");
        vm.prank(owner);
        soul.withdraw(payable(treasury));
        assertEq(treasury.balance, paid);
        assertEq(address(soul).balance, 0);
    }

    function test_getAgentShapeUnchangedAfterSale() public {
        uint256 id = _mintAndList(seller, PRICE);
        vm.prank(buyer);
        soul.buyAgent{value: PRICE}(id);

        SoulAgent.Agent memory agent = soul.getAgent(id);
        assertEq(agent.name, "Ada");
        assertEq(agent.personalityHash, "hash");
        assertEq(agent.personalitySummary, "summary");
        assertEq(agent.parent1, 0);
        assertEq(agent.parent2, 0);
        assertEq(agent.generation, 0);
        assertEq(agent.price, 0);
        assertEq(agent.creator, seller);
        assertGt(agent.createdAt, 0);
        assertEq(soul.tokenURI(id), "hash");
    }

    function _mintAs(address who) internal returns (uint256 id) {
        uint256 fee = soul.mintFee();
        vm.prank(who);
        id = soul.mint{value: fee}("Ada", "hash", "summary");
    }

    function _mintAndList(address who, uint256 price) internal returns (uint256 id) {
        id = _mintAs(who);
        vm.prank(who);
        soul.listForSale(id, price);
    }

    function _agentPrice(uint256 id) internal view returns (uint256 price) {
        (,,,,,, price,,) = soul.agents(id);
    }

    function _findSoldPrice(uint256 id) internal view returns (uint256) {
        bytes32 sig = keccak256("AgentSold(uint256,address,address,uint256)");
        Vm.Log[] memory entries = vm.getRecordedLogs();
        for (uint256 i = 0; i < entries.length; i++) {
            if (entries[i].topics.length == 4 && entries[i].topics[0] == sig && uint256(entries[i].topics[1]) == id) {
                return abi.decode(entries[i].data, (uint256));
            }
        }
        revert("AgentSold not found");
    }

    function _sawDelisted(uint256 id) internal view returns (bool) {
        bytes32 sig = keccak256("AgentDelisted(uint256)");
        Vm.Log[] memory entries = vm.getRecordedLogs();
        for (uint256 i = 0; i < entries.length; i++) {
            if (entries[i].topics.length == 2 && entries[i].topics[0] == sig && uint256(entries[i].topics[1]) == id) {
                return true;
            }
        }
        return false;
    }
}

/// @dev Seller wallet whose receive() writes storage, so Solidity `transfer` (2300 gas) cannot pay it.
contract PaymentSink is IERC721Receiver {
    SoulAgent public immutable soul;
    uint256 public received;

    constructor(SoulAgent s) {
        soul = s;
    }

    function mintAndList(uint256 price) external payable returns (uint256 id) {
        id = soul.mint{value: msg.value}("Safe", "hash", "summary");
        soul.listForSale(id, price);
    }

    receive() external payable {
        received = msg.value;
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}

/// @dev On payment, tries to buy the same token again.
contract ReentrantSeller is IERC721Receiver {
    SoulAgent public immutable soul;
    uint256 public reentered;

    constructor(SoulAgent s) {
        soul = s;
    }

    function mintAndList(uint256 price) external payable returns (uint256 id) {
        id = soul.mint{value: msg.value}("Evil", "hash", "summary");
        soul.listForSale(id, price);
    }

    receive() external payable {
        reentered += 1;
        soul.buyAgent{value: address(this).balance}(1);
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}

/// @dev On the overpayment refund, tries to buy again.
contract ReentrantBuyer {
    SoulAgent public immutable soul;

    constructor(SoulAgent s) {
        soul = s;
    }

    function buy(uint256 tokenId) external payable {
        soul.buyAgent{value: msg.value}(tokenId);
    }

    receive() external payable {
        soul.buyAgent{value: msg.value}(1);
    }
}

/// @dev Buyer with no ERC-721 receiver. buyAgent uses _transfer, so this must still work.
contract BlindBuyer {
    SoulAgent public immutable soul;

    constructor(SoulAgent s) {
        soul = s;
    }

    function buy(uint256 tokenId) external payable {
        soul.buyAgent{value: msg.value}(tokenId);
    }
}

/// @dev Owner whose withdraw recipient reenters withdraw.
contract ReentrantOwner is IERC721Receiver {
    SoulAgent public immutable soul;

    constructor() {
        soul = new SoulAgent();
    }

    function seed() external payable {
        soul.mint{value: msg.value}("O", "h", "s");
    }

    function attack() external {
        soul.withdraw(payable(address(this)));
    }

    receive() external payable {
        soul.withdraw(payable(address(this)));
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}

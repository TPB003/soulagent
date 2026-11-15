# SoulAgent contract

ERC-721 marketplace for agent NFTs. The contract is not upgradeable. Fixes land by deploying a new address. Do not deploy from this repo with a private key.

## Build and test

Dependencies are git submodules pinned in `foundry.lock`:

- OpenZeppelin Contracts **v5.6.1** (`5fd1781b1454fd1ef8e722282f86f9293cacf256`)
- forge-std **v1.11.0** (`8e40513d678f392f398620b3ef2b418648b33e89`)

```bash
git submodule update --init
forge test
```

Compiler settings in `foundry.toml`: solc **0.8.30**, EVM **cancun**, optimizer on (200 runs). OpenZeppelin 5.6 uses `mcopy`, so an earlier EVM version does not compile.

## Fees

`mint` and `breed` still accept `msg.value >= fee`. Extra value stays in the contract as protocol fees. The owner withdraws it with `withdraw` and can change the fees with `setFees`. Sale proceeds are not kept: `buyAgent` pays the seller the listing price and refunds any excess to the buyer.

# Scroll Stablecoin Payments Tutorial

A minimal example dApp on Scroll that accepts USDT payments and mints ERC-721 NFT receipt for each purchase.

This repo consists of a foundry project for smart contract development and a React + Wagmi frontend.

![image](https://github.com/user-attachments/assets/c573b1e8-a8ff-4590-8659-8cc5053e2611)


See the [full tutorial](#TODO) on the Scroll Docs.

## Smart Contract Deployment

Make sure you installed [foundry](https://getfoundry.sh/introduction/installation):

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Install the openzeppelin dependency:

```bash
npm install @openzeppelin/contracts
```

Setup your environment variables and deploy:

```bash
export SCROLL_RPC_URL=https://rpc.scroll.io/
export PRIVATE_KEY=<YOUR_KEY>
forge create src/PaymentProcessor.sol:PaymentProcessor \
  --rpc-url $SCROLL_RPC_URL --broadcast --private-key $PRIVATE_KEY
```

The smart contract address should be under the `Deployed to:` section you will see on the terminal.

## Run the frontend

Place the address of the contract you just deployed on `.env.local`

```text
VITE_PAYMENT_PROCESSOR_ADDRESS=0xYourContractAddress
```

```bash
pnpm install
pnpm run dev
```

The dApp should now load at [http://localhost:5173](http://localhost:5173). Connect your wallet, approve USDT, and make a purchase to see your NFT receipt on any marketplace that supports Scroll, such as [Elements](https://element.market/ethereum).

![image](https://github.com/user-attachments/assets/1daaddf1-e380-42b3-af6e-fc5331410f5f)

// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.27;

import {ERC721} from "openzeppelin-contracts/token/ERC721/ERC721.sol";
import {IERC20} from "openzeppelin-contracts/token/ERC20/IERC20.sol";

// The following contract will process payments from users by debiting the item price and minting an NFT as recipt
contract PaymentProcessor is ERC721 {
    // Internal NFT counter for ID generation
    uint _nextTokenId;
    // NFT metadata url for our demo
    string _tokenURI = "https://raw.githubusercontent.com/Turupawn/erc721-nft-metadata-demo/refs/heads/main/metadata.json";
    // Set to the contract deployer, will receive each USDT payment
    address public STORE_OWNER;
    // USDT token address in mainnet
    address public PAYMENT_TOKEN = 0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df;
    // USDT uses 6 decimals, adapt accordingly if you use other token
    uint8 PAYMENT_TOKEN_DECIMALS = 6;
    // Item price will cost 0.05 USDT using the formula based on decimal amount
    uint public ITEM_PRICE = 5 * 10**PAYMENT_TOKEN_DECIMALS / 100;

    constructor() ERC721("MyToken", "MTK")
    {
        STORE_OWNER = msg.sender;
    }

    // During puchase, the item price will be debited from the user and transfered to the shop owner
    function processPurchase()
        public
    {
        uint tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        IERC20(PAYMENT_TOKEN).transferFrom(msg.sender, address(this), ITEM_PRICE);
        IERC20(PAYMENT_TOKEN).transfer(STORE_OWNER, ITEM_PRICE);
    }

    // Even though in our demo each item has the same metadata we still follow the ERC721 standard
    function tokenURI(uint tokenId)
        public
        view
        override(ERC721)
        returns (string memory)
    {
        tokenId;
        return _tokenURI;
    }
}
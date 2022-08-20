// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC1155/ERC1155.sol";

contract CsMarketPlace is ERC1155 {
    constructor() ERC1155("") {}
    struct AuctionItem{
        uint256 id;
        uint256 tokenId;
        address tokenAddress;
        address payable seller;
        uint256 askingPrice;
        bool isSold;
    }

    AuctionItem[] public itemsForSale;
    mapping(address => mapping(uint256 => bool)) activeItems;

    event itemAdded(uint256 id, uint256 tokenId, address tokenAddress, uint256 askingPrice);
    event itemSold(uint256 id, address buyer, uint256 askingPrice);

    modifier OnlyItemOwner(address tokenAddress, uint256 tokenId){
        IERC1155 tokenContract = IERC1155(tokenAddress);
        require(tokenContract.balanceOf(msg.sender, tokenId) != 0 , "You are not the owner of this item");
        _;
    }

    modifier HasTransferApproval(address tokenAddress, address sellerAddress){
        ERC1155 token = ERC1155(tokenAddress);
        require(token.isApprovedForAll(sellerAddress, address(this)), "This Market Place is not Approved");
        _;
    }

    modifier ItemExists(uint256 id){
        require(id < itemsForSale.length && itemsForSale[id].id == id, "Could not find item");
        _;
    }

    modifier IsSold(uint256 id){
        require(itemsForSale[id].isSold == false, "Item is already sold!");
        _;
    }

    function addItemToMarket(address tokenAddress, uint256 tokenId, uint256 askingPrice) OnlyItemOwner(tokenAddress, tokenId) HasTransferApproval(tokenAddress, msg.sender) external returns(uint256){
        require(activeItems[tokenAddress][tokenId] == false, "Item is already up for sale!");
        uint256 newItemId = itemsForSale.length;
        itemsForSale.push(AuctionItem(newItemId, tokenId, tokenAddress, payable(msg.sender), askingPrice, false));
        activeItems[tokenAddress][tokenId] = true;
        assert(itemsForSale[newItemId].id == newItemId);

        emit itemAdded(newItemId, tokenId, tokenAddress, askingPrice);
        return newItemId;
    }

    function buyItem(uint256 id) payable external ItemExists(id) IsSold(id) HasTransferApproval(itemsForSale[id].tokenAddress, itemsForSale[id].seller){
        require(msg.value >= itemsForSale[id].askingPrice,"Not enough funds sent!");
        require(msg.sender != itemsForSale[id].seller);
        itemsForSale[id].isSold =true;
        activeItems[itemsForSale[id].tokenAddress][itemsForSale[id].tokenId] = false;
        ERC1155 token = ERC1155(itemsForSale[id].tokenAddress);
        token.safeTransferFrom(itemsForSale[id].seller, msg.sender, itemsForSale[id].tokenId, 1, "");

        itemsForSale[id].seller.transfer(msg.value);

        emit itemSold(id, msg.sender, itemsForSale[id].askingPrice);
    }

} 
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC1155/ERC1155.sol";

contract TestNft is ERC1155 {
    uint256 public constant ART = 0;
    uint256 id;
    constructor() ERC1155("https://opensea.mypinata.cloud/ipfs/bafkreieanvzxrauqrtttup2essgaxji5ozpbor5g4o64gxcln3nlzhrrye") {
        id=0;
        _mint(msg.sender, ART,1,"");
    }

    mapping (uint256 => string) private _uris;

    function mint(address account, uint256 amount, string memory _metadata) public {
        _mint(account, id, amount,"");
        setTokenUri(id,_metadata);
        id++;
    }

    // function burn(address account, uint256 id, uint256 amount) public {
    //     require(msg.sender ==  account);test_nft
    //     _burn(account, id, amount);
    // }

    function uri(uint256 tokenId) override public view returns (string memory) {
        return(_uris[tokenId]);
    }
    
    function setTokenUri(uint256 tokenId, string memory _uri) public {
        require(bytes(_uris[tokenId]).length == 0, "Cannot set MetaData twice"); 
        _uris[tokenId] = _uri; 
    }   
}


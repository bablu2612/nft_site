export const Moralis = require('moralis');
import { numberToIdentifer } from "webpack/lib/Template";
import noimage from "../../assets/images/noimage";
require("jquery")
var serverUrl = "https://hz0syusp3f7e.usemoralis.com:2053/server";
var appId = "6uPOE7DpOVgMCqJH8vPWwKarQEU7qo2WLBUFky0k";
var currentChain;
const nftContractAddress = "0x25D259D4070aD1e2b645a35626dCE39575f25536";
const marketContractAddress = "0xD52330FB6616A9c884EA2273C63dB2569fb260D2";
Moralis.start({ serverUrl, appId});

window.onload=()=>{
	getSelectedChain();
}
const getSelectedChain = async () => {
	const web3 = await Moralis.enableWeb3();
	const chainId = await Moralis.chainId;
	console.log(chainId); // 56
	const chain = await getNetworkName(chainId);
	return chain;
}

function getNetworkName(chainID) {
	var networks = {
	  '0x1': "Ethereum Mainnet",
	  '0x4': "Rinkeby",
	  '0x97': "Binance Smart Chain Testnet",
	  '0x80001': "Polygon Mumbai Testnet",
	};
	currentChain = networks[""+chainID+""];
	return networks[""+chainID+""];
}
if(Moralis.User.current()){
    var user = Moralis.User.current();
    $("#btnLogout").show();
    $("#btnConnect").hide();
    $("#profile").show();       
    var currentUserAddress = ""+user.get('accounts')+"";
}
else{
    $("#btnConnect").show(); 
    $("#btnLogout").hide(); 
    $("#profile").hide();   
}

//Login with MetaMask
$("#btnConnect").on("click",async function () {
    if (!user) {
      user = await Moralis.authenticate({ signingMessage: "Log in using Moralis" })
        .then(function (user) {
          console.log("logged in user:", user);
          console.log(user.get("ethAddress"));
        })
        .catch(function (error) {
          alert(error.message);
        });
    }
    window.location.reload();
  }
)


//LogOut From Metamask  
$("#btnLogout").on("click",async function () {
    await Moralis.User.logOut();
    alert("logged out");
    window.location.reload();
})

  $("#content").html("");
//Get All NFTs of a specific user
window.getOwnedItems = async function() {
    const ownedItems = await Moralis.Cloud.run("getUserItems");
    createViewOfItems(ownedItems);
}

window.createViewOfItems = async (items) => {
	console.log("items",items);
    items.forEach(function (nft) {
        let url = fixURL(nft.token_uri);
        fetch(url)
        .then(response => response.json())
        .then(data =>{
            $("#content").append(" \
				<a href ='nft_detail?tokenAddress="+nft.token_address+"&tokenId="+nft.token_id+"'> \
                <div class='bg-gray-600 shadow-2xl hover:scale-110 w-[14rem] h-[22rem] my-10 mx-5 rounded-2xl overflow-hidden cursor-pointer'> \
                    <div class=' bg-white h-2/3 w-full overflow-hidden flex justify-center items-center'> \
                        <img src='"+fixURL(data.image)+"' alt='"+data.name+"' class='w-full object-cover' /> \
                    </div> \
                    <div class='p-3'> \
                        <div class='flex justify-between text-[#e4e8eb] drop-shadow-xl'> \
                            <div class='flex-0.6 flex-wrap'> \
                                <div class='font-semibold text-sm text-[#8a939b]'>title</div> \
                                <div id='nft-name' class='font-bold text-lg mt-2 overflow-hidden w-[150px]'>"+data.name+"</div> \
                                <button type='button' onclick=listItemForSale("+nft.token_id+",'"+nft.token_address+"','10000')>Sell</button> \
                            </div> \
                            <div class='flex-0.4 text-right'></div>\
                            <div class='font-semibold text-sm text-[#8a939b]'>Price</div> \
                            <div id='nft-price' class='flex items-center text-xl font-bold mt-2'> \
                            </div> \
                        </div> \
                    </div> \
                    <div class='text-[#8a939b] font-bold flex items-center w-full justify-end mt-3'> \
                        <span id='nft-like' class='text-xl mr-2'> \
                        </span> \
                    </div> \
                </div> </a>   ");
        }).catch((error)=>{
            $("#content").append(" \
                <div class='bg-gray-600 shadow-2xl hover:scale-110 w-[14rem] h-[22rem] my-10 mx-5 rounded-2xl overflow-hidden cursor-pointer'> \
                    <div class='bg-white h-2/3 w-full overflow-hidden flex justify-center items-center'> \
                        <img src='"+noimage+"' alt='noimage' class='h-auto w-full object-cover' /> \
                    </div> \
                    <div class='p-3'> \
                        <div class='flex justify-between text-[#e4e8eb] drop-shadow-xl'> \
                            <div class='flex-0.6 flex-wrap'> \
                                <div class='font-semibold text-sm text-[#8a939b]'>title</div> \
                                <div id='nft-name' class='font-bold text-lg mt-2 overflow-hidden w-[150px]'>Unnamed</div> \
                            </div> \
                            <div class='flex-0.4 text-right'></div>\
                            <div class='font-semibold text-sm text-[#8a939b]'>Price</div> \
                            <div id='nft-price' class='flex items-center text-xl font-bold mt-2'> \
                            </div> \
                        </div> \
                    </div> \
                    <div class='text-[#8a939b] font-bold flex items-center w-full justify-end mt-3'> \
                        <span id='nft-like' class='text-xl mr-2'> \
                        </span> \
                    </div> \
                </div>");
        })
    });
}

//Save NFTs into DataBase
window.saveNftsToDb = async function () {
    const EthTokenBlance = Moralis.Object.extend("EthTokenBalance");
    const userEthNFTs = await Moralis.Web3.getNFTs({ chain: "rinkeby", address: currentUserAddress});
	currentChain = await getSelectedChain();
    userEthNFTs.forEach(async function (nft) {
        const query = new Moralis.Query("EthTokenBalance");
        query.equalTo("token_id", nft.token_id);
        query.equalTo("token_address", nft.token_address);
        query.equalTo("owner_of", currentUserAddress);
        const result = await query.find();
        console.log(result);
        if(result.length == 0) 
        {
            const nftBlance = new EthTokenBlance ();
            nftBlance.set("token_address", nft.token_address);
            nftBlance.set("token_uri", nft.token_uri);
            nftBlance.set("token_id", nft.token_id);
            nftBlance.set("owner_of", currentUserAddress);
            nftBlance.set("contract_type", nft.contract_type);
            nftBlance.set("amount", nft.amount);
			nftBlance.set("chain_name", currentChain);
            nftBlance.save();
        }
    });
    getOwnedItems();
}

// Fix Urls which don't start with https://
function fixURL(url) {
    if(url != null){
		console.log("url",url);
        if(url.startsWith("ipfs")){
            return "https://ipfs.io/ipfs/"+url.split("ipfs://ipfs/").slice(-1);
        }
        else
        {
            return url;
        }   
    }
    else{
        return noimage;
    }
    
}

//Get Items for sale
window.getItemsForSale = async () => {
    $("#item-for-sale").html("");
    const Items = await Moralis.Cloud.run("getItemsForSale");
    Items.forEach(function (item){
        // if(user){
        //     if(user.attributes.accounts.includes(item.ownerOf)) return;
        // }
        console.log(item);
        let url = fixURL(item.tokenUri);
		console.log("url",url);
        fetch(url)
        .then(response => response.json())
        .then(data =>{
			console.log("data",data);
            $("#item-for-sale").append(" \
                <div class='bg-gray-600 shadow-2xl hover:scale-110 w-[14rem] h-[22rem] my-10 mx-5 rounded-2xl overflow-hidden cursor-pointer'> \
                    <div class=' bg-white h-[222px] w-full overflow-hidden flex justify-center items-center'> \
                        <img src='"+fixURL(data.image)+"' alt='"+data.name+"' class='w-full object-cover' /> \
                    </div> \
                    <div class='p-3'> \
                        <div class='mt-[-10px] justify-between text-[#e4e8eb] drop-shadow-xl'> \
                            <div class='flex-wrap'> \
                                <div id='nft-name' class='font-bold text-lg mt-2 overflow-hidden w-[150px]'>"+data.name+"</div> \
                            </div> \
                            <div class='font-semibold text-sm text-[#8a939b]'>Price</div> \
                            <div id='nft-price' class='mt-[-2px] flex items-center text-xl font-bold mt-2'> \
                                <svg id='Layer_1' data-name='Layer 1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 311.39 507.11'><defs><style>.cls-1{fill:#343434;}.cls-2{fill:#8c8c8c;}.cls-3{fill:#3c3c3b;}.cls-4{fill:#141414;}.cls-5{fill:#393939;}</style></defs><title>ethereum-eth</title><polygon class='cls-1' points='155.65 0 152.25 11.56 152.25 346.87 155.65 350.26 311.3 258.26 155.65 0'></polygon><polygon class='cls-2' points='155.65 0 0 258.26 155.65 350.27 155.65 187.51 155.65 0'></polygon><polygon class='cls-3' points='155.65 379.74 153.73 382.07 153.73 501.52 155.65 507.11 311.39 287.78 155.65 379.74'></polygon><polygon class='cls-2' points='155.65 507.11 155.65 379.73 0 287.78 155.65 507.11'></polygon><polygon class='cls-4' points='155.65 350.26 311.3 258.26 155.65 187.51 155.65 350.26'></polygon><polygon class='cls-5' points='0 258.26 155.65 350.26 155.65 187.51 0 258.26'></polygon></svg> \
                                <div class='text-[16px]'>"+item.askingPrice+"</div> \
                            </div> \
                            <div class='w-full'> \
                                <button type='button' class='mt-[9px] rounded w-full bg-sky-600 text-white' onclick=buyItem('"+item.tokenAddress+"',"+item.uid+")>Buy Now</button> \
                            </div> \
                        </div> \
                    </div> \
                    <div class='text-[#8a939b] font-bold flex items-center w-full justify-end mt-3'> \
                        <span id='nft-like' class='text-xl mr-2'> \
                        </span> \
                    </div> \
                </div>    ");
        }).catch((error)=>{
			console.log("data",error);
            $("#item-for-sale").append(" \
                <div class='bg-gray-600 shadow-2xl hover:scale-110 w-[14rem] h-[22rem] my-10 mx-5 rounded-2xl overflow-hidden cursor-pointer'> \
                    <div class='bg-white h-2/3 w-full overflow-hidden flex justify-center items-center'> \
                        <img src='"+noimage+"' alt='noimage' class='h-auto w-full object-cover' /> \
                    </div> \
                    <div class='p-3'> \
                        <div class='flex justify-between text-[#e4e8eb] drop-shadow-xl'> \
                            <div class='flex-0.6 flex-wrap'> \
                                <div class='font-semibold text-sm text-[#8a939b]'>title</div> \
                                <div id='nft-name' class='font-bold text-lg mt-2 overflow-hidden w-[150px]'>Unnamed</div> \
                            </div> \
                            <div class='flex-0.4 text-right'></div>\
                            <div class='font-semibold text-sm text-[#8a939b]'>Price</div> \
                            <div id='nft-price' class='flex items-center text-xl font-bold mt-2'> \
                                <svg id='Layer_1' data-name='Layer 1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 311.39 507.11'><defs><style>.cls-1{fill:#343434;}.cls-2{fill:#8c8c8c;}.cls-3{fill:#3c3c3b;}.cls-4{fill:#141414;}.cls-5{fill:#393939;}</style></defs><title>ethereum-eth</title><polygon class='cls-1' points='155.65 0 152.25 11.56 152.25 346.87 155.65 350.26 311.3 258.26 155.65 0'></polygon><polygon class='cls-2' points='155.65 0 0 258.26 155.65 350.27 155.65 187.51 155.65 0'></polygon><polygon class='cls-3' points='155.65 379.74 153.73 382.07 153.73 501.52 155.65 507.11 311.39 287.78 155.65 379.74'></polygon><polygon class='cls-2' points='155.65 507.11 155.65 379.73 0 287.78 155.65 507.11'></polygon><polygon class='cls-4' points='155.65 350.26 311.3 258.26 155.65 187.51 155.65 350.26'></polygon><polygon class='cls-5' points='0 258.26 155.65 350.26 155.65 187.51 0 258.26'></polygon></svg> \
                            </div> \
                        </div> \
                    </div> \
                    <div class='text-[#8a939b] font-bold flex items-center w-full justify-end mt-3'> \
                        <span id='nft-like' class='text-xl mr-2'> \
                        </span> \
                    </div> \
                </div>");
        })
    });
}

//upload metadata to ipfs
window.uploadDataToIPFS = async () => {
	$("#create-nft").prop('disabled', true);
	if($("input[type=file][name=upload_file]").prop('files')[0]){
		const data = $("input[type=file][name=upload_file]").prop('files')[0];
        const file = new Moralis.File(data.name, data)
		await file.saveIPFS();
		var imageURI = file.ipfs();
	}
	else{
		var imageURI = "";
	}
        const metadata = {
            "name":$("#name").val(),
            "description":$("#description").val(),
            "image": imageURI
        }
        const metadataFile = new Moralis.File("metadata.json", {base64 : btoa(JSON.stringify(metadata))});
        await metadataFile.saveIPFS();
        return metadataFile.ipfs();
}

//Save File To IPFS and upload metadata in json format in ipfs
$("#create-nft").on("click",async function(){
	const metadataURI = uploadDataToIPFS();
    mint_nft(metadataURI);
})

//Mint_nft
window.mint_nft = async function(metadataURI) { 
    const metadata = metadataURI;
    web3 = await Moralis.enableWeb3();
    const ABI = [{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_metadata",
				"type": "string"
			}
		],
		"name": "mint",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},];
    const options = {
    contractAddress: "0x25D259D4070aD1e2b645a35626dCE39575f25536",
    functionName: "mint",
    abi: ABI,
    params: { account: currentUserAddress, amount: 1, _metadata: metadata},
    msgValue: 0
    };
    const allowance = await Moralis.executeFunction(options);
}
const marketPlaceAbi = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "tokenAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "askingPrice",
				"type": "uint256"
			}
		],
		"name": "addItemToMarket",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "buyItem",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "tokenAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "askingPrice",
				"type": "uint256"
			}
		],
		"name": "itemAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "askingPrice",
				"type": "uint256"
			}
		],
		"name": "itemSold",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "itemsForSale",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "tokenAddress",
				"type": "address"
			},
			{
				"internalType": "address payable",
				"name": "seller",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "askingPrice",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isSold",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
const nftAbi = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "ApprovalForAll",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "ids",
				"type": "uint256[]"
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "values",
				"type": "uint256[]"
			}
		],
		"name": "TransferBatch",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "TransferSingle",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "value",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "URI",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "ART",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "accounts",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "ids",
				"type": "uint256[]"
			}
		],
		"name": "balanceOfBatch",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "isApprovedForAll",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_metadata",
				"type": "string"
			}
		],
		"name": "mint",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256[]",
				"name": "ids",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "amounts",
				"type": "uint256[]"
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "safeBatchTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "setApprovalForAll",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_uri",
				"type": "string"
			}
		],
		"name": "setTokenUri",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "uri",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
window.editNft = async function(tokenAddress, tokenId){
    const query = new Moralis.Query("EthTokenBalance");
    query.equalTo("token_address", tokenAddress);
    query.equalTo("token_id", tokenId);
    const result = await query.first();
    console.log(tokenAddress+","+ tokenId);
    console.log(result);
    let tokenURI = fixURL(result.attributes.token_uri);
    fetch(tokenURI)
        .then(response => response.json())
        .then(data =>{
            $("#item-image").attr("src", fixURL(data.image));
            $("#item-image_field").val(fixURL(data.image));  
        })

}

//update_nft
window.updateNft = async function(tokenId, metadataURI){
    const metadata = metadataURI;
    web3 = await Moralis.enableWeb3();
    const ABI = nftAbi;
    const options = {
    contractAddress: "0x25D259D4070aD1e2b645a35626dCE39575f25536",
    functionName: "setTokenUri",
    abi: ABI,
    params: { tokenId: tokenId, _uri: metadata},
    msgValue: 0
    };
    const allowance = await Moralis.executeFunction(options);
}

// Approve MarketPlace
window.approveMarketPlace = async (tokenAddress) => {
    const options = {
        contractAddress: tokenAddress,
        functionName: "setApprovalForAll",
        abi: [{
            "inputs": [
                {
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                },
                {
                    "internalType": "bool",
                    "name": "approved",
                    "type": "bool"
                }
            ],
            "name": "setApprovalForAll",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }],
        params: { operator: "0xD52330FB6616A9c884EA2273C63dB2569fb260D2", approved: true, from: user.get('ethAddress')},
    };
    await Moralis.executeFunction(options);
}

//check if market place is approved
window.ensureMarketPlaceIsApproved = async (tokenAddress) => {
    web3 = await Moralis.enableWeb3();
    const options = {
        contractAddress: tokenAddress,
        functionName: "isApprovedForAll",
        abi: [{
            "inputs": [
                {
                    "internalType": "address",
                    "name": "account",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                }
            ],
            "name": "isApprovedForAll",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }],
        params: { operator: "0xD52330FB6616A9c884EA2273C63dB2569fb260D2", account: user.get('ethAddress')},
    };
    if(!await Moralis.executeFunction(options))
    {
        await approveMarketPlace(tokenAddress);
    }
}

//List Item For Sale
window.listItemForSale = async (tokenId, tokenAddress, askingPrice) => {
	console.log("fdfdsa",tokenId, tokenAddress, askingPrice);
	askingPrice = 5;
    await ensureMarketPlaceIsApproved(tokenAddress).then(async function(){
    web3 = await Moralis.enableWeb3();
    const options = {
        contractAddress: "0xD52330FB6616A9c884EA2273C63dB2569fb260D2",
        functionName: "addItemToMarket",
        abi: marketPlaceAbi,
        params: { tokenId: tokenId, tokenAddress: tokenAddress, askingPrice: askingPrice, from: user.get('ethAddress')},
        msgValue: 0
    };
    const allowance = await Moralis.executeFunction(options);
    }
    );
}

//Buy Item
window.buyItem = async (tokenAddress, itemId, askingPrice) => {
    console.log(itemId);
    await ensureMarketPlaceIsApproved(tokenAddress).then(async function(){
        web3 = await Moralis.enableWeb3();
        const options = {
            contractAddress: "0xD52330FB6616A9c884EA2273C63dB2569fb260D2",
            functionName: "buyItem",
            abi: marketPlaceAbi,
            params: { id: itemId},
            msgValue: askingPrice
        };
        const buyed = await Moralis.executeFunction(options);
    });
}

window.openUserInfo = async () => {
    if(user)
    {
        $("#username").val(user.get("username"));
        if(user.get("email")){
            $("#email").val(user.get("email"));
        }
        if(user.get("avatar"))
        {
            $("#user-avatar").attr("src", user.get("avatar").url());
        }
        else if(!user.get("avatar"))
        {
            $("#user-avatar").attr("src", noimage);
        }
    }
    else{
        $("#btnConnect").click();
    }
}

//Get detail of an item
window.itemDetail = async (tokenAddress, tokenId) => {
	const query = new Moralis.Query("EthTokenBalance");
	query.equalTo("token_address", tokenAddress);
	query.equalTo("token_id", tokenId);
	const result = await query.first();
	const nft = result.attributes;
	let metadataUri = fixURL(nft.token_uri);
	$("#token-id").val(nft.token_id);
	$("#refresh-metadata-button").attr("onclick","refreshMetaData("+nft.token_id+",'"+nft.token_address+"')");
	$("#item-contract").html(nft.token_address.slice(0,6)+"...."+nft.token_address.slice(-3));
	$("#item-tokenid").html(nft.token_id);
	$("#item-token-standard").html(nft.contract_type);
	$("#item-chain").html(nft.chain_name);
	$("#sell-button").attr("onclick","listItemForSale("+nft.token_id+",'"+nft.token_address+"',"+nft.asking_price+")");
	if(nft.owner_of == currentUserAddress){
		$("#edit-button").attr("href","/edit_nft?tokenAddress="+nft.token_address+"&tokenId="+nft.token_id+"&edit=true");
	}
	else{
		$("#only-onwner-tab").hide();
	}
	if(nft.owner_of == currentUserAddress){
		$("#owner").html("you");	
	}
	else{
		$("#item-name").html(nft.owner_of);
		$("#refresh-metadata-button").hide();
	}
	fetch(metadataUri)
        .then(response => response.json())
        .then(data =>{
			$("#item-image").attr("src", data.image);
			$("#name").html(data.name);
			$("#description").html(data.description);
			$("#name").val(data.name);
			$("#description").val(data.description);
		}).catch((error)=> {
			$("#item-image").attr("src", noimage);
			$("#name").html("unamed");
			if(nft.owner_of == currentUserAddress){
				$("#owner").html("you");	
			}
			else{
				$("#name").html(data.owner_of);
			}
		})
}

//Update Profile
window.updateProfile = async () => {
    if(user)
    {   
        user.set("username",$("#username").val());
        user.set("email",$("#email").val());
        if($("#avatar").prop("files").length > 0 ){
            let tempPath = URL.createObjectURL($("#avatar").prop("files")[0]);
            $("#user-avatar").attr("src",tempPath);
            var avatar = new Moralis.File("avatar.jpg", $("#avatar").prop("files")[0]);
            user.set("avatar", avatar);
        }
    }
    try{
        await user.save();
        Toastify({
            text: "Profile Updated Successfully",    
            duration: 2000 ,
            style: {
                background: "green", margin: "auto"
            }  
        }).showToast();
    }
    catch(error){
        Toastify({
            text: error,    
            duration: 4000 ,
            style: {
                background: "red", margin: "auto"
            }  
        }).showToast();
    };
}

$("#update-nft").on("click",async function(){
	const metadataURI = await uploadDataToIPFS();
	var tokenID = $("#token-id").val();
	await updateNft(tokenID, metadataURI);
})

window.refreshMetaData = async (tokenId,tokenAddress) => {
	const query = new Moralis.Query("EthTokenBalance");
	const userEthNFTs = await Moralis.Web3.getNFTs({ chain: "rinkeby", address: currentUserAddress});
	currentChain = await getSelectedChain();
	var metadataURI;
    userEthNFTs.forEach(async function (nft) {
        if(tokenId == nft.token_id && tokenAddress == nft.token_address){
        	metadataURI = nft.token_uri;
			return;
		}
    });
	if(metadataURI){
		console.log(tokenAddress);
		query.equalTo("token_address", ""+tokenAddress+"");
		query.equalTo("token_id", ""+tokenId+"");
		const queryResults = await query.find();
		console.log(queryResults);
		for (let i = 0; i < queryResults.length; i++) {
		queryResults[i].set("token_uri", metadataURI);
		queryResults[i].save();
		}
	}
	alert("updated");
	
}

$("#item-image-field").on("change",()=>{
	if($("#item-image-field").prop("files").length > 0 ){
		let tempPath = URL.createObjectURL($("#item-image-field").prop("files")[0]);
		$("#item-image").attr("src",tempPath);
	}
})


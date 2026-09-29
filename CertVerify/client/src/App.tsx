import React, { useState } from 'react';
import Web3 from 'web3';

const CONTRACT_ABI: any = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "productId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "manufacturer", "type": "string" },
      { "indexed": false, "internalType": "address", "name": "owner", "type": "address" }
    ],
    "name": "ProductCreated",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_productId", "type": "uint256" },
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_manufacturer", "type": "string" }
    ],
    "name": "createProduct",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_productId", "type": "uint256" },
      { "internalType": "uint8", "name": "_state", "type": "uint8" }
    ],
    "name": "updateProductState",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_productId", "type": "uint256" }],
    "name": "getProduct",
    "outputs": [
      { "internalType": "uint256", "name": "productId", "type": "uint256" },
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "manufacturer", "type": "string" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "address", "name": "currentOwner", "type": "address" },
      { "internalType": "uint8", "name": "state", "type": "uint8" },
      { "internalType": "bool", "name": "exists", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// NOTE: Yahan 'truffle migrate' chalane par milne wala Contract Address paste karein
const CONTRACT_ADDRESS = "0x8fdc0148774e82a4501d4132bfaac035d88c4bb060738a108113763f84eab2af";

export default function App() {
  const [account, setAccount] = useState<string>('');
  
  const [pId, setPId] = useState('');
  const [pName, setPName] = useState('');
  const [pManufacturer, setPManufacturer] = useState('');

  const [searchId, setSearchId] = useState('');
  const [productDetails, setProductDetails] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  const stateNames = ["Created", "In Transit", "Delivered"];

  const connectWallet = async () => {
    if ((window as any).ethereum) {
      const web3 = new Web3((window as any).ethereum);
      await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
    } else {
      alert('Please install MetaMask extension in your browser!');
    }
  };

  const registerProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return alert('Please connect your wallet first!');
    
    if (CONTRACT_ADDRESS === "0x8fdc0148774e82a4501d4132bfaac035d88c4bb060738a108113763f84eab2af") {
      return alert('Please update CONTRACT_ADDRESS with your deployed contract address first!');
    }

    const web3 = new Web3((window as any).ethereum);
    const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

    try {
      await contract.methods.createProduct(pId, pName, pManufacturer).send({ from: account });
      alert('Product registered successfully on the blockchain!');
      setPId(''); setPName(''); setPManufacturer('');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const trackProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (CONTRACT_ADDRESS === "0x8fdc0148774e82a4501d4132bfaac035d88c4bb060738a108113763f84eab2af") {
      return alert('Please update CONTRACT_ADDRESS with your deployed contract address first!');
    }

    const web3 = new Web3("http://127.0.0.1:7545");
    const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

    try {
      const res: any = await contract.methods.getProduct(searchId).call();
      if (res.exists) {
        setProductDetails(res);
        setNotFound(false);
      } else {
        setProductDetails(null);
        setNotFound(true);
      }
    } catch {
      setProductDetails(null);
      setNotFound(true);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">📦 SupplyChain Tracker DApp</h1>
        <button onClick={connectWallet} className="btn-wallet">
          {account ? `Connected: ${account.substring(0, 6)}...${account.substring(38)}` : 'Connect Wallet'}
        </button>
      </header>

      <div className="grid">
        <div className="card">
          <h2 className="card-title">Register Product</h2>
          <form onSubmit={registerProduct}>
            <div className="form-group">
              <label>Product ID</label>
              <input type="number" placeholder="e.g. 101" value={pId} onChange={e => setPId(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Product Name</label>
              <input type="text" placeholder="e.g. iPhone 15" value={pName} onChange={e => setPName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Manufacturer</label>
              <input type="text" placeholder="e.g. Apple Inc." value={pManufacturer} onChange={e => setPManufacturer(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary">Register On Blockchain</button>
          </form>
        </div>

        <div className="card">
          <h2 className="card-title">Track Provenance</h2>
          <form onSubmit={trackProduct}>
            <div className="form-group">
              <label>Enter Product ID</label>
              <input type="number" placeholder="Enter Product ID to verify" value={searchId} onChange={e => setSearchId(e.target.value)} required />
            </div>
            <button type="submit" className="btn-secondary">Track Product</button>
          </form>

          {productDetails && (
            <div className="result-box result-success">
              <div className="result-title" style={{ color: '#10b981' }}>
                ✅ Product Authenticity Verified
              </div>
              <div className="result-item">
                <span>Product ID:</span>
                <strong>#{productDetails.productId.toString()}</strong>
              </div>
              <div className="result-item">
                <span>Name:</span>
                <strong>{productDetails.name}</strong>
              </div>
              <div className="result-item">
                <span>Manufacturer:</span>
                <strong>{productDetails.manufacturer}</strong>
              </div>
              <div className="result-item">
                <span>Status:</span>
                <span className="badge">{stateNames[Number(productDetails.state)]}</span>
              </div>
              <div className="result-item">
                <span>Owner:</span>
                <small>{productDetails.currentOwner.substring(0, 10)}...</small>
              </div>
            </div>
          )}

          {notFound && (
            <div className="result-box result-error">
              <div className="result-title" style={{ color: '#ef4444' }}>
                ❌ Product Not Found
              </div>
              <p style={{ fontSize: '14px', color: '#94a3b8' }}>
                No record found on Blockchain for ID #{searchId}. Product might be counterfeit.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
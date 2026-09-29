import { useState } from "react";
import Web3 from "web3";
import { contractABI } from "./contractABI";
import { contractAddress } from "./contractAddress";

function App() {
  const [account, setAccount] = useState("");

  const [certId, setCertId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [course, setCourse] = useState("");
  const [date, setDate] = useState("");
  const [issuer, setIssuer] = useState("");

  const [verifyId, setVerifyId] = useState("");
  const [result, setResult] = useState(null);

  let contract;

  async function connectWallet() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
  }

  async function getContract() {
    const web3 = new Web3(window.ethereum);
    return new web3.eth.Contract(contractABI, contractAddress);
  }

  async function issueCertificate() {
    const contract = await getContract();

    await contract.methods
      .issueCert(certId, studentName, course, date, issuer)
      .send({ from: account });

    alert("Certificate Issued!");
  }

  async function verifyCertificate() {
    const contract = await getContract();

    const data = await contract.methods.verifyCert(verifyId).call();
    setResult(data);
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>🔐 Certify DApp</h1>

      <button onClick={connectWallet}>Connect Wallet</button>
      <p><b>Account:</b> {account}</p>

      <hr />

      <h2>📌 Issue Certificate (Admin)</h2>

      <input placeholder="ID" onChange={(e) => setCertId(e.target.value)} />
      <input placeholder="Name" onChange={(e) => setStudentName(e.target.value)} />
      <input placeholder="Course" onChange={(e) => setCourse(e.target.value)} />
      <input placeholder="Date" onChange={(e) => setDate(e.target.value)} />
      <input placeholder="Issuer" onChange={(e) => setIssuer(e.target.value)} />

      <button onClick={issueCertificate}>Issue</button>

      <hr />

      <h2>🔍 Verify Certificate</h2>

      <input placeholder="Enter ID" onChange={(e) => setVerifyId(e.target.value)} />
      <button onClick={verifyCertificate}>Verify</button>

      {result && (
        <div>
          <h3>Result</h3>
          <p>Name: {result[0]}</p>
          <p>Course: {result[1]}</p>
          <p>Date: {result[2]}</p>
          <p>Issuer: {result[3]}</p>
          <p>Valid: {result[4] ? "Yes" : "No"}</p>
        </div>
      )}
    </div>
  );
}

export default App;
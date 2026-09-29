import { useEffect, useState } from "react";
import Web3 from "web3";
import "./App.css";

declare global {
  interface Window {
    ethereum?: any;
  }
}

type Certificate = {
  certificateId: string;
  studentName: string;
  courseName: string;
  issueDate: string;
  issuer: string;
  exists: boolean;
};

const GANACHE_CHAIN_ID = "5777";
const RPC_URL = "http://127.0.0.1:7545";

function App() {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [account, setAccount] = useState("");
  const [networkOk, setNetworkOk] = useState(false);
  const [contractAddress, setContractAddress] = useState("");
  const [totalCertificates, setTotalCertificates] = useState("0");

  const [certificateId, setCertificateId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [issueDate, setIssueDate] = useState("");

  const [verifyId, setVerifyId] = useState("");
  const [certificate, setCertificate] =
    useState<Certificate | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadContract();

    if (window.ethereum) {
      window.ethereum.on(
        "accountsChanged",
        (accounts: string[]) => {
          setAccount(accounts[0] || "");
        }
      );

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  // Load contract using Ganache RPC
  const loadContract = async () => {
    try {
      const response = await fetch(
        "/contracts/CertificateVerification.json"
      );

      const artifact = await response.json();

      const provider = new Web3.providers.HttpProvider(
        RPC_URL
      );

      const readWeb3 = new Web3(provider);

      const networkId = (
        await readWeb3.eth.getChainId()
      ).toString();

      const deployed = artifact.networks[networkId];

      if (!deployed) {
        setError(
          "Contract is not deployed on Ganache network."
        );
        return;
      }

      const instance = new readWeb3.eth.Contract(
        artifact.abi,
        deployed.address
      );

      setWeb3(readWeb3);
      setContract(instance);
      setContractAddress(deployed.address);

      const count = await instance.methods
        .getCertificateCount()
        .call();

      setTotalCertificates(String(count));
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to Ganache. Make sure Ganache is running."
      );
    }
  };

  // Connect MetaMask without automatically adding RPC
  const connectWallet = async () => {
    setError("");
    setMessage("");

    if (!window.ethereum) {
      setError("MetaMask is not installed.");
      return;
    }

    try {
      // Request MetaMask account
      const accounts =
        await window.ethereum.request({
          method: "eth_requestAccounts",
        });

      if (!accounts || accounts.length === 0) {
        setError("No MetaMask account selected.");
        return;
      }

      const userAccount = accounts[0];

      // Create Web3 using MetaMask provider
      const browserWeb3 = new Web3(
        window.ethereum
      );

      // Check current MetaMask network
      const chainId = (
        await browserWeb3.eth.getChainId()
      ).toString();

      if (chainId !== GANACHE_CHAIN_ID) {
        setNetworkOk(false);

        setError(
          "Please select Ganache Local network in MetaMask."
        );

        return;
      }

      // Load latest contract artifact
      const response = await fetch(
        "/contracts/CertificateVerification.json"
      );

      const artifact = await response.json();

      const deployed =
        artifact.networks[GANACHE_CHAIN_ID];

      if (!deployed) {
        setError(
          "Contract is not deployed on Ganache network."
        );

        return;
      }

      // Create contract using MetaMask provider
      const instance = new browserWeb3.eth.Contract(
        artifact.abi,
        deployed.address
      );

      setWeb3(browserWeb3);
      setContract(instance);
      setAccount(userAccount);
      setContractAddress(deployed.address);
      setNetworkOk(true);

      setMessage("Wallet connected successfully.");
    } catch (err: any) {
      console.error(err);

      if (
        err?.code === 4001 ||
        err?.message
          ?.toLowerCase()
          .includes("user rejected")
      ) {
        setError("MetaMask connection was rejected.");
      } else {
        setError("Failed to connect MetaMask.");
      }
    }
  };

  // Issue certificate
  const issueCertificate = async () => {
    setError("");
    setMessage("");

    if (!window.ethereum) {
      setError("MetaMask is not installed.");
      return;
    }

    if (!account) {
      setError("Please connect MetaMask first.");
      return;
    }

    if (!contract) {
      setError("Smart contract is not loaded.");
      return;
    }

    if (!web3) {
      setError("Web3 connection is not available.");
      return;
    }

    if (
      !certificateId.trim() ||
      !studentName.trim() ||
      !courseName.trim() ||
      !issueDate
    ) {
      setError("Please fill all certificate fields.");
      return;
    }

    try {
      setLoading(true);

      // Make sure MetaMask is still on Ganache
      const currentChainId = (
        await web3.eth.getChainId()
      ).toString();

      if (currentChainId !== GANACHE_CHAIN_ID) {
        setError(
          "Please select Ganache Local network in MetaMask."
        );

        setLoading(false);
        return;
      }

      // Send blockchain transaction
      await contract.methods
        .addCertificate(
          certificateId.trim(),
          studentName.trim(),
          courseName.trim(),
          issueDate
        )
        .send({
          from: account,
        });

      setMessage(
        "Certificate successfully stored on the blockchain."
      );

      // Clear form
      setCertificateId("");
      setStudentName("");
      setCourseName("");
      setIssueDate("");

      // Update certificate count
      const count = await contract.methods
        .getCertificateCount()
        .call();

      setTotalCertificates(count.toString());
    } catch (err: any) {
      console.error("Transaction error:", err);

      const text =
        err?.message || "Transaction failed.";

      if (
        text.includes(
          "Certificate ID already exists"
        )
      ) {
        setError(
          "This Certificate ID already exists."
        );
      } else if (
        text.toLowerCase().includes("user denied") ||
        text.toLowerCase().includes("user rejected")
      ) {
        setError(
          "MetaMask transaction was rejected."
        );
      } else if (
        text.toLowerCase().includes("insufficient funds")
      ) {
        setError(
          "Insufficient ETH in MetaMask account."
        );
      } else {
        setError(
          "Certificate transaction failed. Check MetaMask."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify certificate
  const verifyCertificate = async () => {
    setError("");
    setMessage("");
    setCertificate(null);

    if (!contract) {
      setError(
        "Blockchain connection is not available."
      );

      return;
    }

    if (!verifyId.trim()) {
      setError("Enter a Certificate ID.");
      return;
    }

    try {
      setLoading(true);

      const exists = await contract.methods
        .certificateExists(verifyId.trim())
        .call();

      if (!exists) {
        setError("Certificate Not Found");
        return;
      }

      const result: any = await contract.methods
        .getCertificate(verifyId.trim())
  .call();

      setCertificate({
  certificateId: result[0],
  studentName: result[1],
  courseName: result[2],
  issueDate: result[3],
  issuer: result[4],
  exists: result[5],
});
    } catch (err) {
      console.error(err);
      setError(
        "Certificate could not be verified."
      );
    } finally {
      setLoading(false);
    }
  };

  const shortAddress = (address: string) => {
    if (!address) return "";

    return `${address.slice(
      0,
      6
    )}...${address.slice(-4)}`;
  };

  return (
    <div className="app">

      <header className="navbar">

        <div className="brand">

          <div className="brandIcon">
            ✓
          </div>

          <div>
            <h2>CertVerify</h2>
            <span>
              Blockchain Credentials
            </span>
          </div>

        </div>

        <nav>
          <a href="#home">Home</a>
          <a href="#issue">Issue</a>
          <a href="#verify">Verify</a>
        </nav>

        <button
          className="walletButton"
          onClick={connectWallet}
        >
          {account
            ? `🟢 ${shortAddress(account)}`
            : "Connect Wallet"}
        </button>

      </header>

      <main>

        <section
          id="home"
          className="hero"
        >

          <div className="heroContent">

            <div className="badge">
              ⛓ Blockchain Powered
            </div>

            <h1>
              Verify Certificates
              <br />
              <span>
                With Confidence.
              </span>
            </h1>

            <p>
              Issue and verify academic
              certificates securely using
              blockchain technology.
              Transparent, tamper-resistant
              and independently verifiable.
            </p>

            <div className="heroButtons">

              <a
                href="#issue"
                className="primaryButton"
              >
                Issue Certificate →
              </a>

              <a
                href="#verify"
                className="secondaryButton"
              >
                Verify Certificate
              </a>

            </div>

            <div className="heroStats">

              <div>
                <strong>
                  {totalCertificates}
                </strong>

                <span>
                  Certificates Issued
                </span>
              </div>

              <div>
                <strong>5777</strong>

                <span>
                  Blockchain Network
                </span>
              </div>

              <div>
                <strong>100%</strong>

                <span>
                  On-Chain Verification
                </span>
              </div>

            </div>

          </div>

          <div className="heroCard">

            <div className="blockchainGraphic">

              <div className="chainCircle">
                ✓
              </div>

              <div className="chainLine"></div>

              <div className="chainBox">
                <span>
                  BLOCKCHAIN
                </span>

                <strong>
                  SECURE RECORD
                </strong>
              </div>

            </div>

          </div>

        </section>

        <section className="statusBar">

          <div>

            <span className="statusDot"></span>

            <strong>
              {networkOk
                ? "Wallet Connected"
                : "Blockchain Ready"}
            </strong>

          </div>

          <div>

            <span>Network</span>

            <strong>
              Ganache Local · 5777
            </strong>

          </div>

          <div>

            <span>Contract</span>

            <strong>
              {contractAddress
                ? shortAddress(
                    contractAddress
                  )
                : "Loading..."}
            </strong>

          </div>

        </section>

        {message && (
          <div className="alert successAlert">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="alert errorAlert">
            ⚠ {error}
          </div>
        )}

        <section
          id="issue"
          className="section"
        >

          <div className="sectionHeading">

            <span className="sectionNumber">
              01
            </span>

            <div>
              <p>ISSUE</p>
              <h2>
                Issue a Certificate
              </h2>
            </div>

          </div>

          <div className="card issueCard">

            <div className="cardIntro">

              <div className="largeIcon">
                📜
              </div>

              <div>

                <h3>
                  Create Blockchain Certificate
                </h3>

                <p>
                  Enter the student's details
                  below. The certificate will be
                  permanently recorded on the
                  blockchain.
                </p>

              </div>

            </div>

            <div className="formGrid">

              <div className="field">

                <label>
                  Certificate ID
                </label>

                <input
                  value={certificateId}
                  onChange={(e) =>
                    setCertificateId(
                      e.target.value
                    )
                  }
                  placeholder="e.g. CERT-001"
                />

              </div>

              <div className="field">

                <label>
                  Student Name
                </label>

                <input
                  value={studentName}
                  onChange={(e) =>
                    setStudentName(
                      e.target.value
                    )
                  }
                  placeholder="Enter student name"
                />

              </div>

              <div className="field">

                <label>
                  Course / Degree
                </label>

                <input
                  value={courseName}
                  onChange={(e) =>
                    setCourseName(
                      e.target.value
                    )
                  }
                  placeholder="e.g. B.E. AI & ML"
                />

              </div>

              <div className="field">

                <label>
                  Issue Date
                </label>

                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) =>
                    setIssueDate(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            <button
              className="fullButton"
              onClick={issueCertificate}
              disabled={loading}
            >
              {loading
                ? "Processing Transaction..."
                : "Issue Certificate on Blockchain →"}
            </button>

            <p className="walletNote">
              🔐 MetaMask confirmation is
              required to record the certificate.
            </p>

          </div>

        </section>

        <section
          id="verify"
          className="section verifySection"
        >

          <div className="sectionHeading">

            <span className="sectionNumber">
              02
            </span>

            <div>
              <p>VERIFY</p>
              <h2>
                Verify a Certificate
              </h2>
            </div>

          </div>

          <div className="verifyLayout">

            <div className="card verifyCard">

              <div className="largeIcon">
                🔍
              </div>

              <h3>
                Check Certificate Authenticity
              </h3>

              <p>
                Enter a Certificate ID to
                retrieve its information directly
                from the blockchain.
              </p>

              <div className="field">

                <label>
                  Certificate ID
                </label>

                <input
                  value={verifyId}
                  onChange={(e) =>
                    setVerifyId(
                      e.target.value
                    )
                  }
                  placeholder="e.g. CERT-001"
                />

              </div>

              <button
                className="fullButton"
                onClick={verifyCertificate}
                disabled={loading}
              >
                {loading
                  ? "Verifying..."
                  : "Verify Certificate"}
              </button>

              <div className="readOnly">
                🔗 Read-only blockchain
                verification
              </div>

            </div>

            {certificate ? (
              <div className="certificateResult">

                <div className="verifiedHeader">

                  <div className="verifiedIcon">
                    ✓
                  </div>

                  <div>

                    <span>
                      BLOCKCHAIN STATUS
                    </span>

                    <h3>
                      Certificate Verified
                    </h3>

                  </div>

                </div>

                <div className="resultGrid">

                  <div>
                    <span>
                      Certificate ID
                    </span>

                    <strong>
                      {certificate.certificateId}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Student Name
                    </span>

                    <strong>
                      {certificate.studentName}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Course / Degree
                    </span>

                    <strong>
                      {certificate.courseName}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Issue Date
                    </span>

                    <strong>
                      {certificate.issueDate}
                    </strong>
                  </div>

                  <div className="issuer">

                    <span>
                      Issuer Wallet
                    </span>

                    <strong
                      title={certificate.issuer}
                    >
                      {shortAddress(
                        certificate.issuer
                      )}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Validity
                    </span>

                    <strong className="validText">
                      ✓ VALID ON-CHAIN
                    </strong>

                  </div>

                </div>

              </div>

            ) : (

              <div className="emptyResult">

                <div>✓</div>

                <h3>
                  Verification Result
                </h3>

                <p>
                  Verified certificate
                  information will appear here.
                </p>

              </div>

            )}

          </div>

        </section>

        <section className="features">

          <div className="feature">

            <div>🔐</div>

            <h3>
              Secure
            </h3>

            <p>
              Certificate records are stored
              on blockchain infrastructure.
            </p>

          </div>

          <div className="feature">

            <div>⛓</div>

            <h3>
              Transparent
            </h3>

            <p>
              Anyone can independently verify
              certificate records.
            </p>

          </div>

          <div className="feature">

            <div>✓</div>

            <h3>
              Tamper Resistant
            </h3>

            <p>
              Duplicate certificate IDs are
              prevented by the smart contract.
            </p>

          </div>

        </section>

      </main>

      <footer>

        <div>

          <strong>
            CertVerify
          </strong>

          <span>
            Decentralized Certificate
            Verification DApp
          </span>

        </div>

        <span>
          Built with React · Web3.js · Solidity · Ganache
        </span>

      </footer>

    </div>
  );
}

export default App;
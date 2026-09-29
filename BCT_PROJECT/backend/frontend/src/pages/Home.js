import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [certId, setCertId] = useState("");
  const navigate = useNavigate();

  const handleVerify = () => {
    if (!certId) return alert("Enter Certificate ID");

    navigate("/result", { state: { certId } });
  };

  return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      <h1>🔐 Certificate Verification</h1>

      <input
        placeholder="Enter Certificate ID"
        value={certId}
        onChange={(e) => setCertId(e.target.value)}
        style={{ padding: 10, width: 250 }}
      />

      <br /><br />

      <button onClick={handleVerify} style={{ padding: 10 }}>
        Verify
      </button>
    </div>
  );
}
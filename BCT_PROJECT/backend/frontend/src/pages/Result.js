import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { certId } = location.state || {};

  const [data, setData] = useState(null);

  useEffect(() => {
    if (!certId) {
      navigate("/");
      return;
    }

    axios.get(`http://localhost:5000/verify/${certId}`)
      .then(res => setData(res.data));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h2>Result</h2>

      {!data ? (
        <p>Loading...</p>
      ) : data.valid ? (
        <div style={{ color: "green" }}>
          <h3>✔ VALID CERTIFICATE</h3>
          <p>Name: {data.data.name}</p>
          <p>Course: {data.data.course}</p>
          <p>Issuer: {data.data.issuer}</p>
          <p>Status: {data.data.status}</p>
        </div>
      ) : (
        <h3 style={{ color: "red" }}>❌ {data.message}</h3>
      )}
    </div>
  );
}
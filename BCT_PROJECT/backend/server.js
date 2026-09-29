const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 📦 Fake Database
const certificates = {
  "CERT101": {
    name: "Rahul Sharma",
    course: "AI & ML",
    issuer: "XYZ University",
    status: "ACTIVE"
  },
  "CERT102": {
    name: "Anjali Patil",
    course: "Data Science",
    issuer: "ABC Institute",
    status: "ACTIVE"
  }
};

// 🔍 Verify API
app.get("/verify/:id", (req, res) => {
  const cert = certificates[req.params.id];

  if (!cert) {
    return res.json({
      valid: false,
      message: "Certificate Not Found ❌"
    });
  }

  res.json({
    valid: true,
    message: "Certificate Verified ✔",
    data: cert
  });
});

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
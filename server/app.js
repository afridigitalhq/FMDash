const express = require("express");
const connectDB = require("./config/db"); // import the function

const app = express();

// Connect to MongoDB
connectDB();

app.use(express.json());

// Serve static frontend files
app.use(express.static(__dirname + "/../client"));

// Example API route (replace with your scan API later)
app.get("/api/scans", (req, res) => {
  res.json([]);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 FMDash running on port ${PORT}`));



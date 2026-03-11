const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://afrilove_admin:AFriLove%2B2026%23@afrilove-cluster.qznhpnf.mongodb.net/afrilove?retryWrites=true&w=majority"
    );
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Error:", err);
  }
};

module.exports = connectDB;


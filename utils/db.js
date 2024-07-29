const mongoose = require("mongoose");
require("dotenv").config();

const url = process.env.URL;

const connectToDatabase = async () => {
  try {
    await mongoose.connect(url, {
      maxPoolSize: 10, // Jumlah maksimum koneksi dalam pool
      minPoolSize: 5, // Jumlah minimum koneksi dalam pool
      connectTimeoutMS: 10000, // Timeout untuk koneksi baru (10 detik)
      socketTimeoutMS: 45000, // Timeout untuk operasi socket (45 detik)
    });
    console.log("Connected to MongoDB with connection pooling");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
};

// Menangani penutupan koneksi saat aplikasi berhenti
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  } catch (err) {
    console.error("Error closing MongoDB connection:", err);
    process.exit(1);
  }
});

module.exports = { connectToDatabase };

// =================== IMPORTS ===================
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// =================== CONFIG ===================
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// =================== ROUTES ===================
const studentRoutes = require("./routes/studentRoutes");
app.use("/api", studentRoutes);

// =================== SERVE FRONTEND ===================
// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, "frontend")));

// Default route → serve index.html (Student Portal or Landing Page)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// Admin portal
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "admin.html"));
});

// =================== DATABASE & SERVER ===================
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));

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
app.use(cors()); // Allow all origins (safe for dev; restrict in prod if needed)
app.use(express.json());

// =================== ROUTES ===================
const studentRoutes = require("./routes/studentRoutes");
app.use("/api", studentRoutes);

// =================== SERVE FRONTEND ===================
const frontendPath = path.join(__dirname, "frontend");
app.use(express.static(frontendPath));

// Student portal (default)
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Admin portal
app.get("/admin", (req, res) => {
  res.sendFile(path.join(frontendPath, "admin.html"));
});

// Health check (for Render/debugging)
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "✅ Z2A Academy server running" });
});

// =================== DATABASE & SERVER ===================
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0"; // Required for Render & external devices

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

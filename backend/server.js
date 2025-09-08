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
app.use(cors()); // allow all origins (safe for testing; restrict in prod)
app.use(express.json());

// =================== ROUTES ===================
const studentRoutes = require("./routes/studentRoutes");
app.use("/api", studentRoutes);

// =================== SERVE FRONTEND ===================
// Serve static files from frontend folder
const frontendPath = path.join(__dirname, "frontend");
app.use(express.static(frontendPath));

// Default route → serve index.html (Student Portal / Landing Page)
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Admin portal
app.get("/admin", (req, res) => {
  res.sendFile(path.join(frontendPath, "admin.html"));
});

// Health check (useful for Render / debugging)
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "✅ Z2A Academy server running" });
});

// =================== DATABASE & SERVER ===================
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0"; // ensures works on Render & other devices

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, HOST, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

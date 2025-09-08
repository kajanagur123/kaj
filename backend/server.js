const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
const studentRoutes = require("./routes/studentRoutes");
app.use("/api", studentRoutes);

// Root route (optional)
app.get("/", (req, res) => {
  res.send("✅ Z2A Academy Backend is running!");
});

const PORT = process.env.PORT || 5000;

// MongoDB connection + server start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () =>
      console.log(`🚀 Z2A Academy backend running on port ${PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));

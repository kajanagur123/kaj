const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// API routes
const studentRoutes = require("./routes/studentRoutes");
app.use("/api", studentRoutes);

// Serve frontend (static files)
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log("Z2A Academy running on port " + PORT));
  })
  .catch(err => console.error(err));


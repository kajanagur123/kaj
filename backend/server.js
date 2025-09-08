const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Root route for Render
app.get("/", (req, res) => {
  res.send("Z2A Academy backend is running!");
});

// API routes
const studentRoutes = require("./routes/studentRoutes");
app.use("/api", studentRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => { 
    console.log("MongoDB connected"); 
    app.listen(PORT, () => console.log("Server running on port " + PORT)); 
  })
  .catch(err => console.error(err));

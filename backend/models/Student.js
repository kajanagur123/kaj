const mongoose = require("mongoose");
const studentSchema = new mongoose.Schema({
  name: String,
  roll: { type: String, unique: true },
  dob: String,
  grade: String,
  subjects: [String],
  marks: [Number],
  total: Number,
  passFail: String
});
module.exports = mongoose.model("Student", studentSchema);

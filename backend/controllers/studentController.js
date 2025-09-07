const Student = require("../models/Student");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (username === "Z2A" && password === "1234") {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return res.json({ token });
  }
  res.status(401).json({ message: "Invalid credentials" });
};

exports.createStudent = async (req, res) => {
  try { const student = new Student(req.body); await student.save(); res.json(student); }
  catch (err) { res.status(400).json({ error: err.message }); }
};

exports.getStudents = async (req, res) => { res.json(await Student.find()); };
exports.getStudent = async (req, res) => { res.json(await Student.findById(req.params.id)); };
exports.updateStudent = async (req, res) => { res.json(await Student.findByIdAndUpdate(req.params.id, req.body, { new: true })); };
exports.deleteStudent = async (req, res) => { await Student.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); };

exports.searchStudent = async (req, res) => {
  const { roll, dob } = req.body;
  const student = await Student.findOne({ roll, dob });
  if (!student) return res.status(404).json({ message: "Not found" });
  res.json(student);
};

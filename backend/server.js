// =================== IMPORTS ===================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // if using JWT for admin auth
require('dotenv').config();

// =================== INIT ===================
const app = express();
const PORT = process.env.PORT || 5000;

// =================== MIDDLEWARE ===================
// Enable CORS for all origins
app.use(cors({ origin: '*' }));

// Parse JSON bodies
app.use(express.json());

// =================== MONGODB CONNECTION ===================
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// =================== SCHEMAS & MODELS ===================
const studentSchema = new mongoose.Schema({
  name: String,
  roll: String,
  dob: Date,
  grade: String,
  subjects: [String],
  marks: [Number],
  subjectResults: [String],
  total: Number,
  passFail: String
});

const Student = mongoose.model('Student', studentSchema);

// =================== ROUTES ===================

// Admin login example (simple)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === '1234') {
    const token = jwt.sign({ username }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    return res.json({ token });
  }
  res.status(401).json({ message: 'Invalid credentials' });
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

// Get all students
app.get('/api/students', verifyToken, async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new student
app.post('/api/students', verifyToken, async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving student' });
  }
});

// Update student
app.put('/api/students/:id', verifyToken, async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating student' });
  }
});

// Delete student
app.delete('/api/students/:id', verifyToken, async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting student' });
  }
});

// Search student
app.post('/api/search', async (req, res) => {
  const { roll, dob } = req.body;
  try {
    const student = await Student.findOne({ roll, dob: new Date(dob) });
    res.json(student || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error searching student' });
  }
});

// =================== START SERVER ===================
app.listen(PORT, () => {
  console.log(`🚀 Server running at port ${PORT}`);
});


const express = require("express");
const router = express.Router();
const { login, createStudent, getStudents, getStudent, updateStudent, deleteStudent, searchStudent } = require("../controllers/studentController");
const auth = require("../middleware/auth");

router.post("/login", login);
router.post("/students", auth, createStudent);
router.get("/students", auth, getStudents);
router.get("/students/:id", auth, getStudent);
router.put("/students/:id", auth, updateStudent);
router.delete("/students/:id", auth, deleteStudent);
router.post("/search", searchStudent);

module.exports = router;

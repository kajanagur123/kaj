const apiUrl = 'https://z2a-academy.onrender.com/api';

let token = '';

// ===============================
// Admin Login
// ===============================
document.getElementById('loginForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  try {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    const res = await fetch(apiUrl + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (data.token) {
      token = data.token;
      document.getElementById('loginForm').style.display = 'none';
      document.getElementById('adminDashboard').style.display = 'block';
      loadStudents();
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (err) {
    console.error('Login error:', err);
    alert('Server error while logging in');
  }
});

// ===============================
// Add Student
// ===============================
document.getElementById('studentForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  try {
    const student = {
      name: document.getElementById('name').value,
      roll: document.getElementById('roll').value,
      dob: document.getElementById('dob').value,
      grade: document.getElementById('grade').value,
      subjects: document.getElementById('subjects').value.split(',').map(s => s.trim()),
      marks: document.getElementById('marks').value.split(',').map(Number),
      total: Number(document.getElementById('total').value),
      passFail: document.getElementById('passFail').value
    };

    await fetch(apiUrl + '/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(student)
    });

    loadStudents();
    e.target.reset();
  } catch (err) {
    console.error('Add student error:', err);
    alert('Error adding student');
  }
});

// ===============================
// Load Students
// ===============================
async function loadStudents() {
  try {
    const res = await fetch(apiUrl + '/students', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const students = await res.json();

    const tbody = document.querySelector('#studentTable tbody');
    tbody.innerHTML = '';

    students.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${s.name}</td>
        <td>${s.roll}</td>
        <td>${s.grade}</td>
        <td>${s.total}</td>
        <td>${s.passFail}</td>
        <td><button onclick="deleteStudent('${s._id}')">Delete</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Load students error:', err);
    alert('Error loading students');
  }
}

// ===============================
// Delete Student
// ===============================
async function deleteStudent(id) {
  try {
    await fetch(apiUrl + '/students/' + id, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    loadStudents();
  } catch (err) {
    console.error('Delete student error:', err);
    alert('Error deleting student');
  }
}

// ===============================
// Student Search
// ===============================
document.getElementById('searchForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  try {
    const roll = document.getElementById('roll').value;
    const dob = document.getElementById('dob').value;

    const res = await fetch(apiUrl + '/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roll, dob })
    });

    const student = await res.json();
    if (student.name) {
      document.getElementById('result').innerHTML = `
        <pre>${JSON.stringify(student, null, 2)}</pre>
      `;
      document.getElementById('downloadBtn').style.display = 'block';
      document.getElementById('downloadBtn').onclick = () => downloadPDF(student);
    } else {
      alert('Student not found');
    }
  } catch (err) {
    console.error('Search error:', err);
    alert('Error searching student');
  }
});

// ===============================
// PDF Download
// ===============================
function downloadPDF(student) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text(`Z2A Academy Result`, 10, 10);
  doc.text(`Name: ${student.name}`, 10, 20);
  doc.text(`Roll: ${student.roll}`, 10, 30);
  doc.text(`Grade: ${student.grade}`, 10, 40);
  doc.text(`Total: ${student.total}`, 10, 50);
  doc.text(`Result: ${student.passFail}`, 10, 60);

  doc.save(`${student.roll}_result.pdf`);
}

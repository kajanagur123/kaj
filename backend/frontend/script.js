// Point frontend to your live backend on Render
const apiUrl = 'https://z2a-academy.onrender.com/api';
let token = '';

// Admin login
document.getElementById('loginForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
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
    alert('Login failed');
  }
});

// Add student
document.getElementById('studentForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const student = {
    name: document.getElementById('name').value,
    roll: document.getElementById('roll').value,
    dob: document.getElementById('dob').value,
    grade: document.getElementById('grade').value,
    subjects: document.getElementById('subjects').value.split(','),
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
});

// Load students
async function loadStudents() {
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
}

async function deleteStudent(id) {
  await fetch(apiUrl + '/students/' + id, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  loadStudents();
}

// Student portal search
document.getElementById('searchForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const roll = document.getElementById('roll').value;
  const dob = document.getElementById('dob').value;
  const res = await fetch(apiUrl + '/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roll, dob })
  });
  const student = await res.json();
  if (student.name) {
    document.getElementById('result').innerHTML = JSON.stringify(student, null, 2);
    document.getElementById('downloadBtn').style.display = 'block';
    document.getElementById('downloadBtn').onclick = () => downloadPDF(student);
  } else {
    alert('Not found');
  }
});

// PDF Download
function downloadPDF(student) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text(`Z2A Academy Result`, 10, 10);
  doc.text(`Name: ${student.name}`, 10, 20);
  doc.text(`Roll: ${student.roll}`, 10, 30);
  doc.text(`Grade: ${student.grade}`, 10, 40);
  doc.text(`Total: ${student.total}`, 10, 50);
  doc.text(`Result: ${student.passFail}`, 10, 60);
  doc.save('result.pdf');
}

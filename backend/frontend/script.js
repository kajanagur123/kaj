/// =================== CONFIG ===================
// Dynamically determine API base URL
const apiUrl = window.location.hostname === "localhost"
  ? "http://localhost:5000/api"
  : "https://z2a.onrender.com/api";

let token = '';
let currentStudent = null; // For student marksheet display

// =================== ADMIN LOGIN ===================
document.getElementById('loginForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(`${apiUrl}/login`, {
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
      alert('Login failed.');
    }
  } catch (err) {
    console.error('Login error:', err);
    alert('Server error, please try again later.');
  }
});

// =================== ADD / EDIT STUDENT ===================
document.getElementById('studentForm')?.addEventListener('submit', async e => {
  e.preventDefault();

  const studentId = document.getElementById('studentId')?.value || null;
  const subjects = document.getElementById('subjects').value.split(',').map(s => s.trim());
  const marks = document.getElementById('marks').value.split(',').map(m => Number(m.trim()));
  const subjectResults = document.getElementById('subjectResults')?.value
    .split(',').map(r => r.trim());

  const total = marks.reduce((sum, m) => sum + m, 0);
  const student = {
    name: document.getElementById('name').value,
    roll: document.getElementById('roll').value,
    dob: document.getElementById('dob').value,
    grade: document.getElementById('grade').value,
    subjects,
    marks,
    subjectResults,
    total,
    passFail: document.getElementById('passFail').value
  };

  const url = studentId
    ? `${apiUrl}/students/${studentId}`
    : `${apiUrl}/students`;
  const method = studentId ? 'PUT' : 'POST';

  try {
    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(student)
    });

    document.getElementById('studentForm').reset();
    if (document.getElementById('studentId'))
      document.getElementById('studentId').value = '';
    loadStudents();
  } catch (err) {
    console.error('Save student error:', err);
    alert('Error saving student.');
  }
});

// =================== LOAD STUDENTS TABLE ===================
async function loadStudents() {
  try {
    const res = await fetch(`${apiUrl}/students`, {
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
        <td>${s.subjects.join(', ')}</td>
        <td>${s.marks.join(', ')}</td>
        <td>${s.subjectResults?.join(', ') || '-'}</td>
        <td>${s.total}</td>
        <td>${s.passFail}</td>
        <td>
          <button onclick="editStudent('${s._id}')">Edit</button>
          <button onclick="deleteStudent('${s._id}')">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Load students error:', err);
  }
}

// =================== EDIT / DELETE STUDENT ===================
async function editStudent(id) {
  try {
    const res = await fetch(`${apiUrl}/students/${id}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const s = await res.json();

    document.getElementById('studentId').value = s._id;
    document.getElementById('name').value = s.name;
    document.getElementById('roll').value = s.roll;
    document.getElementById('dob').value = s.dob.split('T')[0];
    document.getElementById('grade').value = s.grade;
    document.getElementById('subjects').value = s.subjects.join(', ');
    document.getElementById('marks').value = s.marks.join(', ');
    document.getElementById('subjectResults').value = s.subjectResults?.join(', ')
      || '';
    document.getElementById('total').value = s.total;
    document.getElementById('passFail').value = s.passFail;
  } catch (err) {
    console.error('Edit student error:', err);
  }
}

async function deleteStudent(id) {
  if (!confirm('Are you sure you want to delete this student?')) return;
  try {
    await fetch(`${apiUrl}/students/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    loadStudents();
  } catch (err) {
    console.error('Delete student error:', err);
  }
}

// =================== STUDENT PORTAL SEARCH ===================
document.getElementById('searchForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const roll = document.getElementById('roll').value;
  const dob = document.getElementById('dob').value;

  try {
    const res = await fetch(`${apiUrl}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roll, dob })
    });

    const student = await res.json();

    if (student.name) {
      currentStudent = student;
      displayResult(student);
      document.getElementById('downloadBtn').style.display = 'inline-block';
    } else {
      document.getElementById('result').innerHTML =
        '<p style="color:red;">Student not found.</p>';
      document.getElementById('downloadBtn').style.display = 'none';
    }
  } catch (err) {
    console.error('Search error:', err);
  }
});

// =================== DISPLAY STUDENT RESULT ===================
function displayResult(s) {
  const resultDiv = document.getElementById('result');
  let html = `
    <h2>Marksheet</h2>
    <p><strong>Name:</strong> ${s.name}</p>
    <p><strong>Roll:</strong> ${s.roll}</p>
    <p><strong>DOB:</strong> ${s.dob.split('T')[0]}</p>
    <p><strong>Grade:</strong> ${s.grade}</p>
    <p><strong>Subjects & Marks:</strong></p><ul>
  `;

  s.subjects.forEach((subj, i) => {
    const mark = s.marks[i] !== undefined ? s.marks[i] : '-';
    const res = s.subjectResults?.[i] || '-';
    html += `<li>${subj}: ${mark} (${res})</li>`;
  });

  html += `
    </ul>
    <p><strong>Total:</strong> ${s.total}</p>
    <p><strong>Overall Result:</strong> ${s.passFail}</p>
  `;

  resultDiv.innerHTML = html;
}

// =================== PDF DOWNLOAD ===================
document.getElementById('downloadBtn')?.addEventListener('click', () => {
  if (!currentStudent) return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Z2A Academy - Marksheet', 20, 20);
  doc.setFontSize(12);
  doc.text(`Name: ${currentStudent.name}`, 20, 40);
  doc.text(`Roll: ${currentStudent.roll}`, 20, 50);
  doc.text(`DOB: ${currentStudent.dob.split('T')[0]}`, 20, 60);
  doc.text(`Grade: ${currentStudent.grade}`, 20, 70);
  doc.text('Subjects & Marks:', 20, 80);

  let y = 90;
  currentStudent.subjects.forEach((subj, i) => {
    const mark = currentStudent.marks[i] !== undefined
      ? currentStudent.marks[i] : '-';
    const res = currentStudent.subjectResults?.[i] || '-';
    doc.text(`${subj}: ${mark} (${res})`, 30, y);
    y += 10;
  });

  doc.text(`Total: ${currentStudent.total}`, 20, y + 10);
  doc.text(`Overall Result: ${currentStudent.passFail}`, 20, y + 20);
  doc.save(`${currentStudent.roll}_marksheet.pdf`);
});

// Logout function for patient dashboard
function logout() {
  window.location.href = '../index.html';
}
// ---------- Feedback Function ----------
function submitFeedback() {
  const doctor = document.getElementById("doctorId").value;
  const rating = document.getElementById("rating").value;
  const comments = document.getElementById("comments").value;

  if (!rating || !comments) {
    alert("Please fill in all fields!");
    return;
  }

  alert(`Feedback submitted!\nDoctor: ${doctor}\nRating: ${rating}\nComments: ${comments}`);

  document.getElementById("rating").value = "";
  document.getElementById("comments").value = "";
}

// ---------- Update Stat Counts ----------
function updateDashboardStats() {
  const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
  const reports = JSON.parse(localStorage.getItem("uploadedReports") || "[]");
  const feedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");

  const apptEl = document.getElementById("totalAppointments");
  const repEl  = document.getElementById("uploadedReports");
  const fbEl   = document.getElementById("givenFeedbacks");

  if (apptEl) apptEl.textContent = appointments.length;
  if (repEl)  repEl.textContent  = reports.length;
  if (fbEl)   fbEl.textContent   = feedbacks.length;
}

// ---------- Upcoming Appointments JS ----------
function renderUpcomingAppointments() {
  const table = document.getElementById("appointmentsTable"); // fixed ID
  if (!table) return;

  table.innerHTML = "";
  const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");

  // Show only today or future appointments
  const today = new Date().toISOString().split("T")[0];
  const upcoming = appointments.filter(appt => appt.date >= today);

  if (upcoming.length === 0) {
    table.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#94a3b8;">No upcoming appointments.</td></tr>`;
    return;
  }

  // Store real indices so remove works on original array
  upcoming.forEach((appt) => {
    const realIndex = appointments.indexOf(appt);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${appt.patientId || '-'}</td>
      <td>${appt.doctor}</td>
      <td>${appt.date}</td>
      <td>${appt.time}</td>
      <td>
        <button style="background:#ef4444;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;" onclick="removeAppointment(${realIndex})">Remove</button>
      </td>
    `;
    table.appendChild(row);
  });
}

function removeAppointment(index) {
  let appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
  if (confirm("Are you sure you want to remove this appointment?")) {
    appointments.splice(index, 1);
    localStorage.setItem("appointments", JSON.stringify(appointments));
    updateDashboardStats();
    renderUpcomingAppointments();
  }
}

function downloadAppointment(index) {
  const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
  const appt = appointments[index];

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Appointment Details", 20, 20);
  doc.setFontSize(12);
  doc.text(`Name: ${appt.name}`, 20, 40);
  doc.text(`Doctor: ${appt.doctor}`, 20, 50);
  doc.text(`Date: ${appt.date}`, 20, 60);
  doc.text(`Time: ${appt.time}`, 20, 70);

  doc.save(`Appointment_${appt.name}.pdf`);
}

// Render appointments on page load
document.addEventListener("DOMContentLoaded", () => {
  updateDashboardStats();
  renderUpcomingAppointments();
  renderDashboardReports();
  renderFeedbackTable();
});

// ---------- Render Shared Reports on Dashboard ----------
function renderDashboardReports() {
  const container = document.getElementById("dashboardShareSection");
  if (!container) return;

  const reports = JSON.parse(localStorage.getItem("uploadedReports") || "[]");

  container.innerHTML = "";

  if (reports.length === 0) {
    container.innerHTML = '<p style="color:#94a3b8;">No reports uploaded yet.</p>';
    return;
  }

  reports.forEach((report, index) => {
    const card = document.createElement("div");
    card.className = "report-thumb-card";
    const imgSrc = report.image || '';
    card.innerHTML = `
      <div class="thumb-image-wrap" onclick="openDashboardModal('${imgSrc}')">
        <img src="${imgSrc}" alt="${report.category}" class="report-thumb">
      </div>
      <div class="thumb-label">${report.category}</div>
      <div class="thumb-actions">
        <button class="thumb-btn thumb-btn-delete" onclick="removeDashboardReport(${index})">Delete</button>
        <a href="edit_uploaded_file.html?index=${index}" class="thumb-btn thumb-btn-replace">Replace</a>
      </div>
    `;
    container.appendChild(card);
  });
}

// ---------- Dashboard Image Modal ----------
function openDashboardModal(src) {
  document.getElementById("dashboardModalImage").src = src;
  document.getElementById("dashboardImageModal").style.display = "flex";
}

function closeDashboardModal() {
  document.getElementById("dashboardImageModal").style.display = "none";
}

// Remove Report From Dashboard
function removeDashboardReport(index) {
  let reports = JSON.parse(localStorage.getItem("uploadedReports") || "[]");

  if (confirm("Are you sure you want to remove this report?")) {
    reports.splice(index, 1);
    localStorage.setItem("uploadedReports", JSON.stringify(reports));
    updateDashboardStats();
    renderDashboardReports();
  }
}

// ---------- Render Feedback Table on Dashboard ----------
function renderFeedbackTable() {
  const tbody = document.getElementById("feedbackTableBody");
  if (!tbody) return;

  const feedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");
  tbody.innerHTML = "";

  if (feedbacks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#94a3b8;">No feedback submitted yet.</td></tr>`;
    return;
  }

  feedbacks.forEach((fb, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${fb.doctor}</td>
      <td>${fb.rating}</td>
      <td>${fb.comments}</td>
      <td>
        <button style="background:#f59e0b;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;margin-right:4px;" onclick="editDashboardFeedback(${index})">Edit</button>
        <button style="background:#ef4444;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;" onclick="removeDashboardFeedback(${index})">Remove</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function editDashboardFeedback(index) {
  window.location.href = `edit_comment_file.html?index=${index}`;
}

function removeDashboardFeedback(index) {
  if (!confirm("Are you sure you want to remove this feedback?")) return;
  const feedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");
  feedbacks.splice(index, 1);
  localStorage.setItem("feedbacks", JSON.stringify(feedbacks));
  updateDashboardStats();
  renderFeedbackTable();
}
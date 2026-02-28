// Logout function for admin dashboard
function logout() {
  window.location.href = '../index.html';
}
// ---------- Load Counts ----------
function loadDashboardCounts() {
  const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
  const feedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");
  const reports = JSON.parse(localStorage.getItem("uploadedReports") || "[]");

  if (document.getElementById("totalAppointments"))
    document.getElementById("totalAppointments").textContent = appointments.length;

  if (document.getElementById("totalFeedbacks"))
    document.getElementById("totalFeedbacks").textContent = feedbacks.length;

  if (document.getElementById("totalReports"))
    document.getElementById("totalReports").textContent = reports.length;

  if (document.getElementById("analyticsAppointments"))
    document.getElementById("analyticsAppointments").textContent = appointments.length;

  if (document.getElementById("analyticsFeedbacks"))
    document.getElementById("analyticsFeedbacks").textContent = feedbacks.length;

  if (document.getElementById("analyticsReports"))
    document.getElementById("analyticsReports").textContent = reports.length;
}

// ---------- Render Appointments ----------
function renderAdminAppointments() {
  const table = document.getElementById("adminAppointmentsTable");
  if (!table) return;

  const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
  table.innerHTML = "";

  appointments.forEach((appt, index) => {
    const row = document.createElement("tr");
    // show a disabled Sent button when already sent
    const actionButton = appt.sent ?
      `<button class="btn btn-success btn-sm" disabled>Sent</button>` :
      `<button class="btn btn-info btn-sm ms-2" onclick="sendAppointmentToDoctor(${index})">Send to Doctor</button>`;
    // Show Patient ID and Status if available, otherwise '-'
    const patientId = appt.patientId ? appt.patientId : '-';
    let status = '-';
    if (appt.sent) status = 'Sent';
    row.innerHTML = `
      <td>${patientId}</td>
      <td>${appt.name}</td>
      <td>${appt.phone}</td>
      <td>${appt.doctor}</td>
      <td>${appt.date}</td>
      <td>${appt.time}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="removeAppointment(${index})">Delete</button>
        ${actionButton}
      </td>
    `;
    table.appendChild(row);
  });
}

// Send appointment to doctor's inbox (doctorInbox)
function sendAppointmentToDoctor(index) {
  const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
  if (!appointments[index]) return alert("Appointment not found");

  const inbox = JSON.parse(localStorage.getItem("doctorInbox") || "[]");
  inbox.push(appointments[index]);
  localStorage.setItem("doctorInbox", JSON.stringify(inbox));

  // Mark appointment as sent in admin list
  appointments[index].sent = true;
  localStorage.setItem("appointments", JSON.stringify(appointments));

  // re-render UI
  renderAdminAppointments();
  loadDashboardCounts();

  alert("Appointment sent to doctor inbox.");
}

function removeAppointment(index) {
  let appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
  if (confirm("Delete this appointment?")) {
    appointments.splice(index, 1);
    localStorage.setItem("appointments", JSON.stringify(appointments));
    renderAdminAppointments();
    loadDashboardCounts();
  }
}

// ---------- Non-Regular Appointment Functions ----------
// Initialize 24-hour auto-removal check
function initNonRegularAutoRemoval() {
  cleanExpiredNonRegularAppointments();
  // Check every hour
  setInterval(cleanExpiredNonRegularAppointments, 3600000);
}

// Remove appointments older than 24 hours
function cleanExpiredNonRegularAppointments() {
  let nonRegularAppts = JSON.parse(localStorage.getItem("nonRegularAppointments") || "[]");
  const now = new Date().getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  nonRegularAppts = nonRegularAppts.filter(appt => {
    const createdTime = new Date(appt.createdAt).getTime();
    return (now - createdTime) < oneDayMs;
  });

  localStorage.setItem("nonRegularAppointments", JSON.stringify(nonRegularAppts));
  renderNonRegularAppointments();
}

// Search for non-regular appointment by patient ID
function searchNonRegularAppointment() {
  const searchInput = document.getElementById("nonRegularSearchInput");
  const patientId = searchInput.value.trim();

  if (!patientId) {
    alert("Please enter a Patient ID");
    return;
  }

  const nonRegularAppts = JSON.parse(localStorage.getItem("nonRegularAppointments") || "[]");
  const results = nonRegularAppts.filter(appt => appt.patientId === patientId);

  if (results.length === 0) {
    alert(`No appointments found for Patient ID: ${patientId}`);
    document.getElementById("nonRegularAppointmentsTable").innerHTML = "";
    return;
  }

  // Render only the searched results
  renderNonRegularAppointments(results);
}

// Render non-regular appointments
function renderNonRegularAppointments(filteredAppts = null) {
  const table = document.getElementById("nonRegularAppointmentsTable");
  if (!table) return;

  const allAppts = JSON.parse(localStorage.getItem("nonRegularAppointments") || "[]");
  const appts = filteredAppts || allAppts;
  table.innerHTML = "";

  if (appts.length === 0) {
    table.innerHTML = "<tr><td colspan='8' class='text-center'>No non-regular appointments</td></tr>";
    return;
  }

  appts.forEach((appt, index) => {
    const row = document.createElement("tr");
    const createdTime = new Date(appt.createdAt);
    const now = new Date();
    const hoursOld = Math.floor((now - createdTime) / (1000 * 60 * 60));
    const status = appt.sent ? "Sent" : `${hoursOld}h old`;

    const actionButton = appt.sent ?
      `<button class="btn btn-success btn-sm" disabled>Sent to Doctor</button>` :
      `<button class="btn btn-info btn-sm ms-1" onclick="sendNonRegularToDoctor('${appt.patientId}')">Send to Doctor</button>`;

    row.innerHTML = `
      <td>${appt.patientId}</td>
      <td>${appt.name}</td>
      <td>${appt.phone}</td>
      <td>${appt.doctor}</td>
      <td>${appt.date}</td>
      <td>${appt.time}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteNonRegular('${appt.patientId}')">Delete</button>
        ${actionButton}
      </td>
    `;

    table.appendChild(row);
  });
}

// Send non-regular appointment to doctor's inbox
function sendNonRegularToDoctor(patientId) {
  const nonRegularAppts = JSON.parse(localStorage.getItem("nonRegularAppointments") || "[]");
  const appointment = nonRegularAppts.find(appt => appt.patientId === patientId);

  if (!appointment) return alert("Appointment not found");

  const doctorInbox = JSON.parse(localStorage.getItem("doctorInbox") || "[]");
  
  // Add appointment to doctor inbox with patient data
  doctorInbox.push({
    name: appointment.name,
    phone: appointment.phone,
    doctor: appointment.doctor,
    date: appointment.date,
    time: appointment.time,
    patientId: appointment.patientId,
    age: appointment.age,
    gender: appointment.gender,
    isNonRegular: true,
    sentAt: new Date().toISOString()
  });

  localStorage.setItem("doctorInbox", JSON.stringify(doctorInbox));

  // Mark as sent
  const index = nonRegularAppts.findIndex(a => a.patientId === patientId);
  if (index !== -1) {
    nonRegularAppts[index].sent = true;
    localStorage.setItem("nonRegularAppointments", JSON.stringify(nonRegularAppts));
  }

  alert("Appointment sent to doctor's inbox");
  renderNonRegularAppointments();
}

// Mark non-regular appointment as done
function markNonRegularDone(patientId) {
  const nonRegularAppts = JSON.parse(localStorage.getItem("nonRegularAppointments") || "[]");
  const index = nonRegularAppts.findIndex(appt => appt.patientId === patientId);

  if (index !== -1) {
    nonRegularAppts[index].done = true;
    localStorage.setItem("nonRegularAppointments", JSON.stringify(nonRegularAppts));
    renderNonRegularAppointments();
  }
}

// Delete non-regular appointment
function deleteNonRegular(patientId) {
  if (!confirm("Delete this appointment permanently?")) return;

  let nonRegularAppts = JSON.parse(localStorage.getItem("nonRegularAppointments") || "[]");
  nonRegularAppts = nonRegularAppts.filter(appt => appt.patientId !== patientId);
  localStorage.setItem("nonRegularAppointments", JSON.stringify(nonRegularAppts));

  renderNonRegularAppointments();
}

// Test function to simulate 24-hour removal
function testAutoRemoval() {
  const nonRegularAppts = JSON.parse(localStorage.getItem("nonRegularAppointments") || "[]");
  if (nonRegularAppts.length === 0) {
    alert("No non-regular appointments to test");
    return;
  }

  // Age all appointments by ~24 hours
  nonRegularAppts.forEach(appt => {
    const createdDate = new Date(appt.createdAt);
    createdDate.setHours(createdDate.getHours() - 25);
    appt.createdAt = createdDate.toISOString();
  });

  localStorage.setItem("nonRegularAppointments", JSON.stringify(nonRegularAppts));
  alert("All appointments aged by 25 hours. Running cleanup...");
  cleanExpiredNonRegularAppointments();
}

// ---------- Render Feedback ----------
function renderAdminFeedback() {
  const table = document.getElementById("adminFeedbackTable");
  if (!table) return;

  const feedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");
  table.innerHTML = "";

  feedbacks.forEach((fb, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${fb.doctor}</td>
      <td>${fb.rating}</td>
      <td>${fb.comments}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="removeFeedback(${index})">Delete</button>
      </td>
    `;

    table.appendChild(row);
  });
}

function removeFeedback(index) {
  let feedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");
  if (confirm("Delete this feedback?")) {
    feedbacks.splice(index, 1);
    localStorage.setItem("feedbacks", JSON.stringify(feedbacks));
    renderAdminFeedback();
    loadDashboardCounts();
  }
}

// ---------- Render Reports grouped by Patient ID ----------
function renderAdminReports() {
  const container = document.getElementById("adminReportSection");
  if (!container) return;

  const reports = JSON.parse(localStorage.getItem("uploadedReports") || "[]");
  const patientDb = JSON.parse(localStorage.getItem("patientDatabase") || "{}");
  container.innerHTML = "";

  // Group reports by patientId
  const reportsByPatient = {};
  reports.forEach(report => {
    if (!reportsByPatient[report.patientId]) {
      reportsByPatient[report.patientId] = [];
    }
    reportsByPatient[report.patientId].push(report);
  });

  // Create a card for each patient with their reports
  Object.entries(reportsByPatient).forEach(([patientId, patientReports]) => {
    const patient = patientDb[patientId];
    const patientName = patient ? `${patient.name} (${patientId})` : patientId;
    const col = document.createElement("div");
    col.className = "col-md-4 mb-3";

    let reportHtml = '';
    patientReports.forEach((report, idx) => {
      reportHtml += `
        <div class="report-item mb-2">
          <img src="${report.image}" style="height: 100px; object-fit: cover; border-radius: 4px; cursor: pointer;" onclick="openModal('${report.image}')">
          <small>${report.category}</small>
        </div>
      `;
    });

    col.innerHTML = `
      <div class="patient-report-card p-3 border rounded" style="background: #f9f9f9;">
        <h5 class="mb-1">${patientName}</h5>
        <small class="text-muted">Reports: ${patientReports.length}</small>
        <div class="mt-2" style="max-height: 250px; overflow-y: auto;">
          ${reportHtml}
        </div>
        <div class="mt-3 gap-2 d-flex">
          <button class="btn btn-sm btn-info" onclick="sendReportsToDoctor('${patientId}')">Send to Doctor</button>
          <button class="btn btn-sm btn-warning" onclick="deleteIndividualReport('${patientId}')">Delete Selected</button>
          <button class="btn btn-sm btn-danger" onclick="removePatientReports('${patientId}')">Remove All</button>
        </div>
      </div>
    `;

    container.appendChild(col);
  });
}

// Delete individual report
function deleteIndividualReport(patientId) {
  const reportId = prompt("Enter the report ID to delete (or press Cancel to cancel):");
  if (!reportId) return;

  let reports = JSON.parse(localStorage.getItem("uploadedReports") || "[]");
  const reportIndex = reports.findIndex(r => r.patientId === patientId && r.id == reportId);

  if (reportIndex === -1) {
    alert("Report not found");
    return;
  }

  if (confirm("Delete this report?")) {
    reports.splice(reportIndex, 1);
    localStorage.setItem("uploadedReports", JSON.stringify(reports));
    renderAdminReports();
    loadDashboardCounts();
  }
}
function sendReportsToDoctor(patientId) {
  const reports = JSON.parse(localStorage.getItem("uploadedReports") || "[]");
  const patientDb = JSON.parse(localStorage.getItem("patientDatabase") || "{}");
  
  const patientReports = reports.filter(r => r.patientId === patientId);
  if (!patientReports.length) return alert("No reports to send");

  // Create report package for doctor
  const doctorReports = JSON.parse(localStorage.getItem("doctorReports") || "[]");
  doctorReports.push({
    patientId: patientId,
    patientName: patientDb[patientId]?.name || patientId,
    reports: patientReports,
    sentAt: new Date().toISOString(),
    sent: true
  });
  localStorage.setItem("doctorReports", JSON.stringify(doctorReports));

  alert(`Reports for patient ${patientId} sent to doctor.`);
}

function removePatientReports(patientId) {
  let reports = JSON.parse(localStorage.getItem("uploadedReports") || "[]");
  if (confirm(`Delete all reports for patient ${patientId}?`)) {
    reports = reports.filter(r => r.patientId !== patientId);
    localStorage.setItem("uploadedReports", JSON.stringify(reports));
    renderAdminReports();
    loadDashboardCounts();
  }
}

// Modal for viewing reports
function openModal(src) {
  const modal = document.getElementById("imageModal");
  if (!modal) {
    const newModal = document.createElement("div");
    newModal.id = "imageModal";
    newModal.className = "modal-overlay";
    newModal.innerHTML = `
      <div class="modal-content text-center">
        <span class="modal-close" onclick="closeModal()">×</span>
        <img id="modalImage" style="max-width:100%; max-height:400px;">
      </div>
    `;
    document.body.appendChild(newModal);
  }
  document.getElementById("modalImage").src = src;
  document.getElementById("imageModal").style.display = "flex";
}

function closeModal() {
  const modal = document.getElementById("imageModal");
  if (modal) modal.style.display = "none";
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  loadDashboardCounts();
  renderAdminAppointments();
  renderNonRegularAppointments();
  renderAdminFeedback();
  renderAdminReports();
  initNonRegularAutoRemoval();

  // Regular appointment search button event
  const regularBtn = document.getElementById("regularSearchBtn");
  if (regularBtn) {
    regularBtn.addEventListener("click", function() {
      const searchInput = document.getElementById("regularSearchInput");
      const searchValue = searchInput.value.trim();
      if (!searchValue) {
        alert("Please enter a Patient Phone/ID");
        return;
      }
      const table = document.getElementById("adminAppointmentsTable");
      let found = false;
      for (const row of table.rows) {
        // Assuming phone is in the third cell (index 2)
        if (row.cells[2] && row.cells[2].textContent.trim() === searchValue) {
          row.classList.add("fw-bold", "table-warning");
          found = true;
          setTimeout(() => {
            row.classList.remove("fw-bold", "table-warning");
          }, 15000);
        }
      }
      if (!found) {
        alert("No appointment found for: " + searchValue);
      }
    });
  }

  // Non-regular appointment search button event
  const nonRegularBtn = document.getElementById("nonRegularSearchBtn");
  if (nonRegularBtn) {
    nonRegularBtn.addEventListener("click", function() {
      const searchInput = document.getElementById("nonRegularSearchInput");
      const patientId = searchInput.value.trim();
      if (!patientId) {
        alert("Please enter a Patient ID");
        return;
      }
      const table = document.getElementById("nonRegularAppointmentsTable");
      let found = false;
      for (const row of table.rows) {
        // Patient ID is in the first cell (index 0)
        if (row.cells[0] && row.cells[0].textContent.trim() === patientId) {
          row.classList.add("fw-bold", "table-warning");
          found = true;
          setTimeout(() => {
            row.classList.remove("fw-bold", "table-warning");
          }, 15000);
        }
      }
      if (!found) {
        alert("No appointment found for Patient ID: " + patientId);
      }
    });
  }
});

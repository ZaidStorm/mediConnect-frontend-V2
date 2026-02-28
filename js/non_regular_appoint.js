// ---------------- Generate Time Slots ----------------
// (4:30 PM – 9:00 PM, 15-min interval)
function generateTimeSlots(selectedDate) {
  const select = document.getElementById("appointmentTime");
  select.innerHTML = '<option value="">Select Time Slot</option>';

  const reserved = JSON.parse(localStorage.getItem('reservedSlots') || '{}');
  const reservedForDate = (selectedDate && reserved[selectedDate]) || [];

  let start = new Date();
  start.setHours(16, 30, 0); // 4:30 PM
  let end = new Date();
  end.setHours(21, 0, 0); // 9:00 PM

  while (start <= end) {
    const formatted = formatTime12(start);
    const option = document.createElement("option");
    option.value = formatted;

    if (reservedForDate.includes(formatted)) {
      option.disabled = true;
      option.textContent = `${formatted} (Reserved)`;
    } else {
      option.textContent = formatted;
    }

    select.appendChild(option);
    start.setMinutes(start.getMinutes() + 15);
  }
}

// ---------------- Format Time ----------------
function formatTime12(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const minStr = minutes < 10 ? "0" + minutes : minutes;
  return `${hours}:${minStr} ${ampm}`;
}

// ---------------- Generate or Get Patient ID ----------------
function generateOrGetPatientId(name, phone) {
  const patientDb = JSON.parse(localStorage.getItem('patientDatabase') || '{}');

  for (const [id, patient] of Object.entries(patientDb)) {
    if (patient.name === name && patient.phone === phone) {
      return id;
    }
  }

  const newId = 'P' + Date.now().toString().slice(-8);
  patientDb[newId] = { name, phone, registeredDate: new Date().toISOString() };
  localStorage.setItem('patientDatabase', JSON.stringify(patientDb));

  return newId;
}

// ---------------- Strict Reservation Function ----------------
function reserveSlotIfAvailable(date, time) {
  if (!date || !time) return false;

  const reserved = JSON.parse(localStorage.getItem('reservedSlots') || '{}');
  reserved[date] = reserved[date] || [];

  // Block if already reserved
  if (reserved[date].includes(time)) {
    return false;
  }

  // Otherwise reserve it
  reserved[date].push(time);
  localStorage.setItem('reservedSlots', JSON.stringify(reserved));

  return true;
}

// ---------------- Book Appointment ----------------
function bookAppointment() {
  const name = document.getElementById("patientName").value.trim();
  const phone = document.getElementById("patientPhone").value.trim();
  const doctor = document.getElementById("doctorId").value;
  const date = document.getElementById("appointmentDate").value;
  const time = document.getElementById("appointmentTime").value;

  if (!name || !phone || !date || !time) {
    alert("Please fill all fields and select date/time");
    return;
  }

  // STRICT CHECK (prevents double booking)
  const reservedSuccessfully = reserveSlotIfAvailable(date, time);

  if (!reservedSuccessfully) {
    alert("This slot has already been taken by another patient. Please choose a different time.");
    generateTimeSlots(date); // Refresh dropdown
    return;
  }

  const patientId = generateOrGetPatientId(name, phone);

  const appointment = {
    name,
    phone,
    doctor,
    date,
    time,
    patientId
  };

  showBookingModal();

  setTimeout(() => {
    downloadSlip(appointment, patientId);

    // Store non-regular appointment with metadata for admin
    let nonRegularAppts = JSON.parse(localStorage.getItem('nonRegularAppointments') || '[]');
    nonRegularAppts.push({
      patientId: patientId,
      name: name,
      phone: phone,
      doctor: doctor,
      date: date,
      time: time,
      age: '', // Will be filled when admin/doctor process it
      gender: '', // Will be filled when admin/doctor process it
      createdAt: new Date().toISOString(),
      sent: false,
      done: false
    });
    localStorage.setItem('nonRegularAppointments', JSON.stringify(nonRegularAppts));

    // Clear form
    document.getElementById("patientName").value = "";
    document.getElementById("patientPhone").value = "";
    document.getElementById("appointmentTime").value = "";
    document.getElementById("appointmentDate").value = "";

    generateTimeSlots(""); // reset dropdown

  }, 500);
}

// ---------------- Booking Modal ----------------
function showBookingModal() {
  const modal = document.getElementById("bookingModal");
  modal.style.display = "flex";

  setTimeout(() => {
    modal.style.display = "none";
  }, 7000);
}

function closeBookingModal() {
  document.getElementById("bookingModal").style.display = "none";
}

// ---------------- Download PDF ----------------
function downloadSlip(appointment, patientId) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("MediConnect Appointment Slip", 20, 20);

  doc.setFontSize(12);
  doc.text(`Patient ID: ${patientId}`, 20, 35);
  doc.text(`Name   : ${appointment.name}`, 20, 45);
  doc.text(`Phone  : ${appointment.phone}`, 20, 55);
  doc.text(`Doctor : ${appointment.doctor}`, 20, 65);
  doc.text(`Date   : ${appointment.date}`, 20, 75);
  doc.text(`Time   : ${appointment.time}`, 20, 85);

  doc.save(`${patientId}_${appointment.name}_appointment.pdf`);
}

// ---------------- Page Initialization ----------------
document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('appointmentDate');

  generateTimeSlots(dateInput.value);

  dateInput.addEventListener('change', () => {
    generateTimeSlots(dateInput.value);
  });

  // Dev Reset Button
  const container = document.querySelector('.card-custom');

  if (container) {
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn-secondary mt-3 w-100';
    resetBtn.textContent = 'Reset Slots (dev)';

    resetBtn.addEventListener('click', () => {
      if (confirm('Reset all reserved slots now?')) {
        localStorage.removeItem('reservedSlots');
        generateTimeSlots(dateInput.value);
        alert('Slots reset successfully');
      }
    });

    container.appendChild(resetBtn);
  }
});
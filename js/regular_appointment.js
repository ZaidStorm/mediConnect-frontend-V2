// ---------- Generate time slots (4:30 PM – 9:00 PM, 15-min interval) ----------
function generateTimeSlots(selectedDate) {
  const select = document.getElementById("appointmentTime");
  select.innerHTML = '<option value="">Select Time Slot</option>';

  // Get reserved slots for the date
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

// ---------- Format time to 12-hour with AM/PM ----------
function formatTime12(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const minStr = minutes < 10 ? "0" + minutes : minutes;
  return `${hours}:${minStr} ${ampm}`;
}

// ---------- Generate unique patient ID if not exists ----------
function generateOrGetPatientId(name, phone) {
  const patientDb = JSON.parse(localStorage.getItem('patientDatabase') || '{}');
  // Check if patient already exists by name+phone combo
  for (const [id, patient] of Object.entries(patientDb)) {
    if (patient.name === name && patient.phone === phone) {
      return id;
    }
  }
  // Generate new ID
  const newId = 'P' + Date.now().toString().slice(-8);
  patientDb[newId] = { name, phone, registeredDate: new Date().toISOString() };
  localStorage.setItem('patientDatabase', JSON.stringify(patientDb));
  return newId;
}

// ---------- Book Appointment ----------
function bookAppointment() {
  const name = document.getElementById("patientName").value.trim();
  const phone = document.getElementById("patientPhone").value.trim();
  const doctor = document.getElementById("doctorId").value;
  const date = document.getElementById("appointmentDate").value;
  const time = document.getElementById("appointmentTime").value;

  if (!name || !phone || !doctor || !date || !time) {
    alert("Please fill in all fields!");
    return;
  }

  // Prevent booking a reserved time (safety check)
  const timeSelect = document.getElementById('appointmentTime');
  const selectedOption = timeSelect.options[timeSelect.selectedIndex];
  if (selectedOption && selectedOption.disabled) {
    alert('Selected time is reserved. Please choose another slot.');
    return;
  }

  // Get existing appointments or create empty array
  const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");

  // Generate or get patient ID
  const patientId = generateOrGetPatientId(name, phone);

  // Add new appointment
  appointments.push({ name, phone, doctor, date, time, patientId });

  // Save back to localStorage
  localStorage.setItem("appointments", JSON.stringify(appointments));

  // mark slot reserved
  const reserved = JSON.parse(localStorage.getItem('reservedSlots') || '{}');
  reserved[date] = reserved[date] || [];
  if (!reserved[date].includes(time)) reserved[date].push(time);
  localStorage.setItem('reservedSlots', JSON.stringify(reserved));

  alert(`Appointment booked successfully!\nYour Patient ID: ${patientId}`);

  // Optionally, redirect to dashboard
  window.location.href = "dashboard.html"; // adjust path if needed
}

// Populate time slots on page load and react to date changes
document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('appointmentDate');
  generateTimeSlots(dateInput.value);
  dateInput.addEventListener('change', () => generateTimeSlots(dateInput.value));

  // add reset button for dev/testing
  const container = document.querySelector('.card-custom');
  if (container) {
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn-secondary mt-3 w-100';
    resetBtn.textContent = 'Reset Slots (dev)';
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset all reserved slots now?')) {
        localStorage.removeItem('reservedSlots');
        generateTimeSlots(dateInput.value);
        alert('Slots reset');
      }
    });
    container.appendChild(resetBtn);
  }
});
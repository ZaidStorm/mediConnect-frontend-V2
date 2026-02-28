// ===== MediConnect Frontend Login Logic =====

// Fixed Credentials
const USERS = {
  admin: {
    email: "admin@mediconnect.com",
    password: "admin123",
    role: "admin",
    dashboard: "dashboard.html" // admin folder dashboard
  },
  patient: {
    email: "patient@mediconnect.com",
    password: "patient123",
    role: "patient",
    dashboard: "dashboard.html" // patient folder dashboard
  }
};

// Determine role from page folder
function getRoleFromPath() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes("/admin/")) return "admin";
  if (path.includes("/patient/")) return "patient";
  if (path.includes("/doctor/")) return "doctor";
  return null;
}

function handleLogin() {
  const roleType = getRoleFromPath();
  if (!roleType) {
    alert("Cannot determine role. Check login page location.");
    return;
  }

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  const user = USERS[roleType];

  if (email === user.email && password === user.password) {
    // Save login info in localStorage
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("role", user.role);

    // Redirect to dashboard
    // Use relative path to current folder
    window.location.href = user.dashboard;

  } else {
    alert("Invalid credentials");
  }
}

// Attach login handler to button
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("loginBtn");
  if (btn) btn.addEventListener("click", handleLogin);
});

// Add doctor credentials dynamically so we keep single source
USERS.doctor = {
  email: "doctor@mediconnect.com",
  password: "doctor123",
  role: "doctor",
  dashboard: "doctor_dashboard.html"
};
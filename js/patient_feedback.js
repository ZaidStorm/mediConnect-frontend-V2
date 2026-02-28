// ---------- Feedback Storage ----------
let feedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");
let editIndex = null;
let popupTimeout = null;

// Save feedbacks
function saveFeedbacks() {
  localStorage.setItem("feedbacks", JSON.stringify(feedbacks));
}

// ---------- Submit Feedback ----------
function submitFeedback() {
  const doctorSelect = document.getElementById("doctorId");
  if (!doctorSelect) return;

  const doctor = doctorSelect.options[doctorSelect.selectedIndex].text;
  const rating = document.getElementById("rating").value;
  const comments = document.getElementById("comments").value.trim();

  if (!rating || rating < 1 || rating > 5) {
    alert("Please enter a valid rating (1-5).");
    return;
  }
  if (!comments) {
    alert("Please enter your comments.");
    return;
  }

  feedbacks.push({ doctor, rating, comments });
  saveFeedbacks();

  // Clear form
  doctorSelect.selectedIndex = 0;
  document.getElementById("rating").value = "";
  document.getElementById("comments").value = "";

  // Show popup and redirect to dashboard
  showFeedbackPopup();
}

// ---------- Render Feedback Table ----------
function renderFeedbackTable() {
  const table = document.getElementById("feedbackTable");
  if (!table) return;

  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";

  feedbacks.forEach((fb, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${fb.doctor}</td>
      <td>${fb.rating}</td>
      <td style="max-width:300px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${fb.comments}">${fb.comments}</td>
      <td>
        <button class="btn btn-sm btn-warning me-1" onclick="editFeedback(${index})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="removeFeedback(${index})">Remove</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ---------- Edit Feedback ----------
function editFeedback(index) {
  editIndex = index;
  const fb = feedbacks[index];

  const doctorOptions = document.getElementById("editDoctorId").options;
  for (let i = 0; i < doctorOptions.length; i++) {
    if (doctorOptions[i].text === fb.doctor) {
      document.getElementById("editDoctorId").selectedIndex = i;
      break;
    }
  }

  document.getElementById("editRating").value = fb.rating;
  document.getElementById("editComments").value = fb.comments;

  document.getElementById("editFeedbackModal").style.display = "flex";
}

// ---------- Remove Feedback ----------
function removeFeedback(index) {
  if (confirm("Are you sure you want to remove this feedback?")) {
    feedbacks.splice(index, 1);
    saveFeedbacks();
    renderFeedbackTable();
  }
}

// ---------- Feedback Popup ----------
function showFeedbackPopup() {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0,0,0,0.4)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = 9999;

  const box = document.createElement("div");
  box.style.background = "rgba(255,255,255,0.95)";
  box.style.backdropFilter = "blur(10px)";
  box.style.padding = "30px 40px";
  box.style.borderRadius = "10px";
  box.style.textAlign = "center";
  box.style.position = "relative";
  box.innerHTML = `
    <h4>Feedback Submitted!</h4>
    <p>Thank you for your feedback.</p>
    <button id="closePopupBtn" style="
      position:absolute;
      top:10px;
      right:10px;
      border:none;
      background:none;
      font-size:20px;
      cursor:pointer;
    ">&times;</button>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  document.getElementById("closePopupBtn").addEventListener("click", () => {
    clearTimeout(popupTimeout);
    window.location.href = "dashboard.html";
  });

  popupTimeout = setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 7000);
}

// ---------- Modal OK Button ----------
document.addEventListener("DOMContentLoaded", () => {
  const okBtn = document.getElementById("editOkBtn");
  if (okBtn) {
    okBtn.addEventListener("click", () => {
      if (editIndex === null) return;

      const doctorSelect = document.getElementById("editDoctorId");
      const doctor = doctorSelect.options[doctorSelect.selectedIndex].text;
      const rating = document.getElementById("editRating").value;
      const comments = document.getElementById("editComments").value.trim();

      if (!rating || rating < 1 || rating > 5) {
        alert("Please enter a valid rating (1-5).");
        return;
      }
      if (!comments) {
        alert("Please enter your comments.");
        return;
      }

      feedbacks[editIndex] = { doctor, rating, comments };
      saveFeedbacks();
      renderFeedbackTable();

      document.getElementById("editFeedbackModal").style.display = "none";
      editIndex = null;
    });
  }

  // Close modal on clicking outside
  const modal = document.getElementById("editFeedbackModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target.id === "editFeedbackModal") {
        modal.style.display = "none";
        editIndex = null;
      }
    });
  }

  // Bind submit button on feedback.html
  const submitBtn = document.getElementById("submitBtn");
  if (submitBtn) submitBtn.addEventListener("click", submitFeedback);

  // Render feedback table if exists
  renderFeedbackTable();
});
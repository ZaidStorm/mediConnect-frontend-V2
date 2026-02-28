const MAX_REPORTS = 6;

const fileInput      = document.getElementById('fileInput');
const filePreview    = document.getElementById('filePreview');
const categorySelect = document.getElementById('category');
const fileCounter    = document.getElementById('fileCounter');

let uploadedReports = JSON.parse(localStorage.getItem('uploadedReports') || '[]');

// ---------- Patient ID ----------
function getOrPromptPatientId() {
  let patientId = sessionStorage.getItem('currentPatientId');
  if (!patientId) {
    patientId = prompt('Enter your Patient ID (from appointment slip):');
    if (!patientId) return null;
    sessionStorage.setItem('currentPatientId', patientId);
  }
  return patientId;
}

// ---------- Update counter badge ----------
function updateCounter() {
  if (fileCounter) {
    fileCounter.textContent = `(${uploadedReports.length} / ${MAX_REPORTS})`;
    fileCounter.style.color = uploadedReports.length >= MAX_REPORTS ? '#ef4444' : '#64748b';
  }
}

// ---------- Handle file selection ----------
fileInput.addEventListener('change', () => {
  const files = Array.from(fileInput.files);
  const remaining = MAX_REPORTS - uploadedReports.length;

  if (remaining <= 0) {
    alert(`You have reached the maximum of ${MAX_REPORTS} uploaded reports. Remove one to add more.`);
    fileInput.value = '';
    return;
  }

  const toProcess = files.slice(0, remaining);
  if (files.length > remaining) {
    alert(`Only ${remaining} more file(s) can be added. The rest will be ignored.`);
  }

  const patientId = getOrPromptPatientId();
  if (!patientId) {
    alert('Patient ID is required to upload reports.');
    fileInput.value = '';
    return;
  }

  const category = categorySelect.value;
  let processed = 0;

  toProcess.forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedReports.push({
        id: Date.now() + Math.random(),
        patientId: patientId,
        name: file.name,
        category: category,
        image: e.target.result,
        uploadedAt: new Date().toISOString()
      });
      processed++;
      if (processed === toProcess.length) {
        localStorage.setItem('uploadedReports', JSON.stringify(uploadedReports));
        renderPreview();
        updateCounter();
      }
    };
    reader.readAsDataURL(file);
  });

  fileInput.value = '';
});

// ---------- Render Thumbnail Preview ----------
function renderPreview() {
  filePreview.innerHTML = '';

  if (uploadedReports.length === 0) {
    filePreview.innerHTML = '<p style="color:#94a3b8;font-size:0.9rem;">No reports uploaded yet.</p>';
    return;
  }

  uploadedReports.forEach((report, index) => {
    const card = document.createElement('div');
    card.className = 'report-thumb-card';
    card.innerHTML = `
      <div class="thumb-image-wrap" onclick="openModal('${report.image}')">
        <img src="${report.image}" class="report-thumb" alt="${report.category}">
      </div>
      <div class="thumb-label">${report.category}</div>
      <div class="thumb-actions">
        <button class="thumb-btn thumb-btn-delete" onclick="removeReport(${index})">Remove</button>
      </div>
    `;
    filePreview.appendChild(card);
  });
}

// ---------- Remove Report ----------
function removeReport(index) {
  if (!confirm('Remove this report?')) return;
  uploadedReports.splice(index, 1);
  localStorage.setItem('uploadedReports', JSON.stringify(uploadedReports));
  renderPreview();
  updateCounter();
}

// ---------- Modal ----------
function openModal(src) {
  document.getElementById('modalImage').src = src;
  document.getElementById('imageModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('imageModal').style.display = 'none';
}

// ---------- Upload Button ----------
function uploadFiles() {
  if (!uploadedReports.length) {
    alert('Please select at least one file before uploading.');
    return;
  }
  sessionStorage.removeItem('currentPatientId');
  alert(`${uploadedReports.length} report(s) saved. Redirecting to dashboard...`);
  window.location.href = 'dashboard.html';
}

// Initial render
renderPreview();
updateCounter();
// Logout function for doctor dashboard
function logout() {
    window.location.href = '../index.html';
}
// ------------------ Navigation ------------------
function navigateTo(page) {
    window.location.href = page;
}

// ------------------ Collapsible Sections ------------------
document.querySelectorAll('.collapsible-header').forEach(header => {
    header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        content.style.display = content.style.display === 'block' ? 'none' : 'block';
    });
});

// ------------------ Global Variables ------------------
let currentPatientId = null;
let medicineCount = 0;

// Load GPE History
let gpeHistory = JSON.parse(localStorage.getItem('gpeHistory') || '[]');
function updateGpeList() {
    const gpeList = document.getElementById('gpeList');
    gpeList.innerHTML = '';
    gpeHistory.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        gpeList.appendChild(option);
    });
}
updateGpeList();

// save new gpe entries when user leaves input
const gpeInputElem = document.getElementById('gpeInput');
if (gpeInputElem) {
    gpeInputElem.addEventListener('blur', () => {
        const val = gpeInputElem.value.trim();
        if (val && !gpeHistory.includes(val)) {
            gpeHistory.push(val);
            localStorage.setItem('gpeHistory', JSON.stringify(gpeHistory));
            updateGpeList();
        }
    });
}

// ------------------ Patient ID Engine ------------------
document.getElementById('patientIdInput').addEventListener('blur', () => {
    const id = document.getElementById('patientIdInput').value.trim();
    const isNonRegular = document.getElementById('nonRegularPatient').checked;
    const patientDb = JSON.parse(localStorage.getItem('patientDatabase') || '{}');

    if (patientDb[id]) {
        // Auto-fill bio
        const patient = patientDb[id];
        document.getElementById('patientName').value = patient.name || '';
        document.getElementById('patientAge').value = patient.age || '';
        document.getElementById('patientGender').value = patient.gender || '';
        document.getElementById('patientWeight').value = patient.weight || '';
        currentPatientId = id;
    } else {
        if (isNonRegular) {
            // Auto-create new patient
            const newId = id || 'P' + Date.now().toString().slice(-8);
            patientDb[newId] = { name: '', registeredDate: new Date().toISOString() };
            localStorage.setItem('patientDatabase', JSON.stringify(patientDb));
            currentPatientId = newId;
            document.getElementById('patientIdInput').value = newId;
        } else {
            alert('Patient ID not found. Check Non-Regular if new patient.');
            currentPatientId = null;
        }
    }

    loadPreviousPrescriptions();
    loadLabReports();
});

// ------------------ Previous Prescriptions ------------------
function loadPreviousPrescriptions() {
    const listDiv = document.getElementById('previousPrescriptionList');
    listDiv.innerHTML = '';
    if (!currentPatientId) return;

    const patientPrescriptions = JSON.parse(localStorage.getItem('patientPrescriptions') || '{}');
    const prescriptions = patientPrescriptions[currentPatientId] || [];

    prescriptions.forEach((presc, idx) => {
        const div = document.createElement('div');
        div.style.borderBottom = '1px solid #ccc';
        div.style.marginBottom = '0.5rem';
        div.innerHTML = `<strong>${new Date(presc.createdAt).toLocaleDateString()}</strong>
                         <p>${presc.preDiagnosis.substring(0,50)}...</p>`;
        div.addEventListener('click', () => {
            loadPrescriptionIntoForm(presc);
        });
        listDiv.appendChild(div);
    });
}

function loadPrescriptionIntoForm(presc) {
    // Bio
    document.getElementById('patientName').value = presc.bio.name || '';
    document.getElementById('patientAge').value = presc.bio.age || '';
    document.getElementById('patientGender').value = presc.bio.gender || '';
    document.getElementById('patientWeight').value = presc.bio.weight || '';

    // Complaints
    document.getElementById('complaints').value = presc.complaints || '';

    // Examination
    if (presc.examination) {
        document.getElementById('vitalBP').value = presc.examination.vitals?.BP || '';
        document.getElementById('vitalPulse').value = presc.examination.vitals?.Pulse || '';
        document.getElementById('vitalTemp').value = presc.examination.vitals?.Temp || '';
        document.getElementById('vitalRR').value = presc.examination.vitals?.RR || '';
        document.getElementById('vitalSPO2').value = presc.examination.vitals?.SPO2 || '';
        document.getElementById('gpeInput').value = presc.examination.GPE || '';
        document.getElementById('seInput').value = presc.examination.SE || '';
    }

    // Pre/Post diagnosis
    document.getElementById('preDiagnosis').value = presc.preDiagnosis || '';
    document.getElementById('postDiagnosis').value = presc.postDiagnosis || '';

    // Follow-up
    document.getElementById('followUp').value = presc.followUp || '';

    // Medicines
    document.getElementById('medicineContainer').innerHTML = '';
    presc.medicines.forEach(med => addMedicineCard(med));
}

// ------------------ Lab Reports ------------------
function loadLabReports() {
    const container = document.getElementById('labReportsContainer');
    container.innerHTML = '';
    if (!currentPatientId) return;
    const uploadedReports = JSON.parse(localStorage.getItem('uploadedReports') || '[]');
    uploadedReports.filter(r => r.patientId === currentPatientId).forEach(report => {
        const div = document.createElement('div');
        div.style.border = '1px solid #ddd';
        div.style.padding = '0.5rem';
        div.style.marginBottom = '0.5rem';
        div.innerHTML = `
          <strong>${report.name}</strong>
          <button onclick="openReport('${report.id}')">Open</button>
          <button onclick="deleteReport('${report.id}')">Delete</button>
        `;
        container.appendChild(div);
    });
}

// Open report in new tab
window.openReport = function(id) {
    const reports = JSON.parse(localStorage.getItem('uploadedReports') || '[]');
    const rep = reports.find(r => r.id == id);
    if (!rep) return alert('Report not found');
    if (rep.image.startsWith('data:application/pdf')) {
        const blob = dataURLtoBlob(rep.image);
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    } else {
        const imgWin = window.open('');
        imgWin.document.write(`<img src="${rep.image}" style="max-width:100%">`);
    }
}

function dataURLtoBlob(dataurl) {
    const arr = dataurl.split(','); const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]); let n = bstr.length; const u8arr = new Uint8Array(n);
    while(n--){ u8arr[n]=bstr.charCodeAt(n); }
    return new Blob([u8arr], {type:mime});
}

// Delete report
window.deleteReport = function(id) {
    if (!confirm('Delete this report?')) return;
    let reports = JSON.parse(localStorage.getItem('uploadedReports') || '[]');
    reports = reports.filter(r => r.id != id);
    localStorage.setItem('uploadedReports', JSON.stringify(reports));
    loadLabReports();
}

// Upload new reports
document.getElementById('labFileInput').addEventListener('change', e => {
    const files = Array.from(e.target.files);
    if (!currentPatientId) return alert('Select patient first');
    let uploadedReports = JSON.parse(localStorage.getItem('uploadedReports') || '[]');

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
            uploadedReports.push({
                id: Date.now() + Math.random(),
                patientId: currentPatientId,
                name: file.name,
                image: reader.result,
                uploadedAt: new Date().toISOString()
            });
            localStorage.setItem('uploadedReports', JSON.stringify(uploadedReports));
            loadLabReports();
        }
        reader.readAsDataURL(file);
    });
});

// ------------------ Medicine Engine ------------------
const medicineContainer = document.getElementById('medicineContainer');
document.getElementById('addMedicineBtn').addEventListener('click', () => addMedicineCard());

function addMedicineCard(existingData = null) {
    medicineCount++;
    const medDiv = document.createElement('div');
    medDiv.className = 'medicine-card';
    medDiv.style.border = '1px solid #ccc';
    medDiv.style.padding = '0.5rem';
    medDiv.style.marginBottom = '0.5rem';

    medDiv.innerHTML = `
      <h4>Medicine ${medicineCount}</h4>
      <input class="medName" type="text" placeholder="Medicine Name" value="${existingData?.name || ''}">
      <input class="medRoute" type="text" placeholder="Route" value="${existingData?.route || ''}">
      <input class="medDuration" type="text" placeholder="Duration" value="${existingData?.duration || ''}">
      <div>
          <label><input type="checkbox" class="qtyMorning"> Morning</label> <input type="text" class="dosageMorning" placeholder="Dosage" value="${existingData?.quantity?.morning || ''}">
          <label><input type="checkbox" class="qtyAfternoon"> Afternoon</label> <input type="text" class="dosageAfternoon" placeholder="Dosage" value="${existingData?.quantity?.afternoon || ''}">
          <label><input type="checkbox" class="qtyEvening"> Evening</label> <input type="text" class="dosageEvening" placeholder="Dosage" value="${existingData?.quantity?.evening || ''}">
          <label><input type="checkbox" class="qtyBed"> Before Bed</label> <input type="text" class="dosageBed" placeholder="Dosage" value="${existingData?.quantity?.bed || ''}">
          <label><input type="checkbox" class="qtyWake"> After Wake</label> <input type="text" class="dosageWake" placeholder="Dosage" value="${existingData?.quantity?.wake || ''}">
          <label><input type="checkbox" class="qtyBeforeMeal"> Before Meal</label> <input type="text" class="dosageBeforeMeal" placeholder="Dosage" value="${existingData?.quantity?.beforeMeal || ''}">
          <label><input type="checkbox" class="qtyAfterMeal"> After Meal</label> <input type="text" class="dosageAfterMeal" placeholder="Dosage" value="${existingData?.quantity?.afterMeal || ''}">
      </div>
      <textarea class="medPrecautions" placeholder="Precautions">${existingData?.precautions || ''}</textarea>
      <textarea class="medRecipe" placeholder="Recipe / Special Instructions">${existingData?.recipe || ''}</textarea>
      <button type="button" class="toggleRecipeBtn">Add Special Instruction</button>
      <button class="saveProtocolBtn">Save Protocol</button>
      <button class="editMedBtn">Edit</button>
      <button class="deleteMedBtn">Delete</button>
    `;

    medicineContainer.appendChild(medDiv);

    // Recipe visibility based on age
    const age = parseInt(document.getElementById('patientAge').value) || 0;
    const recipeArea = medDiv.querySelector('.medRecipe');
    const toggleBtn = medDiv.querySelector('.toggleRecipeBtn');
    if (age >= 16) {
        recipeArea.style.display = 'none';
        toggleBtn.style.display = 'inline-block';
    } else {
        recipeArea.style.display = 'block';
        toggleBtn.style.display = 'none';
    }

    // toggle button behaviour
    toggleBtn.addEventListener('click', () => {
        if (recipeArea.style.display === 'none' || recipeArea.style.display === '') {
            recipeArea.style.display = 'block';
        } else {
            recipeArea.style.display = 'none';
        }
    });

    // listen for age changes globally
    const ageInput = document.getElementById('patientAge');
    if (ageInput && !ageInput._recipeListenerAdded) {
        ageInput._recipeListenerAdded = true;
        ageInput.addEventListener('input', () => {
            const newAge = parseInt(ageInput.value) || 0;
            document.querySelectorAll('.medicine-card').forEach(div => {
                const rec = div.querySelector('.medRecipe');
                const btn = div.querySelector('.toggleRecipeBtn');
                if (newAge >= 16) {
                    rec.style.display = 'none';
                    if (btn) btn.style.display = 'inline-block';
                } else {
                    rec.style.display = 'block';
                    if (btn) btn.style.display = 'none';
                }
            });
        });
    }

    // ------------------ Auto-fill Protocol ------------------
    const medNameInput = medDiv.querySelector('.medName');
    medNameInput.addEventListener('blur', () => {
        const protocols = JSON.parse(localStorage.getItem('medicineProtocols') || '{}');
        const name = medNameInput.value.trim();
        if (protocols[name]) {
            const data = protocols[name];
            medDiv.querySelector('.medRoute').value = data.route || '';
            medDiv.querySelector('.medDuration').value = data.duration || '';
            Object.keys(data.quantity || {}).forEach(k => {
                if (medDiv.querySelector(`.dosage${capitalize(k)}`))
                    medDiv.querySelector(`.dosage${capitalize(k)}`).value = data.quantity[k];
                if (medDiv.querySelector(`.qty${capitalize(k)}`))
                    medDiv.querySelector(`.qty${capitalize(k)}`).checked = !!data.quantity[k];
            });
            medDiv.querySelector('.medPrecautions').value = data.precautions || '';
            medDiv.querySelector('.medRecipe').value = data.recipe || '';
        }
    });

    // ------------------ Save Protocol ------------------
    medDiv.querySelector('.saveProtocolBtn').addEventListener('click', () => {
        const protocols = JSON.parse(localStorage.getItem('medicineProtocols') || '{}');
        const name = medDiv.querySelector('.medName').value.trim();
        protocols[name] = {
            route: medDiv.querySelector('.medRoute').value,
            duration: medDiv.querySelector('.medDuration').value,
            quantity: {
                morning: medDiv.querySelector('.dosageMorning').value,
                afternoon: medDiv.querySelector('.dosageAfternoon').value,
                evening: medDiv.querySelector('.dosageEvening').value,
                bed: medDiv.querySelector('.dosageBed').value,
                wake: medDiv.querySelector('.dosageWake').value,
                beforeMeal: medDiv.querySelector('.dosageBeforeMeal').value,
                afterMeal: medDiv.querySelector('.dosageAfterMeal').value
            },
            precautions: medDiv.querySelector('.medPrecautions').value,
            recipe: medDiv.querySelector('.medRecipe').value
        };
        localStorage.setItem('medicineProtocols', JSON.stringify(protocols));
        alert('Protocol saved!');
    });

    // ------------------ Edit & Delete ------------------
    medDiv.querySelector('.deleteMedBtn').addEventListener('click', () => medDiv.remove());
    medDiv.querySelector('.editMedBtn').addEventListener('click', () => {
        alert('Edit mode enabled. Change values directly.');
    });
}

// Utility
function capitalize(str){ return str.charAt(0).toUpperCase()+str.slice(1); }

// ------------------ Save Prescription ------------------
document.getElementById('savePrescriptionBtn').addEventListener('click', () => {
    if (!currentPatientId) return alert('Select patient first!');
    const patientPrescriptions = JSON.parse(localStorage.getItem('patientPrescriptions') || '{}');
    const bio = {
        name: document.getElementById('patientName').value,
        age: document.getElementById('patientAge').value,
        gender: document.getElementById('patientGender').value,
        weight: document.getElementById('patientWeight').value
    };
    const medicines = Array.from(document.querySelectorAll('.medicine-card')).map(div => ({
        name: div.querySelector('.medName').value,
        route: div.querySelector('.medRoute').value,
        duration: div.querySelector('.medDuration').value,
        quantity: {
            morning: div.querySelector('.dosageMorning').value,
            afternoon: div.querySelector('.dosageAfternoon').value,
            evening: div.querySelector('.dosageEvening').value,
            bed: div.querySelector('.dosageBed').value,
            wake: div.querySelector('.dosageWake').value,
            beforeMeal: div.querySelector('.dosageBeforeMeal').value,
            afterMeal: div.querySelector('.dosageAfterMeal').value
        },
        precautions: div.querySelector('.medPrecautions').value,
        recipe: div.querySelector('.medRecipe').value
    }));

    const newPresc = {
        id: 'RX'+Date.now(),
        createdAt: new Date().toISOString(),
        bio,
        complaints: document.getElementById('complaints').value,
        examination: {
            vitals: {
                BP: document.getElementById('vitalBP').value,
                Pulse: document.getElementById('vitalPulse').value,
                Temp: document.getElementById('vitalTemp').value,
                RR: document.getElementById('vitalRR').value,
                SPO2: document.getElementById('vitalSPO2').value
            },
            GPE: document.getElementById('gpeInput').value,
            SE: document.getElementById('seInput').value
        },
        preDiagnosis: document.getElementById('preDiagnosis').value,
        postDiagnosis: document.getElementById('postDiagnosis').value,
        followUp: document.getElementById('followUp').value,
        medicines
    };

    if (!patientPrescriptions[currentPatientId]) patientPrescriptions[currentPatientId] = [];
    patientPrescriptions[currentPatientId].push(newPresc);
    localStorage.setItem('patientPrescriptions', JSON.stringify(patientPrescriptions));

    alert('Prescription saved successfully!');
    loadPreviousPrescriptions();
});
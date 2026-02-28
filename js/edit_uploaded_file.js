// Get report index from query string
const params = new URLSearchParams(window.location.search);
const index = params.get("index");

let reports = JSON.parse(localStorage.getItem("uploadedReports") || "[]");
let report = reports[index];

// Populate form with current data
if (report) {
  document.getElementById("editCategory").value = report.category;

  document.getElementById("currentFilePreview").innerHTML =
    `<img src="${report.image}" class="preview-thumb" alt="Current file">`;
}

// Show new file thumbnail on selection
document.getElementById("replaceFile").addEventListener("change", function() {
  const newPreview = document.getElementById("newFilePreview");
  newPreview.innerHTML = "";
  if (this.files && this.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      newPreview.innerHTML = `<img src="${e.target.result}" class="preview-thumb" alt="New file preview">`;
    };
    reader.readAsDataURL(this.files[0]);
  } else {
    newPreview.textContent = "No file selected";
  }
});

// Save button
document.getElementById("saveBtn").addEventListener("click", () => {
  const fileInput = document.getElementById("replaceFile");

  if (fileInput.files.length === 0) {
    alert("Please select a new file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    reports[index].image = e.target.result;  // update image
    localStorage.setItem("uploadedReports", JSON.stringify(reports));
    alert("File updated successfully!");
    window.location.href = "dashboard.html"; // redirect
  };

  reader.readAsDataURL(fileInput.files[0]);
});
// Get feedback index from query string
const params = new URLSearchParams(window.location.search);
const index = params.get("index");

let feedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");
const feedback = feedbacks[index];

// Populate form with current data
if (feedback) {
  document.getElementById("editDoctor").value   = feedback.doctor;
  document.getElementById("editRating").value   = feedback.rating;
  document.getElementById("editComments").value = feedback.comments;
} else {
  alert("Feedback not found.");
  window.location.href = "dashboard.html";
}

// Save button
document.getElementById("saveBtn").addEventListener("click", () => {
  const rating   = parseInt(document.getElementById("editRating").value);
  const comments = document.getElementById("editComments").value.trim();

  if (isNaN(rating) || rating < 1 || rating > 5) {
    alert("Rating must be a number between 1 and 5.");
    return;
  }

  if (!comments) {
    alert("Comments cannot be empty.");
    return;
  }

  feedbacks[index].rating   = rating;
  feedbacks[index].comments = comments;
  localStorage.setItem("feedbacks", JSON.stringify(feedbacks));

  alert("Feedback updated successfully!");
  window.location.href = "dashboard.html";
});

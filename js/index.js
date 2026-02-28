const menu = document.getElementById("mobile-menu");
const nav = document.getElementById("navLinks");

menu.addEventListener("click", () => {
  nav.classList.toggle("active");
  menu.classList.toggle("open");
});

document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("active");
    menu.classList.remove("open");
  });
});
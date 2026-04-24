const menuToggle = document.querySelector(".menu-toggle");
const navWrap = document.querySelector(".nav-wrap");
const navLinks = document.querySelectorAll(".nav-wrap a");
const yearTargets = document.querySelectorAll("#year");
const contactForm = document.querySelector(".contact-form");
const currentPage = document.body.dataset.page;

if (menuToggle && navWrap) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    navWrap.classList.toggle("open");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      navWrap.classList.remove("open");
    });
  });
}

if (currentPage) {
  document.querySelector(`[data-nav="${currentPage}"]`)?.classList.add("active");
}

yearTargets.forEach((target) => {
  target.textContent = new Date().getFullYear();
});

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = contactForm.querySelector("button");

    if (button) {
      const originalText = button.textContent;
      button.textContent = "Inquiry Ready";
      button.disabled = true;

      window.setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 1800);
    }
  });
}

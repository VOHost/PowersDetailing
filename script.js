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
  if (["services", "auto-services", "home-services"].includes(currentPage)) {
    document.querySelector(".nav-dropdown-trigger")?.classList.add("active");
  }
}

yearTargets.forEach((target) => {
  target.textContent = new Date().getFullYear();
});

function closeAllServiceDropdowns(except) {
  document.querySelectorAll(".service-select-wrap[data-open]").forEach(wrap => {
    if (wrap !== except) {
      wrap.removeAttribute("data-open");
      wrap.querySelector(".service-select-trigger").setAttribute("aria-expanded", "false");
    }
  });
}

document.querySelectorAll(".service-select-wrap").forEach(wrap => {
  const trigger = wrap.querySelector(".service-select-trigger");
  const valueEl = wrap.querySelector(".service-select-value");
  const placeholder = valueEl.textContent;
  const tabs = wrap.querySelectorAll(".service-tab");
  const checkboxes = wrap.querySelectorAll("input[type='checkbox']");

  function updateValue() {
    const selected = [...checkboxes].filter(cb => cb.checked).map(cb => cb.dataset.label);
    if (selected.length === 0) {
      valueEl.textContent = placeholder;
      valueEl.classList.remove("has-selection");
    } else if (selected.length === 1) {
      valueEl.textContent = selected[0];
      valueEl.classList.add("has-selection");
    } else {
      valueEl.textContent = `${selected.length} services selected`;
      valueEl.classList.add("has-selection");
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const category = tab.dataset.category;
      tabs.forEach(t => t.classList.toggle("active", t === tab));
      wrap.querySelectorAll(".service-options").forEach(opts => {
        opts.hidden = opts.dataset.category !== category;
      });
    });
  });

  trigger.addEventListener("click", () => {
    const isOpen = wrap.hasAttribute("data-open");
    closeAllServiceDropdowns(isOpen ? null : wrap);
    if (!isOpen) {
      wrap.setAttribute("data-open", "");
      trigger.setAttribute("aria-expanded", "true");
    }
  });

  checkboxes.forEach(cb => cb.addEventListener("change", updateValue));
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".service-select-wrap")) {
    closeAllServiceDropdowns(null);
  }
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

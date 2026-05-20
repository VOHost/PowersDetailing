const menuToggle = document.querySelector(".menu-toggle");
const navWrap = document.querySelector(".nav-wrap");
const navLinks = document.querySelectorAll(".nav-wrap a");
const yearTargets = document.querySelectorAll("#year");
const contactForm = document.querySelector(".contact-form");
const currentPage = document.body.dataset.page;
const gallerySlides = document.querySelectorAll("[data-gallery-slide]");
const galleryPages = document.querySelectorAll("[data-gallery-page]");
const galleryPrev = document.querySelector("[data-gallery-prev]");
const galleryNext = document.querySelector("[data-gallery-next]");
const homeCarPass = document.querySelector("[data-home-car-pass]");
const homeCarSprite = document.querySelector(".home-car-sprite");
const homeCarSmoke = document.querySelector(".home-car-smoke");

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

if (gallerySlides.length > 0) {
  let activeGalleryIndex = 0;

  function showGallerySlide(index) {
    activeGalleryIndex = (index + gallerySlides.length) % gallerySlides.length;
    gallerySlides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === activeGalleryIndex);
    });
    galleryPages.forEach((page, pageIndex) => {
      page.classList.toggle("active", pageIndex === activeGalleryIndex);
    });
  }

  galleryPrev?.addEventListener("click", () => {
    showGallerySlide(activeGalleryIndex - 1);
  });

  galleryNext?.addEventListener("click", () => {
    showGallerySlide(activeGalleryIndex + 1);
  });

  galleryPages.forEach((page) => {
    page.addEventListener("click", () => {
      showGallerySlide(Number(page.dataset.galleryPage));
    });
  });
}

if (
  currentPage === "home" &&
  homeCarPass &&
  homeCarSprite &&
  homeCarSmoke &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  let animationFrame = null;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function updateCarPass() {
    animationFrame = null;
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop || 0;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const carWidth = homeCarSprite.offsetWidth;
    const passStart = 0;
    const passDistance = doc.scrollHeight - viewportHeight;
    const passProgress = clamp((scrollTop - passStart) / passDistance, 0, 1);
    const startX = -carWidth - 160;
    const endX = viewportWidth + 180;
    const carX = startX + ((endX - startX) * passProgress);
    const carY = (viewportHeight * 0.54) - (viewportHeight * 0.1 * passProgress);
    const active = passProgress > 0 && passProgress < 1 ? 1 : 0;
    const fadeIn = clamp(passProgress / 0.025, 0, 1);
    const fadeOut = clamp((1 - passProgress) / 0.1, 0, 1);
    const opacity = active * Math.min(fadeIn, fadeOut);
    const shinePulse = clamp(1 - Math.abs(passProgress - 0.34) / 0.16, 0, 1);
    const smokePulse = opacity * clamp(1 - Math.abs(passProgress - 0.32) / 0.56, 0, 1);
    const smokeX = carX - Math.min(carWidth * 0.26, 290);
    const smokeY = carY + Math.min(carWidth * 0.09, 86);

    homeCarPass.style.setProperty("--car-x", `${carX}px`);
    homeCarPass.style.setProperty("--car-y", `${carY}px`);
    homeCarPass.style.setProperty("--car-opacity", (opacity * 0.96).toFixed(3));
    homeCarPass.style.setProperty("--shine-opacity", shinePulse.toFixed(3));
    homeCarPass.style.setProperty("--smoke-x", `${smokeX}px`);
    homeCarPass.style.setProperty("--smoke-y", `${smokeY}px`);
    homeCarPass.style.setProperty("--smoke-opacity", (smokePulse * 0.95).toFixed(3));
  }

  function requestCarPassUpdate() {
    if (animationFrame === null) {
      animationFrame = window.requestAnimationFrame(updateCarPass);
    }
  }

  updateCarPass();
  window.addEventListener("scroll", requestCarPassUpdate, { passive: true });
  window.addEventListener("resize", requestCarPassUpdate);
}

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
  const vehicleInput = wrap.querySelector("input[name='vehicle-type']");
  const vehicleChosen = wrap.querySelector(".vehicle-type-chosen");
  const vehicleStep = wrap.querySelector(".vehicle-type-step");
  const autoServiceList = wrap.querySelector(".auto-service-list");

  function updateValue() {
    const vehicle = vehicleInput ? vehicleInput.value : "";
    const selected = [...checkboxes].filter(cb => cb.checked).map(cb => cb.dataset.label);
    if (!vehicle && selected.length === 0) {
      valueEl.textContent = placeholder;
      valueEl.classList.remove("has-selection");
    } else if (vehicle && selected.length === 0) {
      valueEl.textContent = vehicle;
      valueEl.classList.add("has-selection");
    } else if (selected.length === 1) {
      valueEl.textContent = vehicle ? `${vehicle} — ${selected[0]}` : selected[0];
      valueEl.classList.add("has-selection");
    } else {
      valueEl.textContent = vehicle ? `${vehicle} — ${selected.length} services` : `${selected.length} services selected`;
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

  wrap.querySelectorAll(".vehicle-type-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const vehicle = btn.dataset.vehicle;
      const key = btn.dataset.vehicleKey;
      if (vehicleInput) vehicleInput.value = vehicle;
      if (vehicleChosen) vehicleChosen.textContent = vehicle;
      if (vehicleStep) vehicleStep.hidden = true;
      if (autoServiceList) {
        autoServiceList.hidden = false;
        if (key) {
          const priceAttr = `price${key.charAt(0).toUpperCase()}${key.slice(1)}`;
          autoServiceList.querySelectorAll(".service-check").forEach(row => {
            const cb = row.querySelector("input[type='checkbox']");
            const priceEl = row.querySelector(".check-price");
            if (!cb || !priceEl) return;
            const price = cb.dataset[priceAttr];
            if (price) priceEl.textContent = `$${price}`;
          });
        }
      }
      updateValue();
    });
  });

  wrap.querySelector(".vehicle-type-back")?.addEventListener("click", () => {
    if (vehicleStep) vehicleStep.hidden = false;
    if (autoServiceList) autoServiceList.hidden = true;
    if (vehicleInput) vehicleInput.value = "";
    if (vehicleChosen) vehicleChosen.textContent = "";
    wrap.querySelectorAll(".auto-service-list input[type='checkbox']").forEach(cb => {
      cb.checked = false;
    });
    updateValue();
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

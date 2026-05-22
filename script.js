const WEB3FORMS_KEY = "18fca95c-44ad-4ddf-b722-5aa491ed6024";

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
  let hasTriggeredCarPass = false;
  const carPassTriggerDistance = 140;

  function triggerCarPass() {
    if (hasTriggeredCarPass) {
      return;
    }

    hasTriggeredCarPass = true;
    homeCarPass.classList.add("is-running");
    window.removeEventListener("scroll", watchCarPassTrigger);
  }

  function watchCarPassTrigger() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;

    if (scrollTop >= carPassTriggerDistance) {
      triggerCarPass();
    }
  }

  homeCarSprite.addEventListener("animationend", () => {
    homeCarPass.classList.add("has-run");
    homeCarPass.classList.remove("is-running");
  }, { once: true });

  watchCarPassTrigger();
  window.addEventListener("scroll", watchCarPassTrigger, { passive: true });
}

function closeAllServiceDropdowns(except) {
  document.querySelectorAll(".service-select-wrap[data-open]").forEach(wrap => {
    if (wrap !== except) {
      wrap.removeAttribute("data-open");
      wrap.querySelector(".service-select-trigger").setAttribute("aria-expanded", "false");
    }
  });
}

// ─── Date picker — weekday restriction + availability ────────────────
const dateInput = document.getElementById("preferred-date");
const dateNote = document.getElementById("date-note");
const slotNote = document.getElementById("slot-note");

if (dateInput && typeof flatpickr !== "undefined") {
  flatpickr(dateInput, {
    minDate: "today",
    dateFormat: "Y-m-d",
    disable: [
      function(date) {
        return date.getDay() === 0; // block Sundays
      }
    ],
    onChange: function(selectedDates, dateStr) {
      if (dateNote) dateNote.hidden = true;
      if (dateStr) fetchAvailability(dateStr);
    },
    onReady: function(selectedDates, dateStr, instance) {
      instance.calendarContainer?.classList.add("powers-cal");
    }
  });
}

async function fetchAvailability(date) {
  if (slotNote) {
    slotNote.textContent = "Checking availability…";
    slotNote.className = "slot-note";
  }

  try {
    const res = await fetch(`/api/availability?date=${date}`);
    const data = await res.json();
    const booked = data.booked || [];
    updateTimeSlotAvailability(booked);

    if (slotNote) {
      const allSlots = ["8:00 AM", "11:00 AM", "2:00 PM", "5:00 PM"];
      const remaining = allSlots.filter(t => !booked.includes(t)).length;
      slotNote.className = "slot-note";
      slotNote.textContent = remaining < 4 && remaining > 0
        ? `${remaining} of 4 slots still open on this date.`
        : remaining === 0
          ? "This date is fully booked. Please choose another."
          : "";
    }
  } catch {
    if (slotNote) slotNote.textContent = "";
    clearTimeSlotAvailability();
  }
}

function updateTimeSlotAvailability(bookedTimes) {
  document.querySelectorAll(".time-slot").forEach(label => {
    const radio = label.querySelector("input[type='radio']");
    if (!radio) return;
    const isBooked = bookedTimes.includes(radio.value);
    label.classList.toggle("time-slot-booked", isBooked);
    radio.disabled = isBooked;
    if (isBooked && radio.checked) radio.checked = false;
  });
}

function clearTimeSlotAvailability() {
  document.querySelectorAll(".time-slot").forEach(label => {
    label.classList.remove("time-slot-booked");
    const radio = label.querySelector("input[type='radio']");
    if (radio) radio.disabled = false;
  });
  if (slotNote) slotNote.textContent = "";
}

// ─── Live price calculator ───────────────────────────────────────────
function updateTotal() {
  const totalEl = document.getElementById("booking-total");
  const amountEl = document.getElementById("booking-total-amount");
  if (!totalEl || !amountEl || !contactForm) return;

  const vehicleInput = contactForm.querySelector("input[name='vehicle-type']");
  const vehicleKey = vehicleInput ? vehicleInput.value : "";
  const checkedBoxes = [...contactForm.querySelectorAll("input[name='services']:checked")];

  if (checkedBoxes.length === 0) {
    totalEl.hidden = true;
    return;
  }

  let total = 0;
  let hasCustom = false;

  checkedBoxes.forEach(cb => {
    let price = null;
    if (vehicleKey) {
      const attr = `price${vehicleKey.charAt(0).toUpperCase()}${vehicleKey.slice(1)}`;
      price = cb.dataset[attr];
    }
    if (price) {
      total += parseFloat(price);
    } else {
      const priceEl = cb.closest(".service-check")?.querySelector(".check-price");
      const priceText = priceEl ? priceEl.textContent.trim() : "";
      if (priceText === "Custom" || priceText === "Custom Quote") {
        hasCustom = true;
      } else {
        const num = parseFloat(priceText.replace(/[^0-9.]/g, ""));
        if (!isNaN(num)) total += num;
      }
    }
  });

  totalEl.hidden = false;
  if (total === 0 && hasCustom) {
    amountEl.textContent = "Custom Quote";
  } else if (total > 0 && hasCustom) {
    amountEl.textContent = `$${total} + Custom`;
  } else {
    amountEl.textContent = `$${total}`;
  }
}

// ─── Service selector ────────────────────────────────────────────────
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
      valueEl.textContent = vehicle ? `${vehicle}: ${selected[0]}` : selected[0];
      valueEl.classList.add("has-selection");
    } else {
      valueEl.textContent = vehicle ? `${vehicle}: ${selected.length} services` : `${selected.length} services selected`;
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
      updateTotal();
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
    updateTotal();
  });

  trigger.addEventListener("click", () => {
    const isOpen = wrap.hasAttribute("data-open");
    closeAllServiceDropdowns(isOpen ? null : wrap);
    if (!isOpen) {
      wrap.setAttribute("data-open", "");
      trigger.setAttribute("aria-expanded", "true");
    }
  });

  checkboxes.forEach(cb => cb.addEventListener("change", () => {
    updateValue();
    updateTotal();
  }));
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".service-select-wrap")) {
    closeAllServiceDropdowns(null);
  }
});

// ─── Form submission — claim slot then send via Web3Forms ────────────
if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = contactForm.querySelector("button[type='submit']");
    const originalText = button ? button.textContent : "";

    if (button) {
      button.textContent = "Sending…";
      button.disabled = true;
    }

    const dateVal = contactForm.querySelector("input[name='preferred-date']")?.value;
    const timeVal = contactForm.querySelector("input[name='preferred-time']:checked")?.value;

    // If both date and time are selected, atomically claim the slot first
    if (dateVal && timeVal) {
      try {
        const bookRes = await fetch("/api/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: dateVal, time: timeVal })
        });
        const bookData = await bookRes.json();

        if (!bookData.success) {
          if (button) {
            button.textContent = originalText;
            button.disabled = false;
          }
          if (slotNote) {
            slotNote.textContent = bookData.error || "That time is no longer available. Please choose another.";
            slotNote.className = "slot-note slot-error";
          }
          fetchAvailability(dateVal);
          return;
        }
      } catch {
        if (button) {
          button.textContent = originalText;
          button.disabled = false;
        }
        if (slotNote) {
          slotNote.textContent = "Booking failed. Please try again.";
          slotNote.className = "slot-note slot-error";
        }
        return;
      }
    }

    // Slot claimed (or no date/time selected) — send inquiry via Web3Forms
    const formData = new FormData(contactForm);
    formData.append("access_key", WEB3FORMS_KEY);
    formData.append("subject", "New Booking Request: Powers Mobile Services");
    formData.append("from_name", "Powers Mobile Services Website");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      const data = await res.json();

      if (button) {
        if (data.success) {
          button.textContent = "Inquiry Sent!";
          contactForm.reset();
          const valueEl = contactForm.querySelector(".service-select-value");
          if (valueEl) {
            valueEl.textContent = "Choose a category...";
            valueEl.classList.remove("has-selection");
          }
          const wrap = contactForm.querySelector(".service-select-wrap");
          if (wrap) wrap.removeAttribute("data-open");
          const totalEl = document.getElementById("booking-total");
          if (totalEl) totalEl.hidden = true;
          clearTimeSlotAvailability();
          if (slotNote) slotNote.textContent = "";
        } else {
          button.textContent = originalText;
          button.disabled = false;
        }
      }
    } catch {
      if (button) {
        button.textContent = originalText;
        button.disabled = false;
      }
    }
  });
}

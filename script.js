// ============================================================
// Aevon SMP — site interactions
// ============================================================

const SERVER_IP = "aevonsmp.online";
const SERVER_PORT = "19023";

/* ---------- Copy to clipboard + toast ---------- */
const toast = document.getElementById("toast");
let toastTimer = null;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

async function copyText(text, message) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    // Fallback for older browsers / non-secure contexts
    const temp = document.createElement("textarea");
    temp.value = text;
    temp.style.position = "fixed";
    temp.style.opacity = "0";
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);
  }
  showToast(message);
}

function wireCopyButton(id, text, message) {
  const el = document.getElementById(id);
  if (el) el.addEventListener("click", () => copyText(text, message));
}

wireCopyButton("navCopyIp", SERVER_IP, "IP copied!");
wireCopyButton("heroCopyIp", SERVER_IP, "IP copied!");
wireCopyButton("ctaCopyIp", SERVER_IP, "IP copied!");
wireCopyButton("cardCopyIp", SERVER_IP, "IP copied!");
wireCopyButton("cardCopyPort", SERVER_PORT, "Port copied!");

/* ---------- Mobile nav toggle ---------- */
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    hamburger.classList.toggle("open", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------- Footer year ---------- */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- Hero parallax ---------- */
const heroBgPhoto = document.querySelector(".hero-bg-photo");
const heroSection = document.querySelector(".hero");

if (heroBgPhoto && heroSection && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let ticking = false;
  function updateParallax() {
    const rect = heroSection.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      const offset = window.scrollY * 0.18;
      heroBgPhoto.style.transform = `scale(1.08) translateY(${offset}px)`;
    }
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
  updateParallax();
}

/* ---------- Section heading fade-in on scroll ---------- */
const fadeTargets = document.querySelectorAll(
  ".eyebrow, .section-title, .section-lede"
);
fadeTargets.forEach((el) => el.classList.add("reveal-fade"));

if ("IntersectionObserver" in window) {
  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  fadeTargets.forEach((el) => fadeObserver.observe(el));
} else {
  fadeTargets.forEach((el) => el.classList.add("in-view"));
}


/* ---------- Scroll reveal ---------- */
const revealTargets = document.querySelectorAll(
  ".feature-card, .update-card, .news-card, .staff-card, .server-card, .join-copy, .gallery-item"
);
revealTargets.forEach((el) => el.classList.add("reveal"));

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealTargets.forEach((el) => observer.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add("in-view"));
}

/* ---------- Player gallery carousels ---------- */
document.querySelectorAll(".gallery-item").forEach((item) => {
  const slides = Array.from(item.querySelectorAll(".gallery-slide"));
  const dotsWrap = item.querySelector(".gallery-dots");
  const prevBtn = item.querySelector(".gallery-arrow.prev");
  const nextBtn = item.querySelector(".gallery-arrow.next");
  if (!slides.length) return;

  let current = Math.max(0, slides.findIndex((s) => s.classList.contains("is-active")));

  // Build one dot per picture
  const dots = slides.map((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "gallery-dot";
    dot.setAttribute("aria-label", `Go to picture ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
    return dot;
  });

  function goTo(index) {
    slides[current].classList.remove("is-active");
    dots[current].classList.remove("is-active");
    current = (index + slides.length) % slides.length;
    slides[current].classList.add("is-active");
    dots[current].classList.add("is-active");
  }

  dots[current].classList.add("is-active");

  if (prevBtn) prevBtn.addEventListener("click", () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => goTo(current + 1));

  // Auto-advance every few seconds, paused while the user is hovering
  // or has focus within the gallery frame (accessibility-friendly).
  if (slides.length > 1) {
    let autoTimer = null;
    const frame = item.querySelector(".gallery-frame");

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(() => goTo(current + 1), 4500);
    }
    function stopAuto() {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = null;
    }

    startAuto();
    if (frame) {
      frame.addEventListener("mouseenter", stopAuto);
      frame.addEventListener("mouseleave", startAuto);
      frame.addEventListener("focusin", stopAuto);
      frame.addEventListener("focusout", startAuto);
    }
  }

  // Click a slide to open it full-size in the lightbox
  slides.forEach((slide) => {
    slide.addEventListener("click", () => openLightbox(slide.src, slide.alt));
  });
});

/* ---------- Gallery lightbox ---------- */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

function openLightbox(src, alt) {
  if (!lightbox || !lightboxImg) return;
  lightboxImg.src = src;
  lightboxImg.alt = alt || "";
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
}

if (lightbox) {
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}

/* ---------- Vote links drawer ---------- */
const voteDrawer = document.getElementById("voteDrawer");
const voteDrawerTab = document.getElementById("voteDrawerTab");

if (voteDrawer && voteDrawerTab) {
  voteDrawerTab.addEventListener("click", () => {
    const isOpen = voteDrawer.classList.toggle("open");
    voteDrawerTab.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (e) => {
    if (!voteDrawer.contains(e.target)) {
      voteDrawer.classList.remove("open");
      voteDrawerTab.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      voteDrawer.classList.remove("open");
      voteDrawerTab.setAttribute("aria-expanded", "false");
    }
  });
}

/* ---------- Background music ---------- */
const bgMusic = document.getElementById("bgMusic");
const soundToggle = document.getElementById("soundToggle");
const soundToggleIcon = document.getElementById("soundToggleIcon");

if (bgMusic && soundToggle) {
  bgMusic.volume = 0.4;
  let userEnabled = false;

  function setToggleState(isPlaying) {
    soundToggle.setAttribute("aria-pressed", String(isPlaying));
    soundToggleIcon.textContent = isPlaying ? "🔊" : "🔇";
  }

  // Try to start playback automatically. Most browsers block audio with
  // sound before any user interaction, so this quietly falls back to
  // waiting for the first click/tap/keypress on the page.
  function tryAutoplay() {
    bgMusic.muted = false;
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setToggleState(true))
        .catch(() => setToggleState(false));
    }
  }

  tryAutoplay();

  function unlockOnFirstInteraction() {
    if (userEnabled) return;
    userEnabled = true;
    if (bgMusic.paused) {
      bgMusic.muted = false;
      bgMusic.play().then(() => setToggleState(true)).catch(() => setToggleState(false));
    }
    window.removeEventListener("pointerdown", unlockOnFirstInteraction);
    window.removeEventListener("keydown", unlockOnFirstInteraction);
  }
  window.addEventListener("pointerdown", unlockOnFirstInteraction);
  window.addEventListener("keydown", unlockOnFirstInteraction);

  soundToggle.addEventListener("click", () => {
    userEnabled = true;
    if (bgMusic.paused) {
      bgMusic.muted = false;
      bgMusic.play().then(() => setToggleState(true)).catch(() => setToggleState(false));
    } else {
      bgMusic.pause();
      setToggleState(false);
    }
  });
}

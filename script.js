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

/* ---------- Scroll reveal ---------- */
const revealTargets = document.querySelectorAll(
  ".feature-card, .update-card, .staff-card, .server-card, .join-copy"
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

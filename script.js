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
});

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

// ATeam Wiki floating viewer
(() => {
  const viewer = document.querySelector('[data-wiki-viewer]');
  if (!viewer) return;
  const pages = [
    ['images/wiki/ateam/ateam-page-1.png','Page 1 — Creation, Recruitment, Team Structure, Profile & Levels'],
    ['images/wiki/ateam/ateam-page-2.png','Page 2 — Team Power System'],
    ['images/wiki/ateam/ateam-page-3.png','Page 3 — PvP, Dominance, Quests, Wealth, Bank, Homes & Roles'],
    ['images/wiki/ateam/ateam-page-4.png','Page 4 — Alliances, Identity, Leaderboard, Inactivity & Integrations'],
    ['images/wiki/ateam/ateam-page-5.png','Page 5 — Commands, Permissions, Settings & Storage'],
    ['images/wiki/ateam/ateam-page-6.png','Page 6 — Alliances, Enemies, Storage, Messages & Quick Commands']
  ];
  let index = 0;
  const image=viewer.querySelector('[data-wiki-image]'), caption=viewer.querySelector('[data-wiki-caption]'), current=viewer.querySelector('[data-wiki-current]');
  const dotsBox=document.querySelector('[data-wiki-dots]');
  const dots=pages.map((_,i)=>{const b=document.createElement('button');b.className='wiki-dot';b.type='button';b.setAttribute('aria-label',`Go to page ${i+1}`);b.onclick=()=>show(i);dotsBox.appendChild(b);return b;});
  function show(i){index=(i+pages.length)%pages.length;image.src=pages[index][0];image.alt=`ATeam Wiki page ${index+1}`;caption.textContent=pages[index][1];current.textContent=index+1;dots.forEach((d,j)=>d.classList.toggle('active',j===index));}
  viewer.querySelector('.wiki-prev').onclick=()=>show(index-1);
  viewer.querySelector('.wiki-next').onclick=()=>show(index+1);
  image.onclick=()=>window.open(pages[index][0], '_blank');
  let sx=0; image.addEventListener('touchstart',e=>sx=e.changedTouches[0].clientX,{passive:true});
  image.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>45)show(index+(dx<0?1:-1));},{passive:true});
  document.addEventListener('keydown',e=>{if(!viewer.closest('#wiki'))return;if(e.key==='ArrowLeft')show(index-1);if(e.key==='ArrowRight')show(index+1);});
  show(0);
})();

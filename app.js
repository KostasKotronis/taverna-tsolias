// =====================================================
// app.js — i18n + menu carousels + photos/events carousels
// =====================================================

const LANG_KEY = "site_lang";
let dict = null;

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text ?? "";
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}
function escapeAttr(str) { return escapeHtml(str); }

async function loadLanguage(lang) {
  const res = await fetch(`i18n/${lang}.json`, { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load language JSON");
  dict = await res.json();

  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.lang = lang;

  applyTranslations();
  renderMenuCarousels();
  renderPhotosCarousel();
  renderEventsCarousel();
  setActiveLangButton(lang);
}

function applyTranslations() {
  setText("brand", dict.brand);

  setText("nav-home", dict.nav.home);
  setText("nav-menu", dict.nav.menu);
  setText("nav-photos", dict.nav.photos);
  setText("nav-events", dict.nav.events);
  setText("nav-contact", dict.nav.contact);

  setText("hero-title", dict.hero.title);
  setText("hero-subtitle", dict.hero.subtitle);

  setText("menu-title", dict.menu.title);
  setText("menu-subtitle", dict.menu.subtitle);

  setText("photos-title", dict.photos.title);

  setText("events-title", dict.events.title);
  setText("events-subtitle", dict.events.subtitle);

  setText("contact-title", dict.contact.title);
  setText("contact-box-title", dict.contact.boxTitle);

  setText("contact-phone-label", dict.contact.phoneLabel);
  setText("contact-phone-value", dict.contact.phoneValue);

  setText("contact-address-label", dict.contact.addressLabel);
  setText("contact-address-value", dict.contact.addressValue);

  setText("contact-hours-label", dict.contact.hoursLabel);
  setText("contact-hours-value", dict.contact.hoursValue);

  setText("contact-call-btn", dict.contact.callBtn);

  const mapsBtn = document.getElementById("contact-maps-btn");
  if (mapsBtn) {
    mapsBtn.textContent = dict.contact.mapsBtn;
    mapsBtn.href = dict.contact.mapsUrl;
  }

  const year = new Date().getFullYear();
  const rights = (dict.footer?.rights || "").replace("{year}", year);
  setText("footer-rights", rights);
}

function setActiveLangButton(lang) {
  const elBtn = document.getElementById("lang-el");
  const enBtn = document.getElementById("lang-en");
  if (!elBtn || !enBtn) return;

  elBtn.classList.toggle("btn-secondary", lang === "el");
  elBtn.classList.toggle("btn-outline-secondary", lang !== "el");

  enBtn.classList.toggle("btn-secondary", lang === "en");
  enBtn.classList.toggle("btn-outline-secondary", lang !== "en");
}

function setupLanguageButtons() {
  document.getElementById("lang-el")?.addEventListener("click", () => loadLanguage("el"));
  document.getElementById("lang-en")?.addEventListener("click", () => loadLanguage("en"));
}

function setupMobileNavAutoClose() {
  const navMenu = document.getElementById("navMenu");
  const toggler = document.querySelector(".navbar-toggler");
  if (!navMenu || !toggler) return;

  const bsCollapse = new bootstrap.Collapse(navMenu, { toggle: false });

  document.querySelectorAll("#navMenu .nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      const isMobile = window.getComputedStyle(toggler).display !== "none";
      if (isMobile) bsCollapse.hide();
    });
  });
}

function setupBackToTop() {
  const backToTop = document.getElementById("backToTop");
  if (!backToTop) return;

  const showAfter = 300;

  window.addEventListener("scroll", () => {
    if (window.scrollY > showAfter) backToTop.classList.add("show");
    else backToTop.classList.remove("show");
  });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/**
 * Generic Bootstrap carousel builder (with indicators).
 *
 * items: [{ src, alt, caption? }]
 */
function buildCarouselHtml(carouselId, items) {
  const indicators = items.map((_, i) => `
    <button type="button"
            data-bs-target="#${escapeAttr(carouselId)}"
            data-bs-slide-to="${i}"
            class="${i === 0 ? "active" : ""}"
            ${i === 0 ? 'aria-current="true"' : ""}
            aria-label="Slide ${i + 1}"></button>
  `).join("");

  const slides = items.map((it, i) => `
    <div class="carousel-item ${i === 0 ? "active" : ""}">
      <img src="${escapeAttr(it.src)}" alt="${escapeAttr(it.alt || "")}" class="d-block w-100 carousel-img" loading="lazy">
      ${it.caption ? `
        <div class="carousel-caption">
          <h5 class="mb-0">${escapeHtml(it.caption)}</h5>
        </div>
      ` : ""}
    </div>
  `).join("");

  const controls = items.length > 1 ? `
    <button class="carousel-control-prev" type="button" data-bs-target="#${escapeAttr(carouselId)}" data-bs-slide="prev" aria-label="Previous">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    </button>
    <button class="carousel-control-next" type="button" data-bs-target="#${escapeAttr(carouselId)}" data-bs-slide="next" aria-label="Next">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
    </button>
  ` : "";

  return `
    <div id="${escapeAttr(carouselId)}" class="carousel slide" data-bs-ride="false">
      <div class="carousel-indicators">
        ${indicators}
      </div>
      <div class="carousel-inner">
        ${slides}
      </div>
      ${controls}
    </div>
  `;
}

/**
 * MENU: one carousel per category.
 * Each slide shows one dish image + caption title (dish name).
 */
function renderMenuCarousels() {
  const container = document.getElementById("menu-container");
  if (!container) return;

  container.innerHTML = "";

  dict.menu.categories.forEach((cat, catIndex) => {
    const block = document.createElement("div");

    const title = `
      <div class="d-flex align-items-end justify-content-between flex-wrap gap-2">
        <h3 class="fw-bold mb-0">${escapeHtml(cat.name)}</h3>
      </div>
    `;

    const items = cat.items.map((item) => ({
      src: item.image,
      alt: item.name,
      caption: item.name
    }));

    const carouselId = `menuCarousel-${catIndex}`;
    const carousel = buildCarouselHtml(carouselId, items);

    block.innerHTML = `${title}<div class="mt-2">${carousel}</div>`;
    container.appendChild(block);
  });
}

/**
 * PHOTOS: static carousel (edit the list here).
 */

 function normalizeCarouselItems(items) {
   // ασφαλές fallback αν λείπει ή είναι άδειο
   if (!Array.isArray(items) || items.length === 0) return [];
   return items.map((it, idx) => ({
     src: it.src,
     alt: it.alt || `Slide ${idx + 1}`,
     caption: it.caption || "" // προαιρετικό, δεν το χρησιμοποιούμε εδώ
   }));
 }

function renderPhotosCarousel() {
  const wrap = document.getElementById("photos-carousel-wrap");
  if (!wrap) return;

  const items = normalizeCarouselItems(dict.photos?.items);

  // αν δεν έχει items, μην δείξεις τίποτα (ή μπορείς να δείξεις μήνυμα)
  if (items.length === 0) {
    wrap.innerHTML = "";
    return;
  }

  wrap.innerHTML = buildCarouselHtml("photosCarousel", items);
}

/**
 * EVENTS: static carousel (edit the list here).
 */
function renderEventsCarousel() {
  const wrap = document.getElementById("events-carousel-wrap");
  if (!wrap) return;

  const items = normalizeCarouselItems(dict.events?.items);

  if (items.length === 0) {
    wrap.innerHTML = "";
    return;
  }

  wrap.innerHTML = buildCarouselHtml("eventsCarousel", items);
}

// Boot
setupBackToTop();
setupMobileNavAutoClose();
setupLanguageButtons();

const initialLang = localStorage.getItem(LANG_KEY) || "el";
loadLanguage(initialLang).catch(() => loadLanguage("el"));

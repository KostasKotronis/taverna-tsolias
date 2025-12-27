// =====================================================
// app.js — i18n + render menu + UX helpers
// =====================================================

// 1) Ρυθμίσεις
const LANG_KEY = "site_lang"; // localStorage key
let dict = null;              // θα κρατάει τα δεδομένα του JSON (el/en)

// 2) Helpers για να γράφουμε κείμενο με ασφάλεια
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text ?? "";
}

// Escape για να μην μπορεί να “σπάσει” HTML αν μπει περίεργο string στο JSON
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));
}
function escapeAttr(str) {
  return escapeHtml(str);
}

// 3) Φόρτωσε το κατάλληλο JSON (el/en)
async function loadLanguage(lang) {
  const res = await fetch(`i18n/${lang}.json`, { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load language JSON");

  dict = await res.json();

  // αποθήκευση επιλογής
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.lang = lang;

  // εφαρμογή
  applyTranslations();
  renderMenu();
  setActiveLangButton(lang);
}

// 4) Γέμισε τα strings στα σταθερά σημεία του HTML
function applyTranslations() {
  // Brand
  setText("brand", dict.brand);
  setText("footer-brand", dict.brand);

  // Navbar
  setText("nav-home", dict.nav.home);
  setText("nav-menu", dict.nav.menu);
  setText("nav-photos", dict.nav.photos);
  setText("nav-events", dict.nav.events);
  setText("nav-contact", dict.nav.contact);

  // Hero
  setText("hero-title", dict.hero.title);
  setText("hero-subtitle", dict.hero.subtitle);

  // Menu section
  setText("menu-title", dict.menu.title);
  setText("menu-subtitle", dict.menu.subtitle);

  // Photos
  setText("photos-title", dict.photos.title);

  // Events
  setText("events-title", dict.events.title);
  setText("events-subtitle", dict.events.subtitle);

  // Contact
  setText("contact-title", dict.contact.title);
  setText("contact-box-title", dict.contact.boxTitle);

  setText("contact-phone-label", dict.contact.phoneLabel);
  setText("contact-phone-value", dict.contact.phoneValue);
  setText("contact-address-label", dict.contact.addressLabel);
  setText("contact-address-value", dict.contact.addressValue);
  setText("contact-hours-label", dict.contact.hoursLabel);
  setText("contact-hours-value", dict.contact.hoursValue);

  setText("contact-call-btn", dict.contact.callBtn);
  setText("contact-maps-btn", dict.contact.mapsBtn);

  const mapsBtn = document.getElementById("contact-maps-btn");
  if (mapsBtn) {
    mapsBtn.textContent = dict.contact.mapsBtn;
    mapsBtn.href = dict.contact.mapsUrl;
  }

  // Footer
  const year = new Date().getFullYear();
  setText(
    "footer-rights",
    dict.footer.rights.replace("{year}", year)
  );
}

// 5) Render του μενού ως cards με εικόνες (από dict.menu.categories)
function renderMenu() {
  const container = document.getElementById("menu-container");
  if (!container) return;

  container.innerHTML = "";

  dict.menu.categories.forEach((cat) => {
    // Header για κατηγορία (full width)
    const header = document.createElement("div");
    header.className = "col-12";
    header.innerHTML = `
      <div class="d-flex align-items-end justify-content-between mt-3">
        <h3 class="fw-bold mb-0">${escapeHtml(cat.name)}</h3>
      </div>
      <hr class="mt-2" />
    `;
    container.appendChild(header);

    // Items = cards
    cat.items.forEach((item) => {
      const col = document.createElement("div");
      col.className = "col-12 col-md-6 col-lg-4";

      col.innerHTML = `
        <div class="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
          <img
            src="${escapeAttr(item.image)}"
            class="card-img-top"
            alt="${escapeAttr(item.name)}"
            loading="lazy"
            style="height: 200px; object-fit: cover;"
          >
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <h5 class="card-title fw-bold mb-1">${escapeHtml(item.name)}</h5>
              <span class="fw-semibold text-nowrap">${escapeHtml(item.price)}</span>
            </div>
            ${item.desc ? `<p class="card-text text-muted mb-0">${escapeHtml(item.desc)}</p>` : ""}
          </div>
        </div>
      `;

      container.appendChild(col);
    });
  });
}

// 6) UI για να φαίνεται ποια γλώσσα είναι ενεργή
function setActiveLangButton(lang) {
  const elBtn = document.getElementById("lang-el");
  const enBtn = document.getElementById("lang-en");
  if (!elBtn || !enBtn) return;

  // κάνουμε toggle classes για να φαίνεται "selected"
  elBtn.classList.toggle("btn-secondary", lang === "el");
  elBtn.classList.toggle("btn-outline-secondary", lang !== "el");

  enBtn.classList.toggle("btn-secondary", lang === "en");
  enBtn.classList.toggle("btn-outline-secondary", lang !== "en");
}

// 7) Back-to-top button + footer year
function setupBackToTop() {
  // footer year
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

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

// 8) Κλείσιμο burger menu μετά από click σε link (μόνο σε mobile)
function setupMobileNavAutoClose() {
  const navMenu = document.getElementById("navMenu");
  const toggler = document.querySelector(".navbar-toggler");
  if (!navMenu || !toggler) return;

  // Bootstrap collapse instance
  const bsCollapse = new bootstrap.Collapse(navMenu, { toggle: false });

  document.querySelectorAll("#navMenu .nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      // Αν το toggler είναι ορατό => είμαστε σε mobile layout
      const isMobile = window.getComputedStyle(toggler).display !== "none";
      if (isMobile) bsCollapse.hide();
    });
  });
}

// 9) Events για τα κουμπιά γλώσσας
function setupLanguageButtons() {
  document.getElementById("lang-el")?.addEventListener("click", () => loadLanguage("el"));
  document.getElementById("lang-en")?.addEventListener("click", () => loadLanguage("en"));
}

// 10) Boot
setupBackToTop();
setupMobileNavAutoClose();
setupLanguageButtons();

const initialLang = localStorage.getItem(LANG_KEY) || "el";
loadLanguage(initialLang).catch(() => loadLanguage("el"));

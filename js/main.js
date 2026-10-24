(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------------- i18n (FR default, EN toggle) ---------------- */
  const EN = {
    skip: "Skip to content",
    "nav.about": "Our story", "nav.menu": "Menu", "nav.nights": "Nights", "nav.gallery": "Gallery",
    "nav.private": "Private events", "nav.visit": "Visit us",
    "cta.reserve": "Reserve", "cta.reserveTable": "Book a table", "cta.menu": "View the menu",
    "hero.eyebrow": "Laval · Resto & Lounge", "hero.title1": "Dine beneath", "hero.title2": "the moon",
    "hero.lead": "Refined cuisine, signature cocktails and a low-lit atmosphere — from dinner into the small hours.",
    "about.eyebrow": "Our story", "about.title": "Where the evening takes its time", "about.badge": "nights a week",
    "about.p1": "Moonlight was born from a simple idea: give Laval a place where you come for a great meal and stay for the atmosphere. Dimmed lights, velvet banquettes and a kitchen that celebrates the seasons.",
    "about.p2": "As night falls, the dining room slowly becomes a lounge: the music rises, the cocktails flow, and the moon keeps watch over the rest.",
    "about.s1": "Seats", "about.s2": "Signature cocktails", "about.s3": "Hours of music / wk",
    "sig.eyebrow": "Signatures", "sig.title": "The house must-haves",
    "menu.eyebrow": "The menu", "menu.title": "A menu for every phase of the moon",
    "menu.tab1": "Starters", "menu.tab2": "Mains", "menu.tab3": "Desserts", "menu.tab4": "Cocktails",
    "m.share": "To share", "m.veg": "Veggie", "m.sig": "Signature", "m.zero": "Alcohol-free",
    "m.s1": "Crescent tuna tartare", "m.s1d": "Albacore tuna, avocado, yuzu, black rice crisps",
    "m.s2": "Burrata & local tomatoes", "m.s2d": "Basil pesto, smoked oil, house focaccia",
    "m.s3": "Crispy calamari", "m.s3d": "Preserved lemon aioli, Espelette pepper",
    "m.s4": "Starry Night board", "m.s4d": "Charcuterie, Québec cheeses, olives, nuts, grapes and crackers",
    "m.p1": "Midnight filet mignon", "m.p1d": "8 oz AAA beef, truffled purée, port jus",
    "m.p2": "Maple-glazed salmon", "m.p2d": "Wild rice, asparagus, citrus beurre blanc",
    "m.p3": "Parmesan & herb risotto", "m.p3d": "24-month Parmigiano, brown butter, fresh herbs",
    "m.p4": "Grilled octopus", "m.p4d": "Fondant potatoes, chorizo, romesco",
    "m.p5": "Clair de lune pasta", "m.p5d": "Tiger shrimp, garlic, white wine, chili, parmesan",
    "m.d1": "Chocolate eclipse", "m.d1d": "70% dark chocolate cake, silky ganache, vanilla ice cream",
    "m.d2": "Lavender crème brûlée", "m.d2d": "Caramelized sugar, Breton shortbread",
    "m.d3": "Full moon", "m.d3d": "White chocolate sphere, red berries, warm sauce poured tableside",
    "m.c1d": "Gin, Lillet blanc, apricot liqueur, orange zest — golden as the full moon",
    "m.c2d": "Bourbon, smoked maple syrup, orange bitters, cherry",
    "m.c3d": "Spiced rum, espresso, cacao liqueur",
    "m.c4d": "Vodka, lychee, rose, sparkling wine",
    "m.c5d": "Honey, ginger, lime, sparkling water",
    "menu.note": "Prices in Canadian dollars, taxes extra. Let us know about any allergies — our team will tailor your experience.",
    "nights.eyebrow": "The nights", "nights.title": "Every night has its phase",
    "nights.1.day": "Wednesday", "nights.1.t": "Wine & Crescent", "nights.1.d": "Selected bottles at half price with any main course.",
    "nights.2.day": "Thursday", "nights.2.t": "Jazz by moonlight", "nights.2.d": "Live jazz trio from 8 pm. 3-course tasting menu.",
    "nights.3.day": "Friday & Saturday", "nights.3.t": "Full moon — DJ Lounge", "nights.3.d": "Dinner turns into lounge at 10 pm. Resident DJs, bottle service, smart dress code.",
    "nights.4.day": "Sunday", "nights.4.t": "Honeymoon brunch", "nights.4.d": "Gourmet brunch from 10 am to 3 pm, mimosas and acoustic music.",
    "gallery.eyebrow": "Gallery", "gallery.title": "The Moonlight atmosphere",
    "g.1": "The bar", "g.2": "Wine cellar", "g.3": "Mixology", "g.4": "At the table", "g.5": "Velvet banquettes", "g.6": "Events",
    "private.eyebrow": "Private events", "private.title": "Your night, our moon",
    "private.p": "Birthdays, business dinners, engagements or launches: our private salon welcomes up to 40 guests, and the full room up to 150 for cocktails.",
    "private.l1": "Custom menus and bottle packages", "private.l2": "DJ, lighting and bespoke décor", "private.l3": "A dedicated coordinator for your event",
    "private.cta": "Plan an event", "private.small": "Reply within 24 hours.",
    "reserve.eyebrow": "Reservations", "reserve.title": "Save us a seat under the moon",
    "reserve.p": "Book online or give us a call. For groups of more than 10, choose “Private event”.",
    "f.name": "Full name", "f.email": "Email", "f.phone": "Phone", "f.date": "Date", "f.time": "Time", "f.guests": "Guests",
    "f.type": "Occasion", "f.t1": "Dinner", "f.t2": "Lounge night", "f.t3": "Birthday", "f.t4": "Private event",
    "f.notes": "Notes", "f.optional": "(optional)", "f.notesHint": "Allergies, seating preferences, a surprise to prepare…",
    "f.submit": "Confirm request",
    "visit.eyebrow": "Visit us", "visit.title": "Laval, under the same sky", "visit.addr": "Address", "visit.hours": "Opening hours",
    "visit.parking": "Parking", "visit.parkingD": "Free on-site parking. Valet service on Friday and Saturday nights.",
    "d.mon": "Monday – Tuesday", "d.wed": "Wednesday – Thursday", "d.fri": "Friday – Saturday", "d.sun": "Sunday",
    "footer.tag": "Dine beneath the moon, in Laval.", "footer.rights": "All rights reserved.",
    "footer.age": "Alcohol served to guests 18+. Please drink responsibly.", "footer.photos": "Photos: Unsplash",
    "alt.about1": "Table lit by a lamp in a dimly lit dining room", "alt.about2": "Golden cocktail served in a coupe at the bar",
    "alt.sig1": "Sliced beef filet on a black plate", "alt.sig2": "Crispy fried calamari", "alt.sig3": "Shrimp pasta with parmesan",
    "alt.sig4": "Creamy risotto topped with herbs and parmesan", "alt.sig5": "Old fashioned with orange slice and cherry",
    "alt.n1": "Red wine poured into a glass", "alt.n2": "Musician playing the saxophone", "alt.n3": "DJ at the decks at night", "alt.n4": "Brunch table",
    "alt.g1": "Dimly lit bar with stools", "alt.g2": "Red wine poured into a glass", "alt.g3": "Bartender pouring into a cocktail shaker",
    "alt.g4": "Table set with dishes and glasses", "alt.g5": "Dining room with velvet banquettes", "alt.g6": "Table set for an elegant event"
  };

  const UI = {
    fr: {
      langBtn: "EN", langLabel: "Switch to English", menuOpen: "Ouvrir le menu", menuClose: "Fermer le menu",
      errRequired: "Ce champ est requis.", errEmail: "Entrez une adresse courriel valide.",
      errPhone: "Entrez un numéro de téléphone valide.", errDate: "Choisissez une date à partir d'aujourd'hui.",
      errForm: "Veuillez corriger les champs indiqués.",
      success: (n, d, t) => `Merci ${n} ! Votre demande pour le ${d} à ${t} est bien reçue. Nous vous confirmerons par courriel sous peu.`,
      guest: (g) => (g === 1 ? "1 personne" : `${g} personnes`), guestMore: "11+ (groupe)",
      openNow: (c) => `Ouvert maintenant · ferme à ${c}`, closedNow: "Fermé pour le moment",
      locale: "fr-CA"
    },
    en: {
      langBtn: "FR", langLabel: "Passer en français", menuOpen: "Open menu", menuClose: "Close menu",
      errRequired: "This field is required.", errEmail: "Enter a valid email address.",
      errPhone: "Enter a valid phone number.", errDate: "Pick a date from today onward.",
      errForm: "Please fix the highlighted fields.",
      success: (n, d, t) => `Thank you ${n}! Your request for ${d} at ${t} has been received. We'll confirm by email shortly.`,
      guest: (g) => (g === 1 ? "1 guest" : `${g} guests`), guestMore: "11+ (group)",
      openNow: (c) => `Open now · closes at ${c}`, closedNow: "Closed right now",
      locale: "en-CA"
    }
  };

  const i18nNodes = $$("[data-i18n]");
  const altNodes = $$("[data-i18n-alt]");
  const FR = {};
  i18nNodes.forEach((el) => { FR[el.dataset.i18n] = el.innerHTML; });
  altNodes.forEach((el) => { FR[el.dataset.i18nAlt] = el.alt; });

  let lang = "fr";
  try { lang = localStorage.getItem("moonlight-lang") === "en" ? "en" : "fr"; } catch (_) { /* storage unavailable */ }

  function applyLang(next) {
    lang = next;
    document.documentElement.lang = lang;
    const dict = lang === "en" ? EN : FR;
    i18nNodes.forEach((el) => {
      const val = dict[el.dataset.i18n];
      if (val !== undefined && el.innerHTML !== val) el.innerHTML = val;
    });
    altNodes.forEach((el) => {
      const val = dict[el.dataset.i18nAlt];
      if (val) el.alt = val;
    });
    const btn = $("#lang-toggle");
    btn.textContent = UI[lang].langBtn;
    btn.setAttribute("aria-label", UI[lang].langLabel);
    setMenuLabel();
    buildGuestOptions();
    buildTimeOptions();
    updateOpenNow();
    try { localStorage.setItem("moonlight-lang", lang); } catch (_) { /* ignore */ }
    document.dispatchEvent(new CustomEvent("moonlight:lang", { detail: lang }));
  }

  $("#lang-toggle").addEventListener("click", () => applyLang(lang === "fr" ? "en" : "fr"));

  /* ---------------- header + mobile nav ---------------- */
  const header = $(".site-header");
  const menuBtn = $("#menu-toggle");
  const navLinks = $("#nav-links");

  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 24);
    // Hide on scroll down, reveal on scroll up (never while the mobile menu is open)
    const menuOpen = menuBtn.getAttribute("aria-expanded") === "true";
    header.classList.toggle("hidden", !menuOpen && y > 400 && y > lastY);
    lastY = y;
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  header.addEventListener("focusin", () => header.classList.remove("hidden"));

  function setMenuLabel() {
    const open = menuBtn.getAttribute("aria-expanded") === "true";
    menuBtn.setAttribute("aria-label", open ? UI[lang].menuClose : UI[lang].menuOpen);
  }
  function toggleMenu(force) {
    const open = typeof force === "boolean" ? force : menuBtn.getAttribute("aria-expanded") !== "true";
    menuBtn.setAttribute("aria-expanded", String(open));
    navLinks.classList.toggle("open", open);
    header.classList.toggle("menu-open", open);
    setMenuLabel();
  }
  menuBtn.addEventListener("click", () => toggleMenu());
  navLinks.addEventListener("click", (e) => { if (e.target.closest("a")) toggleMenu(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") { toggleMenu(false); menuBtn.focus(); }
  });

  /* scrollspy */
  const spyLinks = $$('.nav-links a[href^="#"]');
  const spyTargets = spyLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        spyLinks.forEach((a) => {
          if (a.getAttribute("href") === `#${entry.target.id}`) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    spyTargets.forEach((t) => spy.observe(t));
  }

  /* ---------------- menu tabs (WAI-ARIA tabs pattern) ---------------- */
  const tabs = $$('[role="tab"]');
  const menuPhotos = $$(".menu-photo img");
  function selectTab(tab, focus) {
    const panelId = tab.getAttribute("aria-controls");
    tabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute("aria-selected", String(selected));
      t.tabIndex = selected ? 0 : -1;
      $(`#${t.getAttribute("aria-controls")}`).hidden = !selected;
    });
    menuPhotos.forEach((img) => img.classList.toggle("active", img.dataset.panel === panelId));
    if (focus) tab.focus();
    document.dispatchEvent(new CustomEvent("moonlight:tab", { detail: $(`#${panelId}`) }));
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tab, false));
    tab.addEventListener("keydown", (e) => {
      let next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === "Home") next = tabs[0];
      if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });
  // Warm the inactive tab photos once the page is idle so switching is instant
  window.addEventListener("load", () => menuPhotos.forEach((img) => { img.loading = "eager"; }));

  /* ---------------- hours + open now ---------------- */
  // [open, close] in hours; close > 24 spills into the next day.
  const SCHEDULE = { 0: [10, 23], 1: [17, 23], 2: [17, 23], 3: [17, 24], 4: [17, 24], 5: [17, 27], 6: [17, 27] };
  const ROW_FOR_DAY = { 0: "0", 1: "1", 2: "1", 3: "3", 4: "3", 5: "5", 6: "5" };

  function fmtHour(h) {
    const hh = h % 24;
    return lang === "fr" ? `${hh} h` : new Date(2000, 0, 1, hh).toLocaleTimeString("en-CA", { hour: "numeric" });
  }
  function updateOpenNow() {
    const now = new Date();
    const day = now.getDay();
    const h = now.getHours() + now.getMinutes() / 60;
    $$(".hours tr").forEach((tr) => tr.classList.toggle("today", tr.dataset.day === ROW_FOR_DAY[day]));

    let closeAt = null;
    const [o, c] = SCHEDULE[day];
    if (h >= o && h < c) closeAt = c;
    const [, pc] = SCHEDULE[(day + 6) % 7];
    if (pc > 24 && h < pc - 24) closeAt = pc;

    const el = $("#open-now");
    el.classList.toggle("is-open", closeAt !== null);
    el.textContent = closeAt !== null ? UI[lang].openNow(fmtHour(closeAt)) : UI[lang].closedNow;
  }
  setInterval(updateOpenNow, 60_000);

  /* ---------------- reservation form ---------------- */
  const form = $("#reserve-form");
  const dateInput = $("#r-date");
  const timeSelect = $("#r-time");
  const guestSelect = $("#r-guests");
  const typeSelect = $("#r-type");
  const statusEl = $("#form-status");
  const submitBtn = $("#r-submit");

  const pad = (n) => String(n).padStart(2, "0");
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = new Date();
  dateInput.min = toISO(today);
  dateInput.value = toISO(today);

  function buildGuestOptions() {
    const current = guestSelect.value || "2";
    guestSelect.innerHTML = "";
    for (let g = 1; g <= 10; g++) guestSelect.add(new Option(UI[lang].guest(g), String(g)));
    guestSelect.add(new Option(UI[lang].guestMore, "11+"));
    guestSelect.value = current;
  }

  function buildTimeOptions() {
    const current = timeSelect.value;
    const d = dateInput.value ? new Date(`${dateInput.value}T00:00`) : today;
    const [open] = SCHEDULE[d.getDay()];
    const lastSeating = 22.5; // last dinner seating 22:30
    const isToday = dateInput.value === toISO(new Date());
    const nowH = new Date().getHours() + new Date().getMinutes() / 60;
    timeSelect.innerHTML = "";
    for (let t = open; t <= lastSeating; t += 0.5) {
      if (isToday && t <= nowH + 0.5) continue;
      const hh = Math.floor(t);
      const mm = t % 1 ? "30" : "00";
      const value = `${pad(hh)}:${mm}`;
      const label = lang === "fr" ? `${hh} h ${mm}` : new Date(2000, 0, 1, hh, +mm).toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });
      timeSelect.add(new Option(label, value));
    }
    if (!timeSelect.options.length) {
      // Too late to book today — roll to tomorrow.
      const tmr = new Date(); tmr.setDate(tmr.getDate() + 1);
      if (dateInput.value === toISO(new Date())) { dateInput.value = toISO(tmr); return buildTimeOptions(); }
    }
    if ([...timeSelect.options].some((o) => o.value === current)) timeSelect.value = current;
  }

  dateInput.addEventListener("change", buildTimeOptions);
  guestSelect.addEventListener("change", () => { if (guestSelect.value === "11+") typeSelect.value = "private"; });

  // Private-events CTA pre-selects the occasion
  $("#private-cta").addEventListener("click", () => { typeSelect.value = "private"; });

  const validators = {
    name: (v) => (v.trim().length >= 2 ? "" : UI[lang].errRequired),
    email: (v) => (!v.trim() ? UI[lang].errRequired : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : UI[lang].errEmail),
    phone: (v) => (!v.trim() ? UI[lang].errRequired : v.replace(/\D/g, "").length >= 10 ? "" : UI[lang].errPhone),
    date: (v) => (!v ? UI[lang].errRequired : v < toISO(new Date()) ? UI[lang].errDate : ""),
    time: (v) => (v ? "" : UI[lang].errRequired)
  };

  function validateField(input) {
    const fn = validators[input.name];
    if (!fn) return true;
    const msg = fn(input.value);
    const err = $(`#${input.id}-err`);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (err) err.textContent = msg;
    return !msg;
  }

  Object.keys(validators).forEach((name) => {
    const input = form.elements[name];
    input.addEventListener("blur", () => { if (input.value || input.getAttribute("aria-invalid")) validateField(input); });
    input.addEventListener("input", () => { if (input.getAttribute("aria-invalid") === "true") validateField(input); });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    statusEl.className = "form-status";
    statusEl.textContent = "";

    const fields = Object.keys(validators).map((n) => form.elements[n]);
    const invalid = fields.filter((f) => !validateField(f));
    if (invalid.length) {
      statusEl.classList.add("error");
      statusEl.textContent = UI[lang].errForm;
      invalid[0].focus();
      return;
    }

    submitBtn.classList.add("is-busy");
    submitBtn.setAttribute("aria-busy", "true");

    // TODO: wire to the real booking backend (e.g. OpenTable, Libro, or a form endpoint).
    setTimeout(() => {
      submitBtn.classList.remove("is-busy");
      submitBtn.removeAttribute("aria-busy");
      const d = new Date(`${dateInput.value}T00:00`).toLocaleDateString(UI[lang].locale, { weekday: "long", day: "numeric", month: "long" });
      const t = timeSelect.options[timeSelect.selectedIndex].text;
      const first = form.elements.name.value.trim().split(/\s+/)[0];
      statusEl.classList.add("success");
      statusEl.textContent = UI[lang].success(first, d, t);
      form.reset();
      dateInput.value = toISO(new Date());
      fields.forEach((f) => f.removeAttribute("aria-invalid"));
      buildGuestOptions();
      buildTimeOptions();
    }, 900);
  });

  /* ---------------- init ---------------- */
  $("#year").textContent = new Date().getFullYear();
  applyLang(lang);
})();

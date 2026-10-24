(() => {
  "use strict";

  document.documentElement.classList.add("js");
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- i18n (FR default, EN toggle) ---------------- */
  const EN = {
    skip: "Skip to content",
    "nav.about": "Our story", "nav.menu": "Menu", "nav.nights": "Nights", "nav.gallery": "Gallery",
    "nav.private": "Private events", "nav.visit": "Visit us",
    "cta.reserve": "Reserve", "cta.reserveTable": "Book a table", "cta.menu": "View the menu",
    "hero.eyebrow": "Laval · Resto & Lounge", "hero.title1": "Dine beneath", "hero.title2": "the moon",
    "hero.lead": "Refined cuisine, signature cocktails and a low-lit atmosphere — from dinner into the small hours.",
    "hl.1.t": "Seasonal cuisine", "hl.1.d": "Québec produce, Mediterranean inspiration.",
    "hl.2.t": "Signature mixology", "hl.2.d": "Crafted cocktails and a private wine selection.",
    "hl.3.t": "Lounge nights", "hl.3.d": "Live jazz, resident DJs and late-night energy.",
    "about.eyebrow": "Our story", "about.title": "Where the evening takes its time", "about.badge": "nights a week",
    "about.p1": "Moonlight was born from a simple idea: give Laval a place where you come for a great meal and stay for the atmosphere. Dimmed lights, velvet banquettes and a kitchen that celebrates the seasons.",
    "about.p2": "As night falls, the dining room slowly becomes a lounge: the music rises, the cocktails flow, and the moon keeps watch over the rest.",
    "about.s1": "Seats", "about.s2": "Signature cocktails", "about.s3": "Private salon",
    "menu.eyebrow": "The menu", "menu.title": "A menu for every phase of the moon",
    "menu.tab1": "Starters", "menu.tab2": "Mains", "menu.tab3": "Desserts", "menu.tab4": "Cocktails",
    "m.share": "To share", "m.veg": "Veggie", "m.sig": "Signature", "m.zero": "Alcohol-free",
    "m.s1": "Crescent tuna tartare", "m.s1d": "Albacore tuna, avocado, yuzu, black rice crisps",
    "m.s2": "Burrata & local tomatoes", "m.s2d": "Basil pesto, smoked oil, house focaccia",
    "m.s3": "Crispy calamari", "m.s3d": "Preserved lemon aioli, Espelette pepper",
    "m.s4": "Starry Night board", "m.s4d": "Charcuterie, Québec cheeses, olives, preserves and grilled bread",
    "m.p1": "Midnight filet mignon", "m.p1d": "8 oz AAA beef, truffled purée, port jus",
    "m.p2": "Maple-glazed salmon", "m.p2d": "Wild rice, asparagus, citrus beurre blanc",
    "m.p3": "Wild mushroom risotto", "m.p3d": "24-month Parmigiano, truffle oil, chives",
    "m.p4": "Grilled octopus", "m.p4d": "Fondant potatoes, chorizo, romesco",
    "m.p5": "Clair de lune pasta", "m.p5d": "Linguine, tiger shrimp, garlic, white wine, chili",
    "m.d1": "Chocolate eclipse", "m.d1d": "70% dark fondant, molten centre, vanilla ice cream",
    "m.d2": "Lavender crème brûlée", "m.d2d": "Caramelized sugar, Breton shortbread",
    "m.d3": "Full moon", "m.d3d": "White chocolate sphere, red berries, warm sauce poured tableside",
    "m.c1d": "Butterfly-pea gin, elderflower, lemon, egg white",
    "m.c2d": "Bourbon, smoked maple syrup, orange bitters",
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
    "g.1": "The dining room", "g.2": "The bar", "g.3": "Moonlight cocktail", "g.4": "Full moon night", "g.5": "Midnight filet mignon", "g.6": "The private salon",
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
    "footer.age": "Alcohol served to guests 18+. Please drink responsibly."
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
  const FR = {};
  i18nNodes.forEach((el) => { FR[el.dataset.i18n] = el.innerHTML; });

  let lang = "fr";
  try { lang = localStorage.getItem("moonlight-lang") === "en" ? "en" : "fr"; } catch (_) { /* storage unavailable */ }

  function applyLang(next) {
    lang = next;
    document.documentElement.lang = lang;
    const dict = lang === "en" ? EN : FR;
    i18nNodes.forEach((el) => {
      const val = dict[el.dataset.i18n];
      if (val !== undefined) el.innerHTML = val;
    });
    $$("[data-i18n-aria]").forEach((el) => {
      const key = el.dataset.i18nAria;
      const val = lang === "en" ? EN[key] : FR[key];
      if (val) el.setAttribute("aria-label", val);
    });
    const btn = $("#lang-toggle");
    btn.textContent = UI[lang].langBtn;
    btn.setAttribute("aria-label", UI[lang].langLabel);
    setMenuLabel();
    buildGuestOptions();
    buildTimeOptions();
    updateOpenNow();
    try { localStorage.setItem("moonlight-lang", lang); } catch (_) { /* ignore */ }
  }

  $("#lang-toggle").addEventListener("click", () => applyLang(lang === "fr" ? "en" : "fr"));

  /* ---------------- header + mobile nav ---------------- */
  const header = $(".site-header");
  const menuBtn = $("#menu-toggle");
  const navLinks = $("#nav-links");

  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

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

  /* ---------------- reveal on scroll ---------------- */
  const reveals = $$(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = Array.from(el.parentElement.children).filter((c) => c.classList.contains("reveal"));
        el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 5) * 70}ms`;
        el.classList.add("in");
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------------- menu tabs (WAI-ARIA tabs pattern) ---------------- */
  const tabs = $$('[role="tab"]');
  function selectTab(tab, focus) {
    tabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute("aria-selected", String(selected));
      t.tabIndex = selected ? 0 : -1;
      $(`#${t.getAttribute("aria-controls")}`).hidden = !selected;
    });
    if (focus) tab.focus();
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

    submitBtn.classList.add("is-loading");
    submitBtn.setAttribute("aria-busy", "true");

    // TODO: wire to the real booking backend (e.g. OpenTable, Libro, or a form endpoint).
    setTimeout(() => {
      submitBtn.classList.remove("is-loading");
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

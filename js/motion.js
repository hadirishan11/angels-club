/* Moonlight — motion layer (GSAP + ScrollTrigger + SplitText).
   Everything here is progressive enhancement: without GSAP, or with
   prefers-reduced-motion, the page renders fully static and readable. */
(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const preloader = $("#preloader");

  const removePreloader = () => {
    document.body.classList.remove("is-loading");
    if (preloader) preloader.remove();
  };

  if (!window.gsap || !window.ScrollTrigger) { removePreloader(); return; }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(window.SplitText);

  const mm = gsap.matchMedia();

  mm.add({
    motion: "(prefers-reduced-motion: no-preference)",
    reduce: "(prefers-reduced-motion: reduce)",
    desktop: "(min-width: 901px)",
    finePointer: "(hover: hover) and (pointer: fine)"
  }, (ctx) => {
    const { motion, desktop, finePointer } = ctx.conditions;

    if (!motion) { removePreloader(); return; }

    /* ---------- preloader → hero intro ---------- */
    const heroTl = gsap.timeline({ paused: true, defaults: { ease: "power4.out" } });
    const lines = $$(".hero-title .ht-line");
    let heroChars = lines;
    if (window.SplitText) {
      heroChars = lines.flatMap((l) => new window.SplitText(l, { type: "chars" }).chars);
    }
    heroTl
      .from(".hero-media", { scale: 1.25, autoAlpha: 0, duration: 2.2, ease: "power2.out" }, 0)
      .from(".hero-moon", { scale: 0.3, autoAlpha: 0, duration: 1.8, ease: "expo.out" }, 0.3)
      .from(".hero-eyebrow", { y: 20, autoAlpha: 0, duration: 0.9 }, 0.4)
      .from(heroChars, { yPercent: 60, rotateX: -80, autoAlpha: 0, filter: "blur(8px)", transformOrigin: "50% 100%", duration: 1.2, stagger: 0.04 }, 0.5)
      .from(".hero-lead", { y: 24, autoAlpha: 0, duration: 1 }, 1.0)
      .from(".hero-ctas .btn", { y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.12 }, 1.15)
      .from(".scroll-cue", { autoAlpha: 0, duration: 1 }, 1.5)
      .from(".site-header", { autoAlpha: 0, y: -20, duration: 1, clearProps: "transform,opacity,visibility" }, 0.9);

    let seen = false;
    try { seen = sessionStorage.getItem("moonlight-intro") === "1"; } catch (_) { /* ignore */ }

    if (preloader && !seen) {
      document.body.classList.add("is-loading");
      const fontsReady = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1200))]);
      const preTl = gsap.timeline({ paused: true });
      preTl
        .from(".pre-word", { autoAlpha: 0, letterSpacing: "0.8em", duration: 1, ease: "power3.out" }, 0)
        .to(".pre-shadow", { xPercent: 105, duration: 1.2, ease: "power2.inOut" }, 0.1)
        .to(".pre-moon", { boxShadow: "0 0 120px rgba(251,248,238,0.6)", duration: 0.5 }, 1.1)
        .to(preloader, { yPercent: -100, duration: 1, ease: "power4.inOut" }, 1.5)
        .add(() => heroTl.play(), 1.75)
        .add(() => {
          removePreloader();
          try { sessionStorage.setItem("moonlight-intro", "1"); } catch (_) { /* ignore */ }
          ScrollTrigger.refresh();
        });
      fontsReady.then(() => preTl.play());
    } else {
      removePreloader();
      heroTl.play();
    }

    /* ---------- hero scroll parallax ---------- */
    gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } })
      .to(".hero-content", { y: -140, autoAlpha: 0, ease: "none" }, 0)
      .to(".hero-media", { yPercent: 12, ease: "none" }, 0)
      .to(".hero-moon", { y: -160, ease: "none" }, 0);

    /* ---------- scroll progress ---------- */
    gsap.to(".scroll-progress span", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

    /* ---------- marquee reacts to scroll velocity ---------- */
    const marqueeTrack = $(".marquee-track");
    if (marqueeTrack) {
      marqueeTrack.style.animation = "none";
      const loop = gsap.to(marqueeTrack, { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
      let dir = 1;
      ScrollTrigger.create({
        onUpdate: (self) => {
          dir = self.direction;
          const boost = Math.min(Math.abs(self.getVelocity()) / 300, 6);
          gsap.to(loop, { timeScale: dir * (1 + boost), duration: 0.2, overwrite: true });
          gsap.to(loop, { timeScale: dir, duration: 1.2, delay: 0.2, ease: "power2.out" });
        }
      });
    }

    /* ---------- section titles: word-by-word mask reveal ---------- */
    $$(".split").forEach((el) => {
      if (!window.SplitText) {
        gsap.from(el, { y: 40, autoAlpha: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" } });
        return;
      }
      const split = new window.SplitText(el, { type: "words", mask: "words", wordsClass: "word" });
      gsap.from(split.words, {
        yPercent: 110, duration: 1.1, ease: "power4.out", stagger: 0.07,
        scrollTrigger: { trigger: el, start: "top 85%" }
      });
    });

    /* ---------- generic fade-ups, batched ---------- */
    gsap.set(".fade-up", { autoAlpha: 0, y: 40 });
    ScrollTrigger.batch(".fade-up", {
      start: "top 88%",
      once: true,
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.12, overwrite: true })
    });

    /* ---------- image clip reveals ---------- */
    $$(".img-reveal").forEach((fig) => {
      const img = $("img", fig);
      const tl = gsap.timeline({ scrollTrigger: { trigger: fig, start: "top 85%" } });
      tl.fromTo(fig, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" });
      if (img) tl.from(img, { scale: 1.35, duration: 1.8, ease: "expo.out" }, 0.1);
    });

    /* ---------- parallax helpers (data-speed) ---------- */
    // Desktop only: on narrow screens the offsets open gaps between stacked tiles.
    if (desktop) $$("[data-speed]").forEach((el) => {
      const speed = parseFloat(el.dataset.speed) || 0;
      gsap.fromTo(el, { y: () => -speed * window.innerHeight }, {
        y: () => speed * window.innerHeight, ease: "none",
        scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true }
      });
    });

    /* ---------- counters ---------- */
    $$("[data-count]").forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      const obj = { v: 0 };
      el.textContent = "0";
      gsap.to(obj, {
        v: target, duration: 2, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: () => { el.textContent = Math.round(obj.v); }
      });
    });

    /* ---------- signatures: pinned horizontal scroll (desktop) ---------- */
    const track = $("#sig-track");
    if (track && desktop) {
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const horiz = gsap.to(track, {
        x: () => -distance(), ease: "none",
        scrollTrigger: {
          trigger: ".signatures", start: "top top", end: () => `+=${distance()}`,
          pin: ".sig-pin", scrub: 1, invalidateOnRefresh: true, anticipatePin: 1
        }
      });
      $$(".sig-card", track).forEach((card) => {
        const img = $("img", card);
        if (img) {
          gsap.fromTo(img, { xPercent: -8, scale: 1.15 }, {
            xPercent: 8, ease: "none",
            scrollTrigger: { trigger: card, containerAnimation: horiz, start: "left right", end: "right left", scrub: true }
          });
        }
      });
    }
    gsap.from(".sig-card", {
      y: 80, autoAlpha: 0, duration: 1.1, ease: "power3.out", stagger: 0.1,
      scrollTrigger: { trigger: ".signatures", start: "top 75%" }
    });

    /* ---------- menu: re-stagger items on tab change ---------- */
    document.addEventListener("moonlight:tab", (e) => {
      const items = $$(".menu-item", e.detail);
      gsap.fromTo(items, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out", stagger: 0.06, overwrite: true });
    });
    gsap.from("#panel-starters .menu-item", {
      y: 30, autoAlpha: 0, duration: 0.8, ease: "power3.out", stagger: 0.08,
      scrollTrigger: { trigger: ".menu-panels", start: "top 80%" }
    });

    /* ---------- nights cards ---------- */
    gsap.from(".night-card", {
      y: 100, autoAlpha: 0, scale: 0.94, duration: 1.2, ease: "power4.out", stagger: 0.12,
      scrollTrigger: { trigger: ".nights-grid", start: "top 80%" }
    });

    /* ---------- private events parallax ---------- */
    gsap.fromTo(".private-media", { yPercent: -8 }, {
      yPercent: 8, ease: "none",
      scrollTrigger: { trigger: ".private", start: "top bottom", end: "bottom top", scrub: true }
    });
    gsap.from(".private-card", {
      x: -60, autoAlpha: 0, duration: 1.2, ease: "power3.out",
      scrollTrigger: { trigger: ".private", start: "top 70%" }
    });

    /* ---------- footer wordmark drift ---------- */
    gsap.fromTo(".footer-big", { xPercent: 10 }, {
      xPercent: -10, ease: "none",
      scrollTrigger: { trigger: ".site-footer", start: "top bottom", end: "bottom bottom", scrub: true }
    });

    /* ---------- gold-dust particles in the hero ---------- */
    const stopParticles = startParticles($("#particles"));

    /* ---------- pointer niceties (desktop, fine pointer only) ---------- */
    const cleanups = [stopParticles];
    if (finePointer) {
      const cursor = $(".cursor");
      const xTo = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
      const yTo = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });
      const move = (e) => { cursor.classList.add("active"); xTo(e.clientX); yTo(e.clientY); };
      const over = (e) => cursor.classList.toggle("hover", !!e.target.closest("a, button, select, .sig-card, .night-card, .g-item"));
      const leave = () => cursor.classList.remove("active");
      window.addEventListener("pointermove", move);
      document.addEventListener("pointerover", over);
      document.documentElement.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        window.removeEventListener("pointermove", move);
        document.removeEventListener("pointerover", over);
        document.documentElement.removeEventListener("pointerleave", leave);
      });

      $$(".magnetic").forEach((btn) => {
        const bx = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" });
        const by = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" });
        const onMove = (e) => {
          const r = btn.getBoundingClientRect();
          bx((e.clientX - (r.left + r.width / 2)) * 0.3);
          by((e.clientY - (r.top + r.height / 2)) * 0.4);
        };
        const onLeave = () => gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
        btn.addEventListener("pointermove", onMove);
        btn.addEventListener("pointerleave", onLeave);
        cleanups.push(() => { btn.removeEventListener("pointermove", onMove); btn.removeEventListener("pointerleave", onLeave); });
      });
    }

    // Images that finish loading late change layout height — keep triggers accurate.
    $$("img").forEach((img) => { if (!img.complete) img.addEventListener("load", () => ScrollTrigger.refresh(), { once: true }); });

    return () => cleanups.forEach((fn) => fn && fn());
  });

  // Never let the preloader trap the page, whatever happens above.
  setTimeout(removePreloader, 5000);

  /* Floating gold dust; pauses when the hero is off-screen or the tab is hidden. */
  function startParticles(canvas) {
    if (!canvas || !canvas.getContext) return null;
    const c = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, visible = true;
    const count = window.innerWidth < 640 ? 34 : 70;
    const dots = [];

    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const spawn = (d, initial) => {
      d.x = Math.random() * w;
      d.y = initial ? Math.random() * h : h + 10;
      d.r = Math.random() * 1.6 + 0.4;
      d.vy = Math.random() * 0.35 + 0.1;
      d.vx = (Math.random() - 0.5) * 0.15;
      d.a = Math.random() * 0.6 + 0.2;
      d.t = Math.random() * Math.PI * 2;
      return d;
    };
    resize();
    for (let i = 0; i < count; i++) dots.push(spawn({}, true));

    const tick = () => {
      c.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.t += 0.02; d.y -= d.vy; d.x += d.vx + Math.sin(d.t) * 0.12;
        if (d.y < -10) spawn(d, false);
        const tw = 0.5 + Math.sin(d.t * 1.6) * 0.5;
        c.beginPath();
        c.fillStyle = `rgba(233, 210, 154, ${d.a * tw})`;
        c.shadowColor = "rgba(233, 210, 154, 0.8)";
        c.shadowBlur = 6;
        c.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        c.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    const run = () => { cancelAnimationFrame(raf); if (visible && !document.hidden) raf = requestAnimationFrame(tick); };

    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; run(); });
    io.observe(canvas);
    document.addEventListener("visibilitychange", run);
    window.addEventListener("resize", resize);
    run();

    return () => {
      cancelAnimationFrame(raf); io.disconnect();
      document.removeEventListener("visibilitychange", run);
      window.removeEventListener("resize", resize);
    };
  }
})();

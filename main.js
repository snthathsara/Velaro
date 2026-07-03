/* ============================================================
   FLOW MEDIA — main.js
   ============================================================ */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme toggle ---------- */
  const root = document.documentElement;
  $("#theme-toggle").addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("flow-theme", next); } catch (e) {}
  });

  /* ---------- Announcement close ---------- */
  const announce = $("#announce");
  $("#announce-close").addEventListener("click", () => announce.classList.add("is-hidden"));

  /* ---------- Countdown ---------- */
  const pad = (n) => String(n).padStart(2, "0");
  // Fixed ~4d16h window from first visit, persisted so it counts down consistently
  let end;
  try { end = +localStorage.getItem("flow-deadline"); } catch (e) {}
  if (!end || end < Date.now()) {
    end = Date.now() + (4 * 24 * 60 + 16 * 60 + 22) * 60 * 1000;
    try { localStorage.setItem("flow-deadline", end); } catch (e) {}
  }
  const cd = { d: $("#cd-d"), h: $("#cd-h"), m: $("#cd-m"), s: $("#cd-s") };
  function tick() {
    let diff = Math.max(0, end - Date.now());
    const d = Math.floor(diff / 86400000); diff -= d * 86400000;
    const h = Math.floor(diff / 3600000); diff -= h * 3600000;
    const m = Math.floor(diff / 60000); diff -= m * 60000;
    const s = Math.floor(diff / 1000);
    cd.d.textContent = pad(d); cd.h.textContent = pad(h);
    cd.m.textContent = pad(m); cd.s.textContent = pad(s);
  }
  tick(); setInterval(tick, 1000);

  /* ---------- Sticky nav ---------- */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const burger = $("#hamburger"), menu = $("#mobile-menu");
  const toggleMenu = (open) => {
    burger.classList.toggle("is-open", open);
    menu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    menu.setAttribute("aria-hidden", !open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => toggleMenu(!menu.classList.contains("is-open")));
  $$("#mobile-menu a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));
  // Close the menu if the viewport grows past the mobile breakpoint
  matchMedia("(min-width: 821px)").addEventListener("change", (e) => { if (e.matches) toggleMenu(false); });

  /* ---------- Hero word rotator ---------- */
  const words = $$(".rotator__word");
  if (words.length && !reduce) {
    let i = 0;
    setInterval(() => {
      words[i].classList.remove("is-active", "anim-in");
      i = (i + 1) % words.length;
      words[i].classList.add("is-active", "anim-in");
    }, 2600);
  }

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- Animated counters ---------- */
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  function runCount(el) {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || "";
    const prefix = el.dataset.prefix || "";
    const dur = 1500;
    let start;
    function step(ts) {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      const val = Math.round(easeOut(p) * target);
      el.textContent = prefix + val + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        if (reduce) {
          e.target.textContent = (e.target.dataset.prefix || "") + e.target.dataset.count + (e.target.dataset.suffix || "");
        } else runCount(e.target);
        countIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  $$("[data-count]").forEach((el) => countIO.observe(el));

  /* ---------- Video showcase ---------- */
  const videos = [
    { id: "8-21_9lF67E", title: "Gaming hook edit", tag: "Gaming", stats: "High retention · fast cuts", hero: false },
    { id: "aouEXi3jmLw", title: "Client-facing short", tag: "Business", stats: "Clean pacing · captions", hero: false },
    { id: "sZkxqdhtjSg", title: "Talking-head cut", tag: "Talking head", stats: "Hook-first structure", hero: true },
    { id: "b4K5qKoVIeU", title: "Fitness reel", tag: "Fitness", stats: "Punchy transitions", hero: false },
    { id: "s2M6dfN5Pr4", title: "Creator growth edit", tag: "Creator", stats: "Retention-optimised", hero: false },
    { id: "RFRuo_PFjHU", title: "Podcast clip system", tag: "Podcast", stats: "Scroll-stopping clip", hero: true },
    { id: "Iyp11x3ltcU", title: "IRL sequence pacing", tag: "IRL", stats: "Motion + sound design", hero: false },
    { id: "yaQX7gv0hqo", title: "Shorts native pacing", tag: "Shorts", stats: "Vertical-first cut", hero: false, short: true },
    { id: "AxKK1xydbbk", title: "Lifestyle short", tag: "Lifestyle", stats: "Cinematic color", hero: false },
    { id: "ULfyrV3idg0", title: "Story-driven edit", tag: "Story", stats: "Narrative retention", hero: false },
    { id: "Pnokb9btTZ4", title: "High-converting cut", tag: "Business", stats: "Hook · payoff · CTA", hero: true },
  ];

  const grid = $("#showcase-grid");
  grid.innerHTML = videos.map((v) => `
    <button class="vcard" data-id="${v.id}" aria-label="Play portfolio edit">
      <img class="vcard__thumb" loading="lazy" alt="Portfolio edit thumbnail"
           src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg"
           onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${v.id}/mqdefault.jpg'" />
      <span class="vcard__grad"></span>
      <span class="vcard__play" aria-hidden="true">▶</span>
    </button>`).join("");

  /* ---------- Hero deck — random portfolio frames ---------- */
  const deck = $("#deck");
  if (deck) {
    const thumb = (v) => `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
    const pick3 = () => {
      const idx = videos.map((_, i) => i);
      for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
      return idx.slice(0, 3).map((i) => videos[i]);
    };
    deck.innerHTML = `
      <div class="deck__card deck__card--l"><img alt="Portfolio frame" /></div>
      <div class="deck__card deck__card--r"><img alt="Portfolio frame" /></div>
      <div class="deck__card deck__card--c">
        <img alt="Portfolio frame" />
        <span class="deck__overlay"></span>
        <button class="deck__play" aria-label="View portfolio examples">▶</button>
      </div>`;
    const imgs = [...deck.querySelectorAll("img")]; // DOM order: left, right, center
    const setFrames = (instant) => {
      const p = pick3();
      imgs.forEach((im, i) => {
        if (instant) { im.src = thumb(p[i]); im.style.opacity = "1"; }
        else { im.style.opacity = "0"; setTimeout(() => { im.src = thumb(p[i]); im.style.opacity = "1"; }, 260); }
      });
    };
    setFrames(true);
    if (!reduce) setInterval(() => setFrames(false), 4500);
    const goShowcase = (e) => { if (e) e.preventDefault(); $("#showcase").scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); };
    deck.addEventListener("click", goShowcase);
  }

  /* ---------- Modal ---------- */
  const modal = $("#modal"), frame = $("#modal-frame");
  function openModal(id) {
    frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1"
      title="Flow Media edit" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    frame.innerHTML = "";
    document.body.style.overflow = "";
  }
  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".vcard");
    if (card) openModal(card.dataset.id);
  });

  /* ---------- Showcase carousel (manual scroll, arrows, drag) ---------- */
  const prevBtn = $("#car-prev"), nextBtn = $("#car-next");
  if (prevBtn && nextBtn) {
    const step = () => ((grid.querySelector(".vcard") || {}).offsetWidth || 240) + 18;
    const maxLeft = () => grid.scrollWidth - grid.clientWidth;
    // Manual rAF glide (native smooth-scroll fights scroll-snap in some engines)
    const glide = (to) => {
      const target = Math.max(0, Math.min(maxLeft(), to));
      const start = grid.scrollLeft, change = target - start, t0 = performance.now(), dur = 520;
      grid.classList.add("no-snap");
      const ease = (p) => 1 - Math.pow(1 - p, 3);
      const frame = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        grid.scrollLeft = start + change * ease(p);
        if (p < 1) requestAnimationFrame(frame);
        else grid.classList.remove("no-snap");
      };
      requestAnimationFrame(frame);
    };
    prevBtn.addEventListener("click", () => glide(grid.scrollLeft - step() * 2));
    nextBtn.addEventListener("click", () => glide(grid.scrollLeft + step() * 2));
    const updateArrows = () => {
      prevBtn.disabled = grid.scrollLeft < 8;
      nextBtn.disabled = grid.scrollLeft > grid.scrollWidth - grid.clientWidth - 8;
    };
    updateArrows();
    grid.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);

    // Mouse drag-to-scroll (touch uses native scrolling)
    let down = false, startX = 0, startLeft = 0, moved = false;
    grid.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      down = true; moved = false; startX = e.clientX; startLeft = grid.scrollLeft;
      grid.classList.add("is-dragging");
    });
    grid.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      grid.scrollLeft = startLeft - dx;
    });
    const endDrag = () => { down = false; grid.classList.remove("is-dragging"); };
    grid.addEventListener("pointerup", endDrag);
    grid.addEventListener("pointerleave", endDrag);
    grid.addEventListener("pointercancel", endDrag);
    // Swallow the click that ends a drag so it doesn't open the modal
    grid.addEventListener("click", (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  }
  $$("[data-close]", modal).forEach((el) => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal(); });

  /* ---------- Testimonials (minimal) ---------- */
  const quotes = [
    { text: "Nice edits, fast worker, very good service.", name: "LemonGuy_2070", role: "Brand owner", ava: "🍋" },
    { text: "Nice edits, fast worker — would recommend him 100%.", name: "Bullo Producer", role: "Content creator", ava: "🎵" },
    { text: "Perfectly did my edit as I expected, great work. Would recommend to anyone looking for an editor.", name: "Carl J.", role: "Podcaster", ava: "🎙️" },
    { text: "Perfect videos, fast edits, and high retention / sub conversion.", name: "Matty", role: "Content creator", ava: "🚀" },
    { text: "Edited a step-by-step cooking video for me. Great service, fast edits.", name: "Yeesh_24", role: "Creator", ava: "👨‍🍳" },
    { text: "Very good edit — bro cooked, for real.", name: "Pibbs", role: "Creator", ava: "🎮" },
    { text: "Needed captions and effects added — clean, fast, done in under an hour with everything I needed.", name: "LMGX", role: "Content creator", ava: "🎬" },
    { text: "High quality edit finished in about five minutes. Clean, professional and seriously fast.", name: "Morgan", role: "Content creator", ava: "⚡" },
  ];
  const qCard = (q) => `
    <figure class="tquote">
      <div class="quote__stars" aria-label="5 out of 5 stars">★★★★★</div>
      <blockquote class="quote__text">${q.text}</blockquote>
      <figcaption class="quote__who">
        <span class="quote__ava" aria-hidden="true">${q.ava}</span>
        <span>
          <span class="quote__name">${q.name}</span><br/>
          <span class="quote__role">${q.role}</span>
        </span>
      </figcaption>
    </figure>`;
  const row1 = quotes.slice(0, 4), row2 = quotes.slice(4);
  $("#quotes").innerHTML =
    `<div class="tmarquee__row tmarquee__row--a">${[...row1, ...row1].map(qCard).join("")}</div>` +
    `<div class="tmarquee__row tmarquee__row--b">${[...row2, ...row2].map(qCard).join("")}</div>`;

  /* ---------- Accordion ---------- */
  $$(".acc").forEach((acc) => {
    const q = $(".acc__q", acc), a = $(".acc__a", acc);
    q.addEventListener("click", () => {
      const open = acc.classList.contains("is-open");
      $$(".acc").forEach((o) => { o.classList.remove("is-open"); $(".acc__q", o).setAttribute("aria-expanded", "false"); $(".acc__a", o).style.maxHeight = null; });
      if (!open) {
        acc.classList.add("is-open");
        q.setAttribute("aria-expanded", "true");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* ---------- Custom cursor + magnetic buttons ---------- */
  if (!reduce && matchMedia("(pointer:fine)").matches) {
    const dot = $(".cursor-dot"), ring = $(".cursor-ring");
    document.body.classList.add("custom-cursor");
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, seen = false;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      if (!seen) { seen = true; dot.classList.add("is-visible"); ring.classList.add("is-visible"); }
    });
    document.addEventListener("mouseleave", () => { dot.classList.remove("is-visible"); ring.classList.remove("is-visible"); });
    document.addEventListener("mouseenter", () => { if (seen) { dot.classList.add("is-visible"); ring.classList.add("is-visible"); } });
    (function loop() {
      rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    })();
    const hoverSel = 'a, button, [role="button"], .vcard, .deck, .acc__q, .theme-toggle';
    document.addEventListener("mouseover", (e) => { if (e.target.closest(hoverSel)) { ring.classList.add("is-hover"); dot.classList.add("is-hover"); } });
    document.addEventListener("mouseout", (e) => { if (e.target.closest(hoverSel)) { ring.classList.remove("is-hover"); dot.classList.remove("is-hover"); } });

    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const mx = (e.clientX - r.left - r.width / 2) * 0.25;
        const my = (e.clientY - r.top - r.height / 2) * 0.35;
        btn.style.setProperty("--x", mx + "px");
        btn.style.setProperty("--y", my + "px");
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.setProperty("--x", "0px");
        btn.style.setProperty("--y", "0px");
      });
    });
  }
})();

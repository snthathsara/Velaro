/* ============================================================
   FLOW MEDIA — main.js
   Full Dynamic Studio Site: Theme, Logo, Videos, Reviews,
   Availability, Counters, Carousel, Modal, Cursor.
   ============================================================ */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================================================
     1. THEME & COLOR ACCENT
     ============================================================ */
  const root = document.documentElement;
  $("#theme-toggle").addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("flow-theme", next); } catch (e) {}
  });

  function applyAccentColor(hex) {
    if (!hex) return;
    root.style.setProperty("--accent", hex);
    // Calculate glowing shadow & hover tone
    root.style.setProperty("--glow", hex.startsWith("#") ? hex + "55" : "rgba(216,255,31,.35)");
  }

  const savedAccent = localStorage.getItem("flow_accent_color");
  if (savedAccent) applyAccentColor(savedAccent);

  /* ============================================================
     2. BRAND LOGO
     ============================================================ */
  function applyLogo(url) {
    if (!url) return;
    $$(".brand__mark").forEach((img) => { img.src = url; });
    const fav = $("#site-favicon");
    if (fav) fav.href = url;
  }

  const savedLogo = localStorage.getItem("flow_logo_url");
  if (savedLogo) applyLogo(savedLogo);

  /* ============================================================
     3. AVAILABILITY STATUS
     ============================================================ */
  const availPill = $("#availability-pill");
  const availText = $("#availability-text");

  function applyStatus(data) {
    if (!availPill || !availText || !data) return;
    const state = data.state || "available";
    const text = data.text || (state === "busy" ? "Completely Booked" : state === "limited" ? "1 Spot Remaining" : "Available for new projects");
    availPill.classList.remove("is-available", "is-limited", "is-busy");
    availPill.classList.add(`is-${state}`);
    availText.textContent = text;
  }

  async function loadCMSData() {
    let cached = null;
    try {
      const raw = localStorage.getItem("flow_status");
      if (raw) cached = JSON.parse(raw);
    } catch (e) {}
    if (cached) applyStatus(cached);

    let cloudUrl = null;
    try { cloudUrl = localStorage.getItem("flow_cloud_url") || window.FLOW_CLOUD_URL; } catch (e) {}
    if (cloudUrl) {
      try {
        const res = await fetch(cloudUrl);
        if (res.ok) {
          const remote = await res.json();
          if (remote) {
            if (remote.status) {
              applyStatus(remote.status);
              localStorage.setItem("flow_status", JSON.stringify(remote.status));
            }
            if (remote.accent) {
              applyAccentColor(remote.accent);
              localStorage.setItem("flow_accent_color", remote.accent);
            }
            if (remote.logo) {
              applyLogo(remote.logo);
              localStorage.setItem("flow_logo_url", remote.logo);
            }
            if (remote.videos && Array.isArray(remote.videos)) {
              renderShowcase(remote.videos);
              renderHeroDeck(remote.videos);
              localStorage.setItem("flow_videos_data", JSON.stringify(remote.videos));
            }
            if (remote.reviews && Array.isArray(remote.reviews)) {
              renderTestimonials(remote.reviews);
              localStorage.setItem("flow_testimonials_data", JSON.stringify(remote.reviews));
            }
          }
        }
      } catch (e) {
        console.warn("Remote CMS sync check skipped:", e);
      }
    }
  }
  loadCMSData();

  /* ============================================================
     4. ANNOUNCEMENT & COUNTDOWN
     ============================================================ */
  const announce = $("#announce");
  if (announce) {
    $("#announce-close").addEventListener("click", () => announce.classList.add("is-hidden"));
  }

  const pad = (n) => String(n).padStart(2, "0");
  let end;
  try { end = +localStorage.getItem("flow-deadline"); } catch (e) {}
  if (!end || end < Date.now()) {
    end = Date.now() + (4 * 24 * 60 + 16 * 60 + 22) * 60 * 1000;
    try { localStorage.setItem("flow-deadline", end); } catch (e) {}
  }
  const cd = { d: $("#cd-d"), h: $("#cd-h"), m: $("#cd-m"), s: $("#cd-s") };
  function tick() {
    if (!cd.d) return;
    let diff = Math.max(0, end - Date.now());
    const d = Math.floor(diff / 86400000); diff -= d * 86400000;
    const h = Math.floor(diff / 3600000); diff -= h * 3600000;
    const m = Math.floor(diff / 60000); diff -= m * 60000;
    const s = Math.floor(diff / 1000);
    cd.d.textContent = pad(d); cd.h.textContent = pad(h);
    cd.m.textContent = pad(m); cd.s.textContent = pad(s);
  }
  tick(); setInterval(tick, 1000);

  /* ============================================================
     5. STICKY NAV & MOBILE MENU
     ============================================================ */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

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
  matchMedia("(min-width: 821px)").addEventListener("change", (e) => { if (e.matches) toggleMenu(false); });

  /* ============================================================
     6. HERO ROTATOR & SCROLL REVEALS
     ============================================================ */
  const words = $$(".rotator__word");
  if (words.length && !reduce) {
    let i = 0;
    setInterval(() => {
      words[i].classList.remove("is-active", "anim-in");
      i = (i + 1) % words.length;
      words[i].classList.add("is-active", "anim-in");
    }, 2600);
  }

  $$(".reveal-stagger").forEach((c) => [...c.children].forEach((ch, i) => ch.style.setProperty("--i", i)));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  $$(".reveal, .reveal-stagger").forEach((el) => io.observe(el));

  /* ============================================================
     7. ANIMATED COUNTERS
     ============================================================ */
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

  /* ============================================================
     8. PORTFOLIO SHOWCASE & HERO DECK (DYNAMIC)
     ============================================================ */
  const DEFAULT_VIDEOS = [
    { id: "8-21_9lF67E", title: "Gaming hook edit", tag: "Gaming" },
    { id: "aouEXi3jmLw", title: "Client-facing short", tag: "Business" },
    { id: "sZkxqdhtjSg", title: "Talking-head cut", tag: "Talking head" },
    { id: "b4K5qKoVIeU", title: "Fitness reel", tag: "Fitness" },
    { id: "s2M6dfN5Pr4", title: "Creator growth edit", tag: "Creator" },
    { id: "RFRuo_PFjHU", title: "Podcast clip system", tag: "Podcast" },
    { id: "Iyp11x3ltcU", title: "IRL sequence pacing", tag: "IRL" },
    { id: "yaQX7gv0hqo", title: "Shorts native pacing", tag: "Shorts" },
    { id: "AxKK1xydbbk", title: "Lifestyle short", tag: "Lifestyle" },
    { id: "ULfyrV3idg0", title: "Story-driven edit", tag: "Story" },
    { id: "Pnokb9btTZ4", title: "High-converting cut", tag: "Business" },
  ];

  let currentVideos = DEFAULT_VIDEOS;
  try {
    const rawV = localStorage.getItem("flow_videos_data");
    if (rawV) {
      const parsed = JSON.parse(rawV);
      if (Array.isArray(parsed) && parsed.length) currentVideos = parsed;
    }
  } catch (e) {}

  const grid = $("#showcase-grid");
  const deck = $("#deck");

  function renderShowcase(vids) {
    if (!grid) return;
    grid.innerHTML = vids.map((v) => `
      <button class="vcard" data-id="${v.id}" aria-label="Play portfolio edit: ${v.title || ''}">
        <img class="vcard__thumb" loading="lazy" alt="${v.title || 'Portfolio edit thumbnail'}"
             src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg"
             onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${v.id}/mqdefault.jpg'" />
        <span class="vcard__grad"></span>
        <span class="vcard__play" aria-hidden="true">▶</span>
      </button>`).join("");
  }

  let deckInterval = null;
  function renderHeroDeck(vids) {
    if (!deck || !vids.length) return;
    if (deckInterval) clearInterval(deckInterval);

    const thumb = (v) => `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
    const pick3 = () => {
      const copy = [...vids];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return [copy[0] || vids[0], copy[1] || vids[0], copy[2] || vids[0]];
    };

    deck.innerHTML = `
      <div class="deck__card deck__card--l"><img alt="Portfolio frame" /></div>
      <div class="deck__card deck__card--r"><img alt="Portfolio frame" /></div>
      <div class="deck__card deck__card--c">
        <img alt="Portfolio frame" />
        <span class="deck__overlay"></span>
        <button class="deck__play" aria-label="View portfolio examples">▶</button>
      </div>`;

    const imgs = [...deck.querySelectorAll("img")];
    const setFrames = (instant) => {
      const p = pick3();
      imgs.forEach((im, i) => {
        if (!p[i]) return;
        if (instant) { im.src = thumb(p[i]); im.style.opacity = "1"; }
        else { im.style.opacity = "0"; setTimeout(() => { im.src = thumb(p[i]); im.style.opacity = "1"; }, 260); }
      });
    };

    setFrames(true);
    if (!reduce) deckInterval = setInterval(() => setFrames(false), 4500);
    deck.onclick = (e) => {
      if (e) e.preventDefault();
      $("#showcase").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    };
  }

  renderShowcase(currentVideos);
  renderHeroDeck(currentVideos);

  /* ---------- Video Modal ---------- */
  const modal = $("#modal"), frame = $("#modal-frame");
  function openModal(id) {
    const src = `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`;
    frame.innerHTML =
      `<div class="modal__spinner" aria-hidden="true"></div>
       <iframe src="${src}" title="Flow Media edit"
         allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
         referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
       <a class="modal__yt" href="https://youtu.be/${id}" target="_blank" rel="noopener">Watch on YouTube ↗</a>`;
    const iframe = frame.querySelector("iframe");
    iframe.addEventListener("load", () => frame.classList.add("is-loaded"));
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    frame.innerHTML = "";
    frame.classList.remove("is-loaded");
    document.body.style.overflow = "";
  }
  if (grid) {
    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".vcard");
      if (card) openModal(card.dataset.id);
    });
  }

  /* ---------- Showcase Carousel Controls ---------- */
  const prevBtn = $("#car-prev"), nextBtn = $("#car-next");
  if (prevBtn && nextBtn && grid) {
    const step = () => ((grid.querySelector(".vcard") || {}).offsetWidth || 240) + 18;
    const maxLeft = () => grid.scrollWidth - grid.clientWidth;
    const glide = (to) => {
      const target = Math.max(0, Math.min(maxLeft(), to));
      const start = grid.scrollLeft, change = target - start, t0 = performance.now(), dur = 520;
      grid.classList.add("no-snap");
      const ease = (p) => 1 - Math.pow(1 - p, 3);
      const frameGlide = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        grid.scrollLeft = start + change * ease(p);
        if (p < 1) requestAnimationFrame(frameGlide);
        else grid.classList.remove("no-snap");
      };
      requestAnimationFrame(frameGlide);
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
  }
  $$("[data-close]", modal).forEach((el) => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal(); });

  /* ============================================================
     9. TESTIMONIALS (DYNAMIC)
     ============================================================ */
  const DEFAULT_QUOTES = [
    { text: "Nice edits, fast worker, very good service.", name: "LemonGuy_2070", role: "Brand owner", ava: "🍋", stars: 5 },
    { text: "Nice edits, fast worker — would recommend him 100%.", name: "Bullo Producer", role: "Content creator", ava: "🎵", stars: 5 },
    { text: "Perfectly did my edit as I expected, great work. Would recommend to anyone looking for an editor.", name: "Carl J.", role: "Podcaster", ava: "🎙️", stars: 5 },
    { text: "Perfect videos, fast edits, and high retention / sub conversion.", name: "Matty", role: "Content creator", ava: "🚀", stars: 5 },
    { text: "Edited a step-by-step cooking video for me. Great service, fast edits.", name: "Yeesh_24", role: "Creator", ava: "👨‍🍳", stars: 5 },
    { text: "Very good edit — bro cooked, for real.", name: "Pibbs", role: "Creator", ava: "🎮", stars: 5 },
    { text: "Needed captions and effects added — clean, fast, done in under an hour with everything I needed.", name: "LMGX", role: "Content creator", ava: "🎬", stars: 5 },
    { text: "High quality edit finished in about five minutes. Clean, professional and seriously fast.", name: "Morgan", role: "Content creator", ava: "⚡", stars: 5 },
  ];

  let currentQuotes = DEFAULT_QUOTES;
  try {
    const rawQ = localStorage.getItem("flow_testimonials_data");
    if (rawQ) {
      const parsed = JSON.parse(rawQ);
      if (Array.isArray(parsed) && parsed.length) currentQuotes = parsed;
    }
  } catch (e) {}

  function renderTestimonials(quotes) {
    const cont = $("#quotes");
    if (!cont || !quotes.length) return;

    const qCard = (q) => {
      const isImg = q.ava && (q.ava.startsWith("data:") || q.ava.startsWith("http") || q.ava.startsWith("/"));
      const avaHtml = isImg ? `<img src="${q.ava}" alt="" class="quote__ava" />` : `<span class="quote__ava" aria-hidden="true">${q.ava || "💬"}</span>`;
      const starsCount = q.stars || 5;
      const starsStr = "★".repeat(starsCount) + "☆".repeat(5 - starsCount);

      return `
        <figure class="tquote">
          <div class="quote__stars" aria-label="${starsCount} out of 5 stars">${starsStr}</div>
          <blockquote class="quote__text">${q.text}</blockquote>
          <figcaption class="quote__who">
            ${avaHtml}
            <span>
              <span class="quote__name">${q.name}</span><br/>
              <span class="quote__role">${q.role || "Creator"}</span>
            </span>
          </figcaption>
        </figure>`;
    };

    const mid = Math.ceil(quotes.length / 2);
    const row1 = quotes.slice(0, mid);
    const row2 = quotes.slice(mid);
    const r1List = row1.length < 4 ? [...row1, ...row1, ...row1] : [...row1, ...row1];
    const r2List = (row2.length ? row2 : row1).length < 4 ? [...(row2.length ? row2 : row1), ...(row2.length ? row2 : row1), ...(row2.length ? row2 : row1)] : [...(row2.length ? row2 : row1), ...(row2.length ? row2 : row1)];

    cont.innerHTML =
      `<div class="tmarquee__row tmarquee__row--a">${r1List.map(qCard).join("")}</div>` +
      `<div class="tmarquee__row tmarquee__row--b">${r2List.map(qCard).join("")}</div>`;
  }

  renderTestimonials(currentQuotes);

  /* ============================================================
     10. ACCORDION
     ============================================================ */
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

  /* ============================================================
     11. CUSTOM CURSOR & MAGNETIC BUTTONS
     ============================================================ */
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
        const bmx = (e.clientX - r.left - r.width / 2) * 0.25;
        const bmy = (e.clientY - r.top - r.height / 2) * 0.35;
        btn.style.setProperty("--x", bmx + "px");
        btn.style.setProperty("--y", bmy + "px");
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.setProperty("--x", "0px");
        btn.style.setProperty("--y", "0px");
      });
    });
  }

  /* ============================================================
     12. CROSS-TAB LIVE SYNCHRONIZATION
     ============================================================ */
  window.addEventListener("storage", (e) => {
    if (e.key === "flow_status" && e.newValue) {
      try { applyStatus(JSON.parse(e.newValue)); } catch (err) {}
    } else if (e.key === "flow_accent_color") {
      applyAccentColor(e.newValue);
    } else if (e.key === "flow_logo_url") {
      applyLogo(e.newValue || "logo.png");
    } else if (e.key === "flow_videos_data") {
      try {
        const v = JSON.parse(e.newValue);
        if (Array.isArray(v)) {
          renderShowcase(v);
          renderHeroDeck(v);
        }
      } catch (err) {}
    } else if (e.key === "flow_testimonials_data") {
      try {
        const q = JSON.parse(e.newValue);
        if (Array.isArray(q)) renderTestimonials(q);
      } catch (err) {}
    }
  });
})();

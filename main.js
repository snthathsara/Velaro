/* ============================================================
   PRO PANDA — main.js
   Minimal, High-Performance Studio Engine (Short & Long Form)
   ============================================================ */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  /* Clear stale video cache */
  try {
    localStorage.removeItem("flow_videos_data");
    localStorage.removeItem("propanda_videos_data");
  } catch (e) {}

  /* ============================================================
     1. THEME & COLOR ACCENT
     ============================================================ */
  const themeToggle = $("#theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("propanda-theme", next);
        localStorage.setItem("flow-theme", next);
      } catch (e) {}
    });
  }

  function applyAccentColor(hex) {
    if (!hex) return;
    root.style.setProperty("--accent", hex);
  }

  const savedAccent = localStorage.getItem("propanda_accent_color") || localStorage.getItem("flow_accent_color");
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

  const savedLogo = localStorage.getItem("propanda_logo_url") || localStorage.getItem("flow_logo_url");
  if (savedLogo) applyLogo(savedLogo);

  /* ============================================================
     3. AVAILABILITY STATUS
     ============================================================ */
  const availPill = $("#availability-pill");
  const availText = $("#availability-text");

  function applyStatus(data) {
    if (!availPill || !availText || !data) return;
    const state = data.state || "available";
    const text = data.text || (state === "busy" ? "Completely Booked" : state === "limited" ? "2 Slots Open" : "Available");
    availText.textContent = text;

    const dotColor = data.dotColor || (state === "busy" ? "#ef4444" : state === "limited" ? "#f59e0b" : "#10b981");
    document.documentElement.style.setProperty("--status-dot-color", dotColor);
  }

  try {
    const raw = localStorage.getItem("propanda_status") || localStorage.getItem("flow_status");
    if (raw) applyStatus(JSON.parse(raw));
  } catch (e) {}

  /* ============================================================
     4. COUNTDOWN TIMER
     ============================================================ */
  const pad = (n) => String(n).padStart(2, "0");
  let end;
  try { end = +(localStorage.getItem("propanda-deadline") || localStorage.getItem("flow-deadline")); } catch (e) {}
  if (!end || end < Date.now()) {
    end = Date.now() + (4 * 24 * 60 + 16 * 60 + 22) * 60 * 1000;
    try { localStorage.setItem("propanda-deadline", end); } catch (e) {}
  }
  const cd = { d: $("#cd-d"), h: $("#cd-h"), m: $("#cd-m"), s: $("#cd-s") };
  function tick() {
    if (!cd.d) return;
    let diff = Math.max(0, end - Date.now());
    const d = Math.floor(diff / 86400000); diff -= d * 86400000;
    const h = Math.floor(diff / 3600000); diff -= h * 3600000;
    const m = Math.floor(diff / 60000); diff -= m * 60000;
    const s = Math.floor(diff / 1000);
    cd.d.textContent = pad(d);
    cd.h.textContent = pad(h);
    cd.m.textContent = pad(m);
    cd.s.textContent = pad(s);
  }
  tick();
  setInterval(tick, 1000);

  /* ============================================================
     5. FLOATING CAPSULE NAVBAR & SCROLL SPY
     ============================================================ */
  const navCapsule = $("#nav");
  const navLinks = $$(".nav-link-item");
  const searchBtn = $("#nav-search-btn");

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      const showcase = $("#showcase");
      if (showcase) showcase.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Portfolio Dropdown Click & Hover Management
  const portfolioWrapper = $(".nav-dropdown-wrapper");
  const portfolioBtn = $("#nav-portfolio-btn");
  let dropdownTimer = null;

  if (portfolioWrapper && portfolioBtn) {
    portfolioBtn.addEventListener("click", (e) => {
      if (window.innerWidth <= 860) return;
      portfolioWrapper.classList.toggle("is-open");
    });

    portfolioWrapper.addEventListener("mouseenter", () => {
      if (dropdownTimer) clearTimeout(dropdownTimer);
      portfolioWrapper.classList.add("is-open");
    });

    portfolioWrapper.addEventListener("mouseleave", () => {
      dropdownTimer = setTimeout(() => {
        portfolioWrapper.classList.remove("is-open");
      }, 250);
    });

    document.addEventListener("click", (e) => {
      if (!portfolioWrapper.contains(e.target)) {
        portfolioWrapper.classList.remove("is-open");
      }
    });
  }

  // Scroll active spy
  const sections = ["home", "roster", "showcase", "process", "pricing", "faq"].map(id => $(`#${id}`)).filter(Boolean);
  
  function updateNavSpy() {
    const scrollPos = window.scrollY + 160;
    let currentId = "home";
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos) {
        currentId = sec.id;
      }
    });
    navLinks.forEach(link => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        const id = href.replace("#", "");
        link.classList.toggle("is-active", id === currentId);
      }
    });

    if (navCapsule) {
      if (window.scrollY > 40) {
        navCapsule.style.boxShadow = "0 16px 40px rgba(0, 0, 0, 0.6)";
        navCapsule.style.transform = "scale(0.99)";
      } else {
        navCapsule.style.boxShadow = "";
        navCapsule.style.transform = "";
      }
    }
  }

  window.addEventListener("scroll", updateNavSpy, { passive: true });
  updateNavSpy();

  /* ============================================================
     6. MOBILE MENU
     ============================================================ */
  const burger = $("#hamburger"), menu = $("#mobile-menu");
  if (burger && menu) {
    const toggleMenu = (open) => {
      burger.classList.toggle("is-open", open);
      menu.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open);
      menu.setAttribute("aria-hidden", !open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", () => toggleMenu(!menu.classList.contains("is-open")));
    $$("#mobile-menu a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));
    matchMedia("(min-width: 861px)").addEventListener("change", (e) => { if (e.matches) toggleMenu(false); });
  }

  /* ============================================================
     7. HERO ROTATOR & SCROLL REVEALS
     ============================================================ */
  const rotatorWords = ["high-retention", "scroll-stopping", "algorithm-ready", "10M+ view"];
  const rotatorEl = $("#rotator-text");
  if (rotatorEl && !reduce) {
    let wordIdx = 0;
    setInterval(() => {
      rotatorEl.classList.add("is-animating");
      setTimeout(() => {
        wordIdx = (wordIdx + 1) % rotatorWords.length;
        rotatorEl.textContent = rotatorWords[wordIdx];
        rotatorEl.classList.remove("is-animating");
      }, 240);
    }, 2800);
  }

  $$(".reveal-stagger").forEach((c) => [...c.children].forEach((ch, i) => ch.style.setProperty("--i", i)));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal, .reveal-stagger").forEach((el) => io.observe(el));

  /* ============================================================
     8. 3D CARD TILT & DYNAMIC GLASS SPECULAR GLARE
     ============================================================ */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".tilt-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotX = ((y - cy) / cy) * -5;
        const rotY = ((x - cx) / cx) * 5;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
        card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ============================================================
     9. ANIMATED COUNTERS
     ============================================================ */
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  function runCount(el) {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || "";
    const prefix = el.dataset.prefix || "";
    const dur = 1400;
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
     10. PORTFOLIO SHOWCASE: SHORT FORM & LONG FORM DATA
     ============================================================ */
  const SHORT_FORM_VIDEOS = [
    { id: "short-1", title: "Valorant & FPS Elimination Hook Cut", tag: "Gaming", duration: "0:42", pps: "4K 60FPS", style: "Esports Hyper-Pacing", format: "short" },
    { id: "short-2", title: "Creator Talking Head Retention System", tag: "Talking head", duration: "0:56", pps: "4K 60FPS", style: "Kinetic Subtitles & B-Roll", format: "short" },
    { id: "short-3", title: "Roblox Sandbox Comedy & Sound FX Stack", tag: "Gaming", duration: "0:48", pps: "4K 60FPS", style: "Meme SFX & Zoom Tracking", format: "short" },
    { id: "short-4", title: "Viral Podcast Cutdown & Audio Mastering", tag: "Podcast", duration: "0:59", pps: "4K 60FPS", style: "Multi-Track Audio Ducking", format: "short" },
    { id: "short-5", title: "High-Retention Creator Short Format", tag: "Creator", duration: "0:35", pps: "4K 60FPS", style: "Pattern Interrupt Hooks", format: "short" },
    { id: "short-6", title: "Fortnite Clutch & Elimination Sequence", tag: "Gaming", duration: "0:44", pps: "4K 60FPS", style: "Impact Audio & 3D Zooms", format: "short" },
    { id: "short-7", title: "IRL Vlog Travel Opening Sequence", tag: "Creator", duration: "0:50", pps: "4K 60FPS", style: "Speed Ramp & Color Grade", format: "short" },
    { id: "short-8", title: "Founder Interview Narrative Edit", tag: "Talking head", duration: "0:58", pps: "4K 60FPS", style: "Clean Typography & Rhythm", format: "short" }
  ];

  const LONG_FORM_VIDEOS = [
    { id: "long-1", title: "The Rise of Competitive Esports: Mini-Doc", tag: "Documentary", duration: "14:20", pps: "4K 60FPS", style: "Narrative Arc & Cinematic Scoring", format: "long" },
    { id: "long-2", title: "100-Hour Survival Challenge — YouTube Full Episode", tag: "YouTube Video", duration: "18:45", pps: "4K 60FPS", style: "Multi-Cam Sync & Visual Pacing", format: "long" },
    { id: "long-3", title: "Pro Tournament Finals: Comprehensive Stream Cut", tag: "Stream Highlight", duration: "11:10", pps: "4K 60FPS", style: "Live Reaction Timing & Audio Balance", format: "long" },
    { id: "long-4", title: "Deep Dive Creator Interview & Masterclass", tag: "Podcast", duration: "32:15", pps: "4K 60FPS", style: "Chaptering, Lower Thirds & Dynamic B-Roll", format: "long" },
    { id: "long-5", title: "Cinematic Gaming Montage & Narrative Storyline", tag: "Cinematic Gaming", duration: "08:30", pps: "4K 60FPS", style: "OLED Color Grading & Sound FX", format: "long" },
    { id: "long-6", title: "Behind the Scenes Creator Journey Episode", tag: "YouTube Video", duration: "16:50", pps: "4K 60FPS", style: "Story Pacing & Motion Graphics", format: "long" }
  ];

  const SHORT_FILTERS = [
    { label: "All Short Form", value: "all" },
    { label: "Gaming", value: "Gaming" },
    { label: "Talking Head", value: "Talking head" },
    { label: "Creator Shorts", value: "Creator" },
    { label: "Podcasts", value: "Podcast" }
  ];

  const LONG_FILTERS = [
    { label: "All Long Form", value: "all" },
    { label: "YouTube Videos", value: "YouTube Video" },
    { label: "Documentaries", value: "Documentary" },
    { label: "Stream Highlights", value: "Stream Highlight" },
    { label: "Podcasts", value: "Podcast" },
    { label: "Cinematic Gaming", value: "Cinematic Gaming" }
  ];

  let currentFormat = "short"; // 'short' | 'long'
  let currentFilter = "all";

  const grid = $("#showcase-grid");
  const deck = $("#deck");
  const filterPillsContainer = $("#showcase-filters");
  const formatShortBtn = $("#format-short-btn");
  const formatLongBtn = $("#format-long-btn");

  function renderFilterPills() {
    if (!filterPillsContainer) return;
    const filters = currentFormat === "short" ? SHORT_FILTERS : LONG_FILTERS;
    filterPillsContainer.innerHTML = filters.map(f => `
      <button class="filter-pill ${f.value === currentFilter ? 'is-active' : ''}" data-filter="${f.value}">
        ${f.label}
      </button>
    `).join("");
  }

  function renderShowcase() {
    if (!grid) return;
    const vids = currentFormat === "short" ? SHORT_FORM_VIDEOS : LONG_FORM_VIDEOS;
    const isLong = currentFormat === "long";
    const filtered = currentFilter === "all" 
      ? vids 
      : vids.filter(v => v.tag.toLowerCase().includes(currentFilter.toLowerCase()) || currentFilter.toLowerCase().includes(v.tag.toLowerCase()));
    
    grid.innerHTML = filtered.map((v) => `
      <div class="vcard ${isLong ? 'vcard--long' : ''} tilt-card" 
           data-sample-id="${v.id}" 
           data-title="${v.title}" 
           data-tag="${v.tag}" 
           data-dur="${v.duration}" 
           data-style="${v.style}" 
           data-format="${v.format}"
           aria-label="Sample cut: ${v.title}">
        <div class="vcard__art">
          <div class="vcard__art-icon">${isLong ? '🎬' : '▶'}</div>
          <span class="vcard__art-meta">${v.pps} · ${v.duration}</span>
        </div>
        <span class="vcard__badge">${v.tag}</span>
        <span class="vcard__duration">${v.duration}</span>
        <span class="vcard__grad"></span>
        <div class="vcard__info">
          <div class="vcard__title">${v.title}</div>
          <div class="vcard__tag">${v.style}</div>
        </div>
        <span class="vcard__play" aria-hidden="true">▶</span>
      </div>`).join("");
  }

  function setFormat(fmt, filter = "all") {
    currentFormat = fmt;
    currentFilter = filter;

    if (formatShortBtn && formatLongBtn) {
      formatShortBtn.classList.toggle("is-active", fmt === "short");
      formatLongBtn.classList.toggle("is-active", fmt === "long");
    }

    renderFilterPills();
    renderShowcase();
  }

  if (formatShortBtn) formatShortBtn.addEventListener("click", () => setFormat("short"));
  if (formatLongBtn) formatLongBtn.addEventListener("click", () => setFormat("long"));

  if (filterPillsContainer) {
    filterPillsContainer.addEventListener("click", (e) => {
      const pill = e.target.closest(".filter-pill");
      if (!pill) return;
      currentFilter = pill.dataset.filter;
      $$(".filter-pill", filterPillsContainer).forEach(p => p.classList.remove("is-active"));
      pill.classList.add("is-active");
      renderShowcase();
    });
  }

  // Navbar format dropdown handlers
  $$(".js-filter-format").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const fmt = btn.dataset.format;
      if (fmt) {
        setFormat(fmt);
        if (portfolioWrapper) portfolioWrapper.classList.remove("is-open");
        const showcase = $("#showcase");
        if (showcase) {
          showcase.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });

  function renderHeroDeck() {
    if (!deck) return;
    deck.innerHTML = `
      <div class="deck__card deck__card--l">
        <div class="vcard__art" style="background:#111116;">
          <span class="mono" style="font-size:12px;color:#71717a;">SHORT FORM CUT</span>
        </div>
      </div>
      <div class="deck__card deck__card--r">
        <div class="vcard__art" style="background:#111116;">
          <span class="mono" style="font-size:12px;color:#71717a;">LONG FORM CUT</span>
        </div>
      </div>
      <div class="deck__card deck__card--c">
        <div class="vcard__art" style="background:linear-gradient(145deg, #181820 0%, #0d0d12 100%);">
          <div class="vcard__art-icon">🐼</div>
          <span class="mono" style="font-size:13px;color:#fff;font-weight:700;">PRO PANDA MASTER CUT</span>
          <span style="font-size:11.5px;color:var(--accent);font-weight:600;">Long &amp; Short Form 4K 60FPS</span>
        </div>
        <span class="deck__overlay"></span>
        <div class="deck__play" aria-hidden="true">▶</div>
      </div>`;

    deck.onclick = (e) => {
      if (e) e.preventDefault();
      $("#showcase").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    };
  }

  setFormat("short");
  renderHeroDeck();

  /* ---------- Video Modal Preview ---------- */
  const modal = $("#modal"), frame = $("#modal-frame");
  function openModal(data) {
    const isLong = data.format === "long";
    frame.innerHTML = `
      <div class="modal__preview-card">
        <div class="modal__preview-head">
          <span class="modal__preview-tag">${isLong ? 'LONG FORM 16:9' : 'SHORT FORM 9:16'} · ${data.tag || 'VIDEO'}</span>
          <h4 class="modal__preview-title">${data.title || 'High-Retention Master Cut'}</h4>
        </div>
        
        <div class="modal__preview-visual">
          ${isLong ? '🎬' : '▶'}
        </div>

        <div class="modal__preview-specs">
          <div><span>Cut Pacing:</span> <b>${data.style || 'Hyper-Retention Pacing'}</b></div>
          <div><span>Duration:</span> <b>${data.dur || '10:00'}</b></div>
          <div><span>Aspect Ratio:</span> <b>${isLong ? '16:9 Horizontal' : '9:16 Vertical'}</b></div>
          <div><span>Export Quality:</span> <b>4K 60FPS ProRes / Master</b></div>
          <div><span>Audio Stack:</span> <b>Multi-Track SFX + Mastered Vocals</b></div>
        </div>

        <div style="margin-top: 18px;">
          <button type="button" class="btn btn--primary btn--block" data-close>Close Preview</button>
        </div>
      </div>
    `;
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

  if (grid) {
    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".vcard");
      if (card) {
        openModal({
          title: card.dataset.title,
          tag: card.dataset.tag,
          dur: card.dataset.dur,
          style: card.dataset.style,
          format: card.dataset.format
        });
      }
    });
  }

  const prevBtn = $("#car-prev"), nextBtn = $("#car-next");
  if (prevBtn && nextBtn && grid) {
    const step = () => ((grid.querySelector(".vcard") || {}).offsetWidth || 280) + 16;
    prevBtn.addEventListener("click", () => grid.scrollBy({ left: -step() * 2, behavior: "smooth" }));
    nextBtn.addEventListener("click", () => grid.scrollBy({ left: step() * 2, behavior: "smooth" }));
  }

  $$("[data-close]", modal).forEach((el) => el.addEventListener("click", closeModal));
  modal.addEventListener("click", (e) => {
    if (e.target.hasAttribute("data-close")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  /* ============================================================
     11. TESTIMONIALS MARQUEE
     ============================================================ */
  const DEFAULT_QUOTES = [
    { text: "Pro Panda turned our gameplay clips into pure algorithm fuel. Retention skyrocketed from 35% to 84%.", name: "Windpress", role: "2.61M YouTube Creator", ava: "assets/creators/windpress.jpg", stars: 5 },
    { text: "Fast turnaround, great sound design, and super reliable. My shorts have never performed better.", name: "Twezy", role: "739K YouTube Creator", ava: "assets/creators/twezy.jpg", stars: 5 },
    { text: "Clean cuts, hilarious pacing, exactly what our audience loves.", name: "Vixerz", role: "52K Roblox Creator", ava: "assets/creators/vixerz.jpg", stars: 5 },
    { text: "High quality edits finished rapidly. Clean subtitles, great zoom keyframing, 100% recommended.", name: "baldcutG", role: "25K YouTube Creator", ava: "assets/creators/baldcutg.jpg", stars: 5 },
    { text: "Great communication, perfect aesthetic consistency, and flawless audio mixing on every video.", name: "Gena Mikaela", role: "Creator & Vlogger", ava: "assets/creators/genamikaela.jpg", stars: 5 },
    { text: "Top-tier Roblox cuts and trolling hooks. Turned raw stream highlights into 1M+ view viral shorts.", name: "BraylienBlox", role: "Roblox Gaming Creator", ava: "assets/creators/braylienblox.jpg", stars: 5 }
  ];

  let currentQuotes = DEFAULT_QUOTES;
  try {
    const rawQ = localStorage.getItem("propanda_testimonials_data") || localStorage.getItem("flow_testimonials_data");
    if (rawQ) {
      const parsed = JSON.parse(rawQ);
      if (Array.isArray(parsed) && parsed.length) currentQuotes = parsed;
    }
  } catch (e) {}

  function renderTestimonials(quotes) {
    const cont = $("#quotes");
    if (!cont || !quotes.length) return;

    const qCard = (q) => {
      const isImg = q.ava && (q.ava.startsWith("assets/") || q.ava.startsWith("data:") || q.ava.startsWith("http") || q.ava.startsWith("/"));
      const avaHtml = isImg 
        ? `<img src="${q.ava}" alt="${q.name}" class="quote__ava" onerror="this.src='logo.png'" />` 
        : `<span class="quote__ava" style="display:grid;place-items:center;font-size:15px;">💬</span>`;
      const starsCount = q.stars || 5;
      const starsStr = "★".repeat(starsCount) + "☆".repeat(5 - starsCount);

      return `
        <figure class="tquote tilt-card">
          <div class="quote__stars" aria-label="${starsCount} out of 5 stars">${starsStr}</div>
          <blockquote class="quote__text">"${q.text}"</blockquote>
          <figcaption class="quote__who">
            ${avaHtml}
            <div>
              <div class="quote__name">${q.name}</div>
              <div class="quote__role">${q.role || "Creator"}</div>
            </div>
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
     12. PRICING TOGGLE
     ============================================================ */
  const tabMonthly = $("#tab-monthly");
  const tabPerVideo = $("#tab-pervideo");
  const pricingContainer = $("#pricing-container");

  const MONTHLY_PACKAGES = `
    <!-- Tier 1: Growth -->
    <article class="price-card tilt-card">
      <div>
        <div class="price-card__title">Growth Pack</div>
        <div class="price-card__sub">15 Videos · 1 Video Every 2 Days</div>
        <div class="price-card__price-row">
          <div class="price-card__amount"><span>$</span>170</div>
          <span class="price-card__old">$213</span>
          <span class="price-card__save">20% OFF</span>
        </div>
        <ul class="price-card__features">
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Hook pacing &amp; dead air elimination</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Kinetic animated captions</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Multi-layer sound design</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> 48-Hour delivery guarantee</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> 2 Rounds of revisions</li>
        </ul>
      </div>
      <button type="button" class="btn btn--dark btn--block">Select Package</button>
    </article>

    <!-- Tier 2: Creator (Featured) -->
    <article class="price-card price-card--featured tilt-card">
      <span class="price-card__badge">Most Popular</span>
      <div>
        <div class="price-card__title">Creator Beast</div>
        <div class="price-card__sub">30 Videos · Daily Publishing Rhythm</div>
        <div class="price-card__price-row">
          <div class="price-card__amount"><span>$</span>300</div>
          <span class="price-card__old">$375</span>
          <span class="price-card__save">20% OFF</span>
        </div>
        <ul class="price-card__features">
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Everything in Growth Pack</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> <b>1 FREE Video Included</b></li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Unlimited revisions</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Priority queue &amp; 24h delivery</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Custom 3D zooms &amp; graphics</li>
        </ul>
      </div>
      <button type="button" class="btn btn--primary btn--block">Select Package</button>
    </article>

    <!-- Tier 3: Apex -->
    <article class="price-card tilt-card">
      <div>
        <div class="price-card__title">Apex Syndicate</div>
        <div class="price-card__sub">45–60 Videos · Scaling Channel System</div>
        <div class="price-card__price-row">
          <div class="price-card__amount"><span>$</span>400<span style="font-size: 20px;">–650</span></div>
          <span class="price-card__old">$500–810</span>
          <span class="price-card__save">20% OFF</span>
        </div>
        <ul class="price-card__features">
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Everything included</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> <b>2 FREE Videos Included</b></li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> 1-on-1 Dedicated Editor Channel</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Highest priority render queue</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Custom thumbnail frames</li>
        </ul>
      </div>
      <button type="button" class="btn btn--dark btn--block">Select Package</button>
    </article>
  `;

  const PER_VIDEO_PACKAGES = `
    <!-- Single Cut -->
    <article class="price-card tilt-card">
      <div>
        <div class="price-card__title">Single Cut</div>
        <div class="price-card__sub">1 Standalone Video Edit</div>
        <div class="price-card__price-row">
          <div class="price-card__amount"><span>$</span>25</div>
          <span class="price-card__old">$35</span>
          <span class="price-card__save">20% OFF</span>
        </div>
        <ul class="price-card__features">
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Up to 60 seconds runtime</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Animated captions &amp; motion</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Full sound effects pass</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> 24-Hour delivery</li>
        </ul>
      </div>
      <button type="button" class="btn btn--dark btn--block">Order 1 Video</button>
    </article>

    <!-- 5 Video Bundle -->
    <article class="price-card price-card--featured tilt-card">
      <span class="price-card__badge">Best Value</span>
      <div>
        <div class="price-card__title">5-Video Bundle</div>
        <div class="price-card__sub">5 High-Retention Short-Form Cuts</div>
        <div class="price-card__price-row">
          <div class="price-card__amount"><span>$</span>95</div>
          <span class="price-card__old">$125</span>
          <span class="price-card__save">20% OFF</span>
        </div>
        <ul class="price-card__features">
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> 5 Full Retention Edits ($19/video)</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Kinetic motion graphics &amp; zooms</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Unlimited revisions</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Priority rendering queue</li>
        </ul>
      </div>
      <button type="button" class="btn btn--primary btn--block">Order 5 Videos</button>
    </article>

    <!-- 10 Video Bundle -->
    <article class="price-card tilt-card">
      <div>
        <div class="price-card__title">10-Video Power Pack</div>
        <div class="price-card__sub">10 High-Retention Cuts</div>
        <div class="price-card__price-row">
          <div class="price-card__amount"><span>$</span>160</div>
          <span class="price-card__old">$210</span>
          <span class="price-card__save">20% OFF</span>
        </div>
        <ul class="price-card__features">
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> 10 Full Retention Edits ($16/video)</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> <b>1 FREE Video Included</b></li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Unlimited revisions</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Custom thumbnail frames</li>
        </ul>
      </div>
      <button type="button" class="btn btn--dark btn--block">Order 10 Videos</button>
    </article>
  `;

  if (tabMonthly && tabPerVideo && pricingContainer) {
    pricingContainer.innerHTML = MONTHLY_PACKAGES;
    tabMonthly.addEventListener("click", () => {
      tabMonthly.classList.add("is-active");
      tabPerVideo.classList.remove("is-active");
      pricingContainer.innerHTML = MONTHLY_PACKAGES;
    });
    tabPerVideo.addEventListener("click", () => {
      tabPerVideo.classList.add("is-active");
      tabMonthly.classList.remove("is-active");
      pricingContainer.innerHTML = PER_VIDEO_PACKAGES;
    });
  }

  /* ============================================================
     13. ACCORDION
     ============================================================ */
  $$(".acc").forEach((acc) => {
    const q = $(".acc__q", acc), a = $(".acc__a", acc);
    if (!q || !a) return;
    q.addEventListener("click", () => {
      const open = acc.classList.contains("is-open");
      $$(".acc").forEach((o) => {
        o.classList.remove("is-open");
        const oQ = $(".acc__q", o);
        const oA = $(".acc__a", o);
        if (oQ) oQ.setAttribute("aria-expanded", "false");
        if (oA) oA.style.maxHeight = null;
      });
      if (!open) {
        acc.classList.add("is-open");
        q.setAttribute("aria-expanded", "true");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* ============================================================
     14. CROSS-TAB LIVE SYNC
     ============================================================ */
  window.addEventListener("storage", (e) => {
    if ((e.key === "propanda_status" || e.key === "flow_status") && e.newValue) {
      try { applyStatus(JSON.parse(e.newValue)); } catch (err) {}
    } else if (e.key === "propanda_accent_color" || e.key === "flow_accent_color") {
      applyAccentColor(e.newValue);
    } else if (e.key === "propanda_logo_url" || e.key === "flow_logo_url") {
      applyLogo(e.newValue || "logo.png");
    } else if ((e.key === "propanda_testimonials_data" || e.key === "flow_testimonials_data") && e.newValue) {
      try {
        const q = JSON.parse(e.newValue);
        if (Array.isArray(q)) renderTestimonials(q);
      } catch (err) {}
    }
  });
})();

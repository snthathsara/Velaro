/* ============================================================
   VELARO — main.js
   Minimal, High-Performance Studio Engine (Short & Long Form)
   Palette: Deep Midnight Charcoal + Warm Golden Amber
   ============================================================ */

(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

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
        localStorage.setItem("velaro-theme", next);
      } catch (e) {}
    });
  }

  function applyAccentColor(hex) {
    if (!hex) return;
    root.style.setProperty("--accent", hex);
  }

  let savedAccent = localStorage.getItem("velaro_accent_color");
  if (!savedAccent || savedAccent === "#ff1e38" || savedAccent === "#dc2626") {
    savedAccent = "#f59e0b";
    try { localStorage.setItem("velaro_accent_color", "#f59e0b"); } catch (e) {}
  }
  applyAccentColor(savedAccent);

  /* ============================================================
     2. BRAND LOGO
     ============================================================ */
  function applyLogo(url) {
    if (!url) return;
    $$(".brand__mark, #nav-brand-logo").forEach((img) => { img.src = url; });
    const fav = $("#site-favicon");
    if (fav) fav.href = url;
  }

  const savedLogo = localStorage.getItem("velaro_logo_url");
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

    const dotColor = data.dotColor || (state === "busy" ? "#ef4444" : state === "limited" ? "#f97316" : "#f59e0b");
    document.documentElement.style.setProperty("--status-dot-color", dotColor);
  }

  try {
    const raw = localStorage.getItem("velaro_status");
    if (raw) applyStatus(JSON.parse(raw));
  } catch (e) {}

  /* ============================================================
     4. COUNTDOWN TIMER
     ============================================================ */
  const pad = (n) => String(n).padStart(2, "0");
  let end;
  try { end = +localStorage.getItem("velaro-deadline"); } catch (e) {}
  if (!end || end < Date.now()) {
    end = Date.now() + (4 * 24 * 60 + 16 * 60 + 22) * 60 * 1000;
    try { localStorage.setItem("velaro-deadline", end); } catch (e) {}
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

  // High-performance RAF-throttled Scroll active spy
  const sections = ["home", "roster", "showcase", "process", "pricing", "faq"].map(id => $(`#${id}`)).filter(Boolean);
  let isNavSpyTicking = false;
  let activeNavId = "home";
  let isScrolledState = false;

  function updateNavSpy() {
    isNavSpyTicking = false;
    const scrollPos = window.scrollY + 160;
    let currentId = "home";
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= scrollPos) {
        currentId = sections[i].id;
      }
    }
    if (currentId !== activeNavId) {
      activeNavId = currentId;
      navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href && href.startsWith("#")) {
          link.classList.toggle("is-active", href.replace("#", "") === currentId);
        }
      });
    }

    const scrolled = window.scrollY > 40;
    if (scrolled !== isScrolledState && navCapsule) {
      isScrolledState = scrolled;
      navCapsule.classList.toggle("is-scrolled", scrolled);
    }
  }

  function requestNavSpy() {
    if (!isNavSpyTicking) {
      isNavSpyTicking = true;
      requestAnimationFrame(updateNavSpy);
    }
  }

  window.addEventListener("scroll", requestNavSpy, { passive: true });
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
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal, .reveal-stagger").forEach((el) => io.observe(el));

  /* ============================================================
     8. ANIMATED COUNTERS
     ============================================================ */
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  function runCount(el) {
    const target = +el.dataset.target || 0;
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
          e.target.textContent = (e.target.dataset.prefix || "") + e.target.dataset.target + (e.target.dataset.suffix || "");
        } else runCount(e.target);
        countIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  $$(".stat__num").forEach((el) => countIO.observe(el));

  /* ============================================================
     9. PORTFOLIO SHOWCASE: SHORT & LONG FORM DATA
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
    { id: "long-5", title: "Cinematic Gaming Montage & Narrative Storyline", tag: "Gaming", duration: "08:30", pps: "4K 60FPS", style: "Color Grading & Sound FX", format: "long" },
    { id: "long-6", title: "Behind the Scenes Creator Journey Episode", tag: "Documentary", duration: "16:50", pps: "4K 60FPS", style: "Story Pacing & Motion Graphics", format: "long" }
  ];

  let currentFormat = "all"; // 'all' | 'short' | 'long'
  let currentFilter = "all";

  const showcaseContainer = $("#showcase-container");
  const fmtAllBtn = $("#fmt-all");
  const fmtShortBtn = $("#fmt-short");
  const fmtLongBtn = $("#fmt-long");
  const categoryFilters = $("#category-filters");

  function getActiveVideos() {
    let list = [];
    if (currentFormat === "short") list = SHORT_FORM_VIDEOS;
    else if (currentFormat === "long") list = LONG_FORM_VIDEOS;
    else list = [...SHORT_FORM_VIDEOS, ...LONG_FORM_VIDEOS];

    if (currentFilter === "all") return list;
    return list.filter(v => v.tag.toLowerCase().includes(currentFilter.toLowerCase()) || currentFilter.toLowerCase().includes(v.tag.toLowerCase()));
  }

  function renderShowcase() {
    if (!showcaseContainer) return;
    const vids = getActiveVideos();
    
    showcaseContainer.innerHTML = vids.map((v) => {
      const isLong = v.format === "long";
      return `
        <div class="vcard ${isLong ? 'vcard--long' : ''}" 
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
        </div>`;
    }).join("");
  }

  function setFormat(fmt) {
    currentFormat = fmt;
    if (fmtAllBtn) fmtAllBtn.classList.toggle("is-active", fmt === "all");
    if (fmtShortBtn) fmtShortBtn.classList.toggle("is-active", fmt === "short");
    if (fmtLongBtn) fmtLongBtn.classList.toggle("is-active", fmt === "long");
    renderShowcase();
  }

  if (fmtAllBtn) fmtAllBtn.addEventListener("click", () => setFormat("all"));
  if (fmtShortBtn) fmtShortBtn.addEventListener("click", () => setFormat("short"));
  if (fmtLongBtn) fmtLongBtn.addEventListener("click", () => setFormat("long"));

  if (categoryFilters) {
    categoryFilters.addEventListener("click", (e) => {
      const pill = e.target.closest(".filter-pill");
      if (!pill) return;
      currentFilter = pill.dataset.filter;
      $$(".filter-pill", categoryFilters).forEach(p => p.classList.remove("is-active"));
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

  // Carousel Arrow buttons
  const prevBtn = $("#carousel-prev");
  const nextBtn = $("#carousel-next");
  if (prevBtn && nextBtn && showcaseContainer) {
    const step = () => ((showcaseContainer.querySelector(".vcard") || {}).offsetWidth || 260) + 18;
    prevBtn.addEventListener("click", () => showcaseContainer.scrollBy({ left: -step() * 2, behavior: "smooth" }));
    nextBtn.addEventListener("click", () => showcaseContainer.scrollBy({ left: step() * 2, behavior: "smooth" }));
  }

  renderShowcase();

  /* ============================================================
     10. VIDEO MODAL PREVIEW
     ============================================================ */
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

  if (showcaseContainer) {
    showcaseContainer.addEventListener("click", (e) => {
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

  $$("[data-close]", modal).forEach((el) => el.addEventListener("click", closeModal));
  modal.addEventListener("click", (e) => {
    if (e.target.hasAttribute("data-close")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  /* ============================================================
     11. VERIFIED CREATOR CLIENT REVIEWS
     ============================================================ */
  const DEFAULT_CREATOR_QUOTES = [
    { text: "Velaro completely transformed our workflow. The retention and pacing on every edit helped our videos regularly break 1M+ views.", name: "Sunny and Melon", role: "3.01M Subs · Animation", ava: "assets/creators/sunnyandmelon.png", stars: 5 },
    { text: "Insanely sharp cuts, hilarious audio timing, and unmatched turnaround speed. The best post-production studio on YouTube.", name: "RoRants", role: "1.62M Subs · Commentary", ava: "assets/creators/rorants.png", stars: 5 },
    { text: "Average view duration jumped from 48% to 76% on our uploads. Sound design and kinetic typography are second to none.", name: "Jamesy", role: "474K Subs · Gaming & Shorts", ava: "assets/creators/jamesy.png", stars: 5 },
    { text: "From raw gameplay to a polished high-octane video in under 24 hours. Velaro has been our secret growth weapon.", name: "GamesTried", role: "386K Subs · Gaming Showcase", ava: "assets/creators/gamestried.png", stars: 5 },
    { text: "Every single video comes back clean, dynamic, and viral-ready. Revisions are almost never needed.", name: "Misty", role: "139K Subs · Roblox", ava: "assets/creators/misty.png", stars: 5 },
    { text: "Insane sound effects, smooth keyframe zooms, and flawless meme execution. Bro literally cooks on every timeline.", name: "DonaldDucc Gaming", role: "120K Subs · Gaming Memes", ava: "assets/creators/donaldducc.png", stars: 5 },
    { text: "Pacing is super fast and engaging for younger audiences. Conversion from viewers to subscribers went up dramatically.", name: "CrazyGifter", role: "109K Subs · Entertainment", ava: "assets/creators/crazygifter.png", stars: 5 },
    { text: "Turnaround time is unmatched and the visual hook in the first 5 seconds keeps our retention sky high.", name: "Kingg", role: "98K Subs · Stream Highlights", ava: "assets/creators/kingg.png", stars: 5 },
    { text: "Clean cuts, perfect music sync, and pro color grading. Highly recommend Velaro to any creator looking to scale.", name: "r0aR", role: "29.5K Subs · Content Creator", ava: "assets/creators/r0ar.png", stars: 5 },
    { text: "Transformed our raw recordings into scroll-stopping YouTube Shorts. Super reliable delivery schedule.", name: "Camel27", role: "16.2K Subs · Gaming Shorts", ava: "assets/creators/camel27.png", stars: 5 },
    { text: "Top-tier editing quality with tight sound mastering and clean motion graphics on every project.", name: "Monotone", role: "9.46K Subs · Minecraft", ava: "assets/creators/monotone.png", stars: 5 },
    { text: "Seamless communication and high production value. Velaro makes every video look like a high-budget studio cut.", name: "Tropical Paradox", role: "4.08K Subs · Creator Channel", ava: "assets/creators/tropicalparadox.png", stars: 5 }
  ];

  function renderTestimonials(quotes) {
    const cont = $("#quotes-container");
    if (!cont) return;
    const mid = Math.ceil(quotes.length / 2);
    const row1 = quotes.slice(0, mid);
    const row2 = quotes.slice(mid);
    const qCard = (q) => {
      const isImg = q.ava && (q.ava.includes("/") || q.ava.includes("."));
      const avatarHtml = isImg 
        ? `<img src="${q.ava}" alt="${q.name}" class="quote__ava" />`
        : `<span class="quote__ava" aria-hidden="true">${q.ava || '⭐'}</span>`;
      return `
        <blockquote class="tquote">
          <div class="quote__stars" aria-label="5 stars">★★★★★</div>
          <p class="quote__text">"${q.text}"</p>
          <div class="quote__who">
            ${avatarHtml}
            <div>
              <div class="quote__name">${q.name}</div>
              <div class="quote__role">${q.role}</div>
            </div>
          </div>
        </blockquote>
      `;
    };
    cont.innerHTML = `
      <div class="tmarquee__row tmarquee__row--a">${[...row1, ...row1].map(qCard).join("")}</div>
      <div class="tmarquee__row tmarquee__row--b">${[...row2, ...row2].map(qCard).join("")}</div>
    `;
  }

  let currentQuotes = DEFAULT_CREATOR_QUOTES;
  try {
    const savedQ = localStorage.getItem("velaro_testimonials_data");
    if (savedQ) {
      const parsed = JSON.parse(savedQ);
      if (Array.isArray(parsed) && parsed.length) currentQuotes = parsed;
    }
  } catch (e) {}
  renderTestimonials(currentQuotes);

  /* ============================================================
     12. PRICING TOGGLE
     ============================================================ */
  const btnMonthly = $("#btn-monthly");
  const btnPerVideo = $("#btn-per-video");
  const priceStarter = $("#price-starter");
  const oldStarter = $("#old-starter");
  const priceGrowth = $("#price-growth");
  const oldGrowth = $("#old-growth");
  const priceApex = $("#price-apex");
  const oldApex = $("#old-apex");

  if (btnMonthly && btnPerVideo) {
    btnMonthly.addEventListener("click", () => {
      btnMonthly.classList.add("is-active");
      btnPerVideo.classList.remove("is-active");
      if (priceStarter) priceStarter.innerHTML = "<span>$</span>599";
      if (oldStarter) oldStarter.textContent = "$750";
      if (priceGrowth) priceGrowth.innerHTML = "<span>$</span>1,199";
      if (oldGrowth) oldGrowth.textContent = "$1,500";
      if (priceApex) priceApex.innerHTML = "<span>$</span>2,399";
      if (oldApex) oldApex.textContent = "$3,000";
    });

    btnPerVideo.addEventListener("click", () => {
      btnPerVideo.classList.add("is-active");
      btnMonthly.classList.remove("is-active");
      if (priceStarter) priceStarter.innerHTML = "<span>$</span>25";
      if (oldStarter) oldStarter.textContent = "$35";
      if (priceGrowth) priceGrowth.innerHTML = "<span>$</span>95";
      if (oldGrowth) oldGrowth.textContent = "$125";
      if (priceApex) priceApex.innerHTML = "<span>$</span>160";
      if (oldApex) oldApex.textContent = "$210";
    });
  }

  /* ============================================================
     12. FAQ ACCORDION
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
     13. HERO DECK CLICK
     ============================================================ */
  const heroDeck = $("#hero-deck");
  if (heroDeck) {
    heroDeck.addEventListener("click", () => {
      const showcase = $("#showcase");
      if (showcase) showcase.scrollIntoView({ behavior: "smooth" });
    });
  }

  /* ============================================================
     14. CROSS-TAB LIVE SYNC
     ============================================================ */
  window.addEventListener("storage", (e) => {
    if (e.key === "velaro_status" && e.newValue) {
      try { applyStatus(JSON.parse(e.newValue)); } catch (err) {}
    } else if (e.key === "velaro_accent_color" && e.newValue) {
      applyAccentColor(e.newValue);
    } else if (e.key === "velaro_logo_url" && e.newValue) {
      applyLogo(e.newValue || "logo.png");
    }
  });
})();

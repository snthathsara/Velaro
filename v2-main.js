/* ============================================================
   PRO PANDA — v2-main.js
   Technical Creative Studio & Video Editor Script
   With 3D Perspective Tilt & Dynamic Scroll Entrances
   ============================================================ */

(function () {
  "use strict";

  const DEFAULT_VIDEOS = [
    { id: "sample-1", title: "Valorant & FPS Elimination Hook Cut", tag: "Gaming Shorts" },
    { id: "sample-2", title: "Creator Talking Head Retention System", tag: "Talking Head" },
    { id: "sample-3", title: "Roblox Sandbox Comedy & Sound FX Stack", tag: "Gaming Shorts" },
    { id: "sample-4", title: "Viral Podcast Cutdown & Audio Mastering", tag: "Podcast Cut" },
    { id: "sample-5", title: "High-Retention Creator Short Format", tag: "Creator Shorts" },
    { id: "sample-6", title: "Fortnite Clutch & Elimination Sequence", tag: "Gaming Shorts" }
  ];

  const DEFAULT_PIPELINE = [
    { num: "1", title: "Hook Extraction", color: "red" },
    { num: "2", title: "Kinetic Subtitles", color: "red" },
    { num: "3", title: "Sound Design Stack", color: "red" },
    { num: "4", title: "Color & Motion FX", color: "red" },
    { num: "5", title: "24-48h Delivery", color: "solid" }
  ];

  // 1. Load CMS Content
  function loadV2Data() {
    // Load Logo
    const savedLogo = localStorage.getItem("propanda_logo_url") || "logo.png";
    const logoImg = document.getElementById("v2-main-logo");
    if (logoImg) logoImg.src = savedLogo;

    // Load About Text
    const savedAbout = localStorage.getItem("propanda_v2_about");
    if (savedAbout) {
      try {
        const ab = JSON.parse(savedAbout);
        if (ab.title) document.getElementById("about-title").textContent = ab.title;
        if (ab.desc) document.getElementById("about-desc").innerHTML = ab.desc;
      } catch (e) {}
    }

    // Load Pipeline
    let pipeline = DEFAULT_PIPELINE;
    try {
      const savedP = JSON.parse(localStorage.getItem("propanda_v2_pipeline"));
      if (Array.isArray(savedP) && savedP.length) pipeline = savedP;
    } catch (e) {}
    renderPipeline(pipeline);

    // Load Videos
    let videos = DEFAULT_VIDEOS;
    try {
      const savedV = JSON.parse(localStorage.getItem("propanda_videos_data"));
      if (Array.isArray(savedV) && savedV.length) videos = savedV;
    } catch (e) {}
    renderVideos(videos);

    initInteractiveEffects();
  }

  function renderPipeline(items) {
    const container = document.getElementById("pipeline-container");
    if (!container) return;
    container.innerHTML = items.map((p) => `
      <div class="pipeline-chip">
        <span class="chip-num">${p.num}</span>
        <span class="chip-badge ${p.color === 'solid' ? 'chip-badge--solid' : ''}">${p.title}</span>
      </div>
    `).join("");
  }

  function renderVideos(videos) {
    const container = document.getElementById("v2-videos-container");
    if (!container) return;
    container.innerHTML = videos.map((v, i) => `
      <article class="v2-card" data-idx="${i}" data-id="${v.id}">
        <div class="v2-card__thumb">
          <img src="${v.id && v.id.length === 11 ? 'https://i.ytimg.com/vi/' + v.id + '/mqdefault.jpg' : 'logo.png'}" alt="${v.title}" onerror="this.src='logo.png'" />
          <div class="v2-card__play">▶</div>
        </div>
        <div class="v2-card__info">
          <div class="v2-card__title">${v.title}</div>
          <div class="v2-card__meta">${v.tag} · 60FPS ProRes</div>
        </div>
      </article>
    `).join("");

    document.querySelectorAll(".v2-card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.dataset.id;
        openModal(id, card.querySelector(".v2-card__title").textContent);
      });
    });
  }

  // 2. Interactive Animations & 3D Tilt
  function initInteractiveEffects() {
    // 3D Perspective Tilt on Cards
    const tiltCards = document.querySelectorAll(".about-card, .pipeline-card, .visual-bounds-box, .v2-card");
    tiltCards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotX = ((y - cy) / cy) * -4.5;
        const rotY = ((x - cx) / cx) * 4.5;
        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-3px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });

    // Stagger Index Setter
    document.querySelectorAll(".v2-reveal-stagger").forEach((c) => {
      [...c.children].forEach((ch, i) => ch.style.setProperty("--i", i));
    });

    // Intersection Observer for Smooth Scroll Reveals
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    document.querySelectorAll(".v2-reveal, .v2-reveal-stagger, .hero-bounds-section, .about-card, .pipeline-card, .visual-bounds-box, .v2-card").forEach((el) => {
      el.classList.add("v2-reveal");
      io.observe(el);
    });

    // Anchor Handles Interactive Click Feedback
    document.querySelectorAll(".handle").forEach((h) => {
      h.addEventListener("click", (e) => {
        e.stopPropagation();
        h.style.transform = "translate(-50%, -50%) scale(1.8)";
        setTimeout(() => {
          h.style.transform = "";
        }, 300);
      });
    });

    // Zero-Latency Hardware-Accelerated Precision Studio Cursor
    const cursorRing = document.getElementById("v2-cursor");
    const cursorDot = document.getElementById("v2-cursor-dot");

    if (cursorRing && cursorDot && matchMedia("(hover: hover)").matches) {
      let mouseX = -100;
      let mouseY = -100;
      let ringX = -100;
      let ringY = -100;
      let isVisible = false;

      // 100% Instant Hardware Synchronous Tracking
      window.addEventListener("pointermove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!isVisible) {
          cursorDot.style.opacity = "1";
          cursorRing.style.opacity = "1";
          ringX = mouseX;
          ringY = mouseY;
          isVisible = true;
        }
        // Dot moves at the exact same physical instant as the mouse
        cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }, { passive: true });

      // Snappy 144fps smooth ring follower
      function renderCursor() {
        if (isVisible) {
          ringX += (mouseX - ringX) * 0.45;
          ringY += (mouseY - ringY) * 0.45;
          cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
        }
        requestAnimationFrame(renderCursor);
      }
      requestAnimationFrame(renderCursor);

      document.addEventListener("pointerdown", () => cursorRing.classList.add("is-clicking"));
      document.addEventListener("pointerup", () => cursorRing.classList.remove("is-clicking"));

      document.addEventListener("mouseleave", () => {
        cursorDot.style.opacity = "0";
        cursorRing.style.opacity = "0";
        isVisible = false;
      });

      const hoverTargets = "a, button, .v2-card, .handle, .software-badge, .pipeline-chip, .hero-title-badge, .hero-pill-btn, .hero-year-badge";
      document.querySelectorAll(hoverTargets).forEach((el) => {
        el.addEventListener("mouseenter", () => cursorRing.classList.add("is-hovering"));
        el.addEventListener("mouseleave", () => cursorRing.classList.remove("is-hovering"));
      });
    }
  }

  // 3. Video Modal Player
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modal-content");
  const modalCloseBtn = document.getElementById("modal-close-btn");

  function openModal(id, title) {
    if (!modal || !modalContent) return;
    if (id && id.length === 11) {
      modalContent.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" style="width:100%;height:100%;border:none;" allow="autoplay;encrypted-media" allowfullscreen></iframe>`;
    } else {
      modalContent.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:24px;text-align:center;background:#111;">
          <img src="logo.png" style="width:64px;height:64px;margin-bottom:16px;" alt="Logo" />
          <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--accent);margin-bottom:8px;">[ DEMO PROJECT TIMELINE ]</div>
          <div style="font-size:16px;font-weight:700;color:#fff;margin-bottom:14px;">${title}</div>
          <div style="font-size:13px;color:#888;">Rendered with Adobe Premiere Pro &amp; After Effects</div>
        </div>
      `;
    }
    modal.style.display = "grid";
  }

  function closeModal() {
    if (!modal) return;
    modal.style.display = "none";
    if (modalContent) modalContent.innerHTML = "";
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // Init
  loadV2Data();
})();

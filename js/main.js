(function () {
  const C = window.PORTFOLIO_CONTENT || {};
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ICONS = {
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 9l-3 3 3 3M16 9l3 3-3 3M11 6l-2 12"/></svg>',
    layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
    zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/></svg>',
    monitor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h9M4 20h2M14.5 4.5l5 5L8 21H3v-5L14.5 4.5z"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></svg>',
  };

  function get(obj, path) {
    return path.split(".").reduce((o, k) => (o && o[k] != null ? o[k] : null), obj);
  }

  function bindContent() {
    document.querySelectorAll("[data-bind]").forEach((el) => {
      const v = get(C, el.getAttribute("data-bind"));
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll("[data-bind-src]").forEach((el) => {
      const v = get(C, el.getAttribute("data-bind-src"));
      if (!v) return;
      el.src = v;
      el.onerror = () => {
        const key = el.getAttribute("data-bind-src");
        el.src =
          key === "images.hero"
            ? "assets/images/shiloli.png?v=1"
            : "assets/images/samurai-about.png?v=12";
      };
    });
    document.querySelectorAll("[data-bind-href]").forEach((el) => {
      const key = el.getAttribute("data-bind-href");
      const v = get(C, key);
      if (!v) return;
      el.href = key === "email" ? `mailto:${v}` : v;
    });
    document.title = `${C.name} — ${C.heroRole}`;

    const cv = document.querySelector('[data-bind-href="cvFile"]');
    if (cv && !C.cvFile) cv.style.display = "none";
  }

  function socialLinks(className) {
    const labels = { linkedin: "LinkedIn", github: "GitHub", portfolio: "Portfolio" };
    return Object.entries(C.social || {})
      .filter(([, u]) => u && u !== "#")
      .map(([k, u]) => `<a href="${u}" target="_blank" rel="noopener" class="${className}">${labels[k] || k}</a>`)
      .join("");
  }

  function renderAboutSocial() {
    const el = document.getElementById("about-social");
    if (el) el.innerHTML = socialLinks("social-pill");
  }

  function renderContact() {
    const links = document.getElementById("contact-links");
    if (links) {
      links.innerHTML = `
        <a href="mailto:${C.email}" class="contact-mail">${C.email}</a>
        <a href="tel:${C.phoneTel}" class="contact-phone">${C.phone}</a>`;
    }
    const soc = document.getElementById("contact-social");
    if (soc) soc.innerHTML = socialLinks("social-pill");
  }

  function renderRoleCards() {
    const row = document.getElementById("role-cards");
    if (!row || !C.roleCards) return;
    row.innerHTML = C.roleCards
      .map(
        (c, i) => `
      <a href="#skills" class="role-card" data-animate="fade-up" data-delay="${i}">
        <span class="role-icon">${ICONS[c.icon] || ICONS.code}</span>
        <div>
          <strong>${c.title}</strong>
          <span>${c.tagline}</span>
        </div>
        <span class="role-arrow">›</span>
      </a>`
      )
      .join("");
  }

  function renderSkillBars() {
    const wrap = document.getElementById("skill-bars");
    if (!wrap || !C.skillBars) return;
    wrap.innerHTML = C.skillBars
      .map(
        (s) => `
      <div class="skill-row">
        <div class="skill-row-head"><span>${s.name}</span><span class="skill-pct" data-pct="${s.value}">0%</span></div>
        <div class="skill-track"><div class="skill-fill" data-fill="${s.value}"></div></div>
      </div>`
      )
      .join("");
  }

  function renderServiceTiles() {
    const wrap = document.getElementById("service-tiles");
    if (!wrap || !C.serviceTiles) return;
    wrap.innerHTML = C.serviceTiles
      .map(
        (t, i) => `
      <article class="tile" data-animate="fade-up" data-delay="${i}">
        <span class="tile-icon">${ICONS[t.icon] || ICONS.monitor}</span>
        <span>${t.label}</span>
      </article>`
      )
      .join("");
  }

  function renderWorks() {
    const grid = document.getElementById("works-grid");
    if (!grid || !C.projects) return;
    grid.innerHTML = C.projects
      .map(
        (p, i) => `
      <article class="work-card" data-animate="fade-up" data-delay="${i}">
        <span class="work-tag">${p.tag}</span>
        <h3>${p.title}</h3>
        <p class="work-sub">${p.subtitle}</p>
        <p>${p.description}</p>
        <a href="${p.link || "#"}" target="_blank" rel="noopener">View →</a>
      </article>`
      )
      .join("");
  }

  function initAnimate() {
    const els = document.querySelectorAll("[data-animate]");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const d = parseInt(el.getAttribute("data-delay") || "0", 10) * 90;
          setTimeout(() => el.classList.add("is-visible"), d);
          obs.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );
    els.forEach((el) => obs.observe(el));
    window.addEventListener("load", () => {
      els.forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) el.classList.add("is-visible");
      });
    });
  }

  function initSkillBars() {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.querySelectorAll(".skill-fill").forEach((bar) => {
            const v = bar.getAttribute("data-fill");
            bar.style.width = `${v}%`;
            const pct = bar.closest(".skill-row")?.querySelector(".skill-pct");
            if (pct) animatePct(pct, parseInt(v, 10));
          });
          obs.unobserve(e.target);
        });
      },
      { threshold: 0.3 }
    );
    const wrap = document.getElementById("skill-bars");
    if (wrap) obs.observe(wrap);
  }

  function animatePct(el, target) {
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / 1200, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = `${Math.floor(eased * target)}%`;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = `${target}%`;
    };
    requestAnimationFrame(tick);
  }

  function initSakura() {
    if (reduced) return;
    const layer = document.getElementById("sakura");
    if (!layer) return;
    const petals = 18;
    for (let i = 0; i < petals; i++) {
      const p = document.createElement("span");
      p.className = "petal";
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDuration = `${8 + Math.random() * 12}s`;
      p.style.animationDelay = `${Math.random() * 10}s`;
      p.style.opacity = `${0.15 + Math.random() * 0.35}`;
      layer.appendChild(p);
    }
  }

  function initHeader() {
    const h = document.getElementById("header");
    window.addEventListener("scroll", () => h.classList.toggle("is-scrolled", scrollY > 40), { passive: true });
  }

  function initNav() {
    const t = document.querySelector(".nav-toggle");
    const m = document.getElementById("nav-menu");
    if (!t || !m) return;
    t.addEventListener("click", () => {
      const open = m.classList.toggle("is-open");
      t.setAttribute("aria-expanded", open);
    });
    m.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => m.classList.remove("is-open")));
  }

  function initSmooth() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
        }
      });
    });
  }

  document.getElementById("year").textContent = new Date().getFullYear();

  bindContent();
  renderAboutSocial();
  renderContact();
  renderRoleCards();
  renderSkillBars();
  renderServiceTiles();
  renderWorks();
  initAnimate();
  initSkillBars();
  initSakura();
  initHeader();
  initNav();
  initSmooth();
  initPhotoParallax(".hero-photo-wrap", ".hero-visual--warrior", 1.025);
  initPhotoParallax(".about-photo-wrap", ".about-visual", 1.04);
  initPhotoParallax(".contact-photo-wrap", ".contact-visual", 1.08);
})();

function initPhotoParallax(wrapSelector, containerSelector, scale) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const wrap = document.querySelector(wrapSelector);
  const container = document.querySelector(containerSelector);
  if (!wrap || !container) return;

  container.addEventListener("mousemove", (ev) => {
    const r = container.getBoundingClientRect();
    const x = (ev.clientX - r.left) / r.width - 0.5;
    const y = (ev.clientY - r.top) / r.height - 0.5;
    wrap.style.transform = `translateY(-10px) translate(${x * 12}px, ${y * 8}px) scale(${scale})`;
  });

  container.addEventListener("mouseleave", () => {
    wrap.style.transform = "";
  });
}

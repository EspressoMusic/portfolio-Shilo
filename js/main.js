(function () {
  const C = window.PORTFOLIO_CONTENT || {};
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function get(obj, path) {
    return path.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
  }

  function bindContent() {
    document.querySelectorAll("[data-bind]").forEach((el) => {
      const val = get(C, el.getAttribute("data-bind"));
      if (val != null) el.textContent = val;
    });

    document.querySelectorAll("[data-bind-src]").forEach((el) => {
      const key = el.getAttribute("data-bind-src");
      const val = get(C, key);
      if (!val) return;
      el.src = val;
      el.onerror = () => {
        el.src =
          key === "images.hero"
            ? "assets/images/hero-placeholder.svg"
            : "assets/images/about-placeholder.svg";
      };
    });

    document.querySelectorAll("[data-bind-href]").forEach((el) => {
      const key = el.getAttribute("data-bind-href");
      const val = get(C, key);
      if (!val) return;
      el.href = key === "email" ? `mailto:${val}` : val;
    });

    document.title = `${C.name || "Portfolio"} — ${C.role || ""}`;

    const cvBtn = document.querySelector(".btn-cv");
    if (cvBtn && !C.cvFile) cvBtn.style.display = "none";
  }

  function renderStats() {
    const list = document.getElementById("stats-list");
    if (!list || !C.stats) return;
    list.innerHTML = C.stats
      .map(
        (s, i) => `
      <li class="stat-item" data-scroll="fade-up" data-scroll-delay="${i + 3}">
        <span class="stat-number" data-count="${s.value}" data-suffix="${s.suffix || ""}">0</span>
        <span class="stat-label">${s.label}</span>
      </li>`
      )
      .join("");
  }

  function projectHTML(p) {
    const img = p.image || "assets/images/project-placeholder.svg";
    return `
      <div class="project-card-media" data-scroll="fade-right">
        <img src="${img}" alt="${p.title}" loading="lazy" onerror="this.src='assets/images/project-placeholder.svg'"/>
      </div>
      <div class="project-card-body" data-scroll="fade-left" data-scroll-delay="1">
        <span class="project-tag">${p.tag}</span>
        <h3 class="project-title">${p.title}</h3>
        <p class="project-desc">${p.description}</p>
        <a href="${p.link || "#"}" class="link-arrow" target="_blank" rel="noopener">View project</a>
      </div>`;
  }

  function renderProjects() {
    const projects = C.projects || [];
    const featured = document.getElementById("featured-project");
    const more = document.getElementById("projects-more");
    if (featured && projects[0]) featured.innerHTML = projectHTML(projects[0]);
    if (more && projects.length > 1) {
      more.innerHTML = projects
        .slice(1)
        .map(
          (p, i) => `
        <article class="project-card project-card--compact" data-scroll="fade-up" data-scroll-delay="${i}">
          ${projectHTML(p)}
        </article>`
        )
        .join("");
    }
  }

  function renderServices() {
    const grid = document.getElementById("services-grid");
    if (!grid || !C.services) return;
    grid.innerHTML = C.services
      .map(
        (s, i) => `
      <article class="service-card" data-scroll="fade-up" data-scroll-delay="${i}">
        <span class="service-index">0${i + 1}</span>
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
      </article>`
      )
      .join("");
  }

  function renderContact() {
    const wrap = document.getElementById("contact-links");
    if (!wrap) return;
    const parts = [];
    if (C.email) {
      parts.push(`<a class="contact-email" href="mailto:${C.email}">${C.email}</a>`);
    }
    if (C.phone && C.phoneTel) {
      parts.push(`<a class="contact-phone" href="tel:${C.phoneTel}">${C.phone}</a>`);
    }
    wrap.innerHTML = parts.join("");
  }

  function renderSkills() {
    const grid = document.getElementById("skills-grid");
    if (!grid || !C.skills) return;
    grid.innerHTML = C.skills
      .map(
        (group, i) => `
      <div class="skill-group" data-scroll="fade-up" data-scroll-delay="${i}">
        <h3 class="skill-group-title">${group.title}</h3>
        <ul class="skill-tags">
          ${group.items.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </div>`
      )
      .join("");
  }

  function renderSocial() {
    const wrap = document.getElementById("social-links");
    if (!wrap || !C.social) return;
    const labels = {
      linkedin: "LinkedIn",
      github: "GitHub",
      portfolio: "Portfolio",
    };
    wrap.innerHTML = Object.entries(C.social)
      .map(([key, url]) => {
        const label = labels[key] || key;
        return url && url !== "#"
          ? `<a href="${url}" target="_blank" rel="noopener">${label}</a>`
          : "";
      })
      .filter(Boolean)
      .join("");
  }

  function delay(el) {
    const d = el.getAttribute("data-scroll-delay");
    return d ? parseInt(d, 10) * 80 : 0;
  }

  function initScrollReveal() {
    const els = document.querySelectorAll("[data-scroll]");
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const ms = delay(el);
          if (ms) setTimeout(() => el.classList.add("is-inview"), ms);
          else el.classList.add("is-inview");
          observer.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    els.forEach((el) => observer.observe(el));

    window.addEventListener("load", () => {
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92) el.classList.add("is-inview");
      });
    });
  }

  function initCounters() {
    document.querySelectorAll("[data-count]").forEach((el) => {
      const target = parseInt(el.getAttribute("data-count"), 10);
      const suffix = el.getAttribute("data-suffix") || "";

      const run = () => {
        const duration = 1600;
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 4);
          el.textContent = Math.floor(eased * target) + suffix;
          if (t < 1) requestAnimationFrame(tick);
          else el.textContent = target + suffix;
        };
        requestAnimationFrame(tick);
      };

      const obs = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            run();
            obs.disconnect();
          }
        },
        { threshold: 0.6 }
      );
      obs.observe(el);
    });
  }

  function initScrollProgress() {
    const bar = document.querySelector(".scroll-progress-bar");
    if (!bar || reducedMotion) return;

    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? window.scrollY / h : 0;
      bar.style.transform = `scaleX(${p})`;
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function initHeroScroll() {
    const stage = document.querySelector("[data-scroll-scale]");
    const mark = document.querySelector(".hero-mark");
    if (!stage || reducedMotion) return;

    const onScroll = () => {
      const y = Math.min(window.scrollY, window.innerHeight);
      const t = y / window.innerHeight;
      stage.style.transform = `scale(${1 - t * 0.06}) translateY(${t * 40}px)`;
      stage.style.opacity = String(1 - t * 0.35);
      if (mark) mark.style.transform = `translate(-50%, -50%) rotate(${t * 45}deg) scale(${1 + t * 0.1})`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initParallax() {
    const items = document.querySelectorAll("[data-parallax]");
    if (!items.length || reducedMotion) return;

    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        items.forEach((el) => {
          const speed = parseFloat(el.getAttribute("data-parallax")) || 0.1;
          el.style.transform = `translate(-50%, calc(-50% + ${y * speed}px)) rotate(${y * 0.02}deg)`;
        });
      },
      { passive: true }
    );
  }

  function initSectionReveal() {
    document.querySelectorAll(".section-light, .section-dark").forEach((section) => {
      section.classList.add("section-reveal");
    });

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("section-visible");
        });
      },
      { threshold: 0.08 }
    );

    document.querySelectorAll(".section-reveal").forEach((s) => obs.observe(s));
  }

  function initHeader() {
    const header = document.getElementById("header");
    const about = document.getElementById("about");
    const services = document.getElementById("services");

    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
      let onDark = false;
      [about, services].forEach((sec) => {
        if (!sec) return;
        const r = sec.getBoundingClientRect();
        if (r.top < 80 && r.bottom > 80) onDark = true;
      });
      header.classList.toggle("on-dark", onDark);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.getElementById("nav-menu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open);
    });
    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => menu.classList.remove("is-open"));
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
        }
      });
    });
  }

  document.getElementById("year").textContent = new Date().getFullYear();

  bindContent();
  renderStats();
  renderProjects();
  renderServices();
  renderSkills();
  renderContact();
  renderSocial();
  initScrollReveal();
  initCounters();
  initScrollProgress();
  initHeroScroll();
  initParallax();
  initSectionReveal();
  initHeader();
  initNav();
  initSmoothScroll();
})();

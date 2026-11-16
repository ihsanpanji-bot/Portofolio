
// Memuat section HTML terpisah ke dalam satu halaman
// agar portfolio tetap bisa di-scroll.

const sectionNames = [
  "home",
  "about",
  "skills",
  "projects",
  "contact"
];

const container = document.getElementById("portfolioSections");

// Load JavaScript file dynamically.
async function loadScript(src, errorMessage) {
  await new Promise((resolve, reject) => {
    const script = document.createElement("script");

    script.src = src;
    script.onload = resolve;

    script.onerror = () => {
      reject(new Error(errorMessage));
    };

    document.body.appendChild(script);
  });
}

// Load all HTML sections.
async function loadSections() {
  try {
    const htmlParts = await Promise.all(
      sectionNames.map(async name => {
        const response = await fetch(`html/${name}.html`);

        if (!response.ok) {
          throw new Error(
            `Gagal memuat html/${name}.html (${response.status})`
          );
        }

        let html = await response.text();

        // Hapus script Live Server jika tersisip ke dalam HTML section.
        html = html.replace(
          /<!-- Code injected by live-server -->[\s\S]*?<\/script>/gi,
          ""
        );

        return html;
      })
    );

    container.innerHTML = htmlParts.join("\n");

    // CSS per-section dimuat setelah seluruh HTML tersedia.
    for (const name of sectionNames) {
      const link = document.createElement("link");

      link.rel = "stylesheet";
      link.href = `css/${name}.css`;

      document.head.appendChild(link);
    }

    // Load JavaScript khusus About dan Projects.
    await loadScript(
      "js/about.js",
      "Gagal memuat js/about.js"
    );

    await loadScript(
      "js/projects.js",
      "Gagal memuat js/projects.js"
    );

    initializePortfolio();

    // Initialize CV modal.
    if (typeof window.initializeAboutCV === "function") {
      window.initializeAboutCV();
    }

    // Scroll to the requested section if URL has a hash.
    if (location.hash) {
      requestAnimationFrame(() => {
        document
          .querySelector(location.hash)
          ?.scrollIntoView();
      });
    }

  } catch (error) {
    console.error("Portfolio loading error:", error);

    container.innerHTML = "";

    const message = document.createElement("p");

    message.className = "loading-message";
    message.textContent =
      "Section gagal dimuat: " + error.message;

    container.appendChild(message);
  }
}

// Initialize portfolio features.
function initializePortfolio() {
  const root = document.documentElement;

  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");

  const menuToggle = document.getElementById("menuToggle");
  const sectionNav = document.getElementById("sectionNav");

  const navLinks = [
    ...document.querySelectorAll(".nav-link")
  ];

  const sections = [
    ...document.querySelectorAll("main section[id]")
  ];

  const topbar = document.getElementById("topbar");
  const scrollProgress = document.getElementById("scrollProgress");

  const yearElement = document.getElementById("year");

  // Update footer year.
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Load saved theme.
  const savedTheme = localStorage.getItem("portfolio-theme");

  if (savedTheme === "light" || savedTheme === "dark") {
    root.dataset.theme = savedTheme;
  } else if (!root.dataset.theme) {
    root.dataset.theme = "dark";
  }

  // Update theme toggle label and icon.
  function updateThemeButton() {
    const isDark = root.dataset.theme === "dark";

    // Icon shows the available action.
    themeIcon.textContent = isDark ? "☼" : "☾";

    themeToggle.setAttribute(
      "aria-label",
      isDark
        ? "Switch to light mode"
        : "Switch to dark mode"
    );

    // Tooltip and label show the active theme.
    themeToggle.title = isDark
      ? "Dark theme"
      : "Light theme";

    const label = themeToggle.querySelector(".theme-label");

    if (label) {
      label.textContent = isDark ? "Dark" : "Light";
    }
  }

  updateThemeButton();

  // Theme toggle.
  themeToggle.addEventListener("click", () => {
    root.dataset.theme =
      root.dataset.theme === "dark"
        ? "light"
        : "dark";

    localStorage.setItem(
      "portfolio-theme",
      root.dataset.theme
    );

    updateThemeButton();
  });

  // Mobile menu toggle.
  menuToggle.addEventListener("click", () => {
    const isOpen = sectionNav.classList.toggle("open");

    menuToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    menuToggle.querySelector(".menu-icon").textContent =
      isOpen ? "×" : "☰";
  });

  // Close mobile menu after selecting a section.
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      sectionNav.classList.remove("open");

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );

      menuToggle.querySelector(".menu-icon").textContent = "☰";
    });
  });

  // Close mobile menu when clicking outside topbar.
  document.addEventListener("click", event => {
    if (!topbar.contains(event.target)) {
      sectionNav.classList.remove("open");

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );

      menuToggle.querySelector(".menu-icon").textContent = "☰";
    }
  });

  // Observe active section for navigation highlight.
  const sectionObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        navLinks.forEach(link => {
          const active =
            link.getAttribute("href") === `#${entry.target.id}`;

          link.classList.toggle("active", active);

          if (active) {
            link.setAttribute("aria-current", "page");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    },
    {
      rootMargin: "-38% 0px -48% 0px",
      threshold: 0
    }
  );

  sections.forEach(section => {
    sectionObserver.observe(section);
  });

  // Reveal animation.
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12
    }
  );

  document.querySelectorAll(".reveal").forEach(element => {
    revealObserver.observe(element);
  });

  // Scroll progress indicator.
  function updateProgress() {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;

    scrollProgress.style.width =
      `${maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0}%`;
  }

  window.addEventListener(
    "scroll",
    updateProgress,
    { passive: true }
  );

  window.addEventListener("resize", updateProgress);

  updateProgress();

  // Topbar idle behavior.
  let idleTimer;

  function showTopbar() {
    topbar.classList.remove("idle-hidden");

    if (
      window.matchMedia(
        "(hover: hover) and (pointer: fine) and (min-width: 861px)"
      ).matches
    ) {
      clearTimeout(idleTimer);

      idleTimer = setTimeout(() => {
        if (
          !topbar.matches(":hover") &&
          !topbar.contains(document.activeElement)
        ) {
          topbar.classList.add("idle-hidden");
        }
      }, 2200);
    }
  }

  ["mousemove", "scroll", "keydown", "touchstart"].forEach(evt => {
    window.addEventListener(
      evt,
      showTopbar,
      { passive: true }
    );
  });

  topbar.addEventListener("mouseenter", () => {
    topbar.classList.remove("idle-hidden");
  });

  topbar.addEventListener("focusin", () => {
    topbar.classList.remove("idle-hidden");
  });

  topbar.addEventListener("mouseleave", showTopbar);

  showTopbar();

  // Placeholder links remain inactive until a real URL is provided.
  document.querySelectorAll(".placeholder-link").forEach(link => {
    link.addEventListener("click", event => {
      if (link.getAttribute("href") === "#") {
        event.preventDefault();

        alert(
          "Tambahkan URL GitHub atau Live Demo project terlebih dahulu."
        );
      }
    });
  });
}

// Start loading portfolio.
loadSections();

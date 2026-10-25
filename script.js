(() => {
  "use strict";

  // Enable reveal animation only after this script has loaded successfully.
  const root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const menuButton = document.querySelector(".menu-btn");
  const menu = document.getElementById("menu");

  if (menuButton && menu) {
    const setMenuOpen = (isOpen) => {
      menu.classList.toggle("open", isOpen);
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
      );
      menuButton.textContent = isOpen ? "×" : "☰";
    };

    menuButton.addEventListener("click", () => {
      setMenuOpen(!menu.classList.contains("open"));
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.classList.contains("open")) {
        setMenuOpen(false);
        menuButton.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (
        window.innerWidth <= 760 &&
        menu.classList.contains("open") &&
        !menu.contains(event.target) &&
        !menuButton.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) setMenuOpen(false);
    });
  }


  // Thin top progress indicator; scheduled per frame to keep scrolling smooth.
  const progressBar = document.querySelector(".scroll-progress");
  let scrollFramePending = false;
  const updateScrollProgress = () => {
    if (!progressBar) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0;
    document.documentElement.style.setProperty("--scroll-progress", percent.toFixed(2) + "%");
    scrollFramePending = false;
  };
  window.addEventListener("scroll", () => {
    if (!scrollFramePending) {
      scrollFramePending = true;
      window.requestAnimationFrame(updateScrollProgress);
    }
  }, { passive: true });
  window.addEventListener("resize", updateScrollProgress, { passive: true });
  updateScrollProgress();

  const revealItems = document.querySelectorAll(".reveal");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window && !reducedMotion) {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const item = entry.target;
            const parent = item.parentElement;
            // Stagger sibling cards as they enter the viewport, with a capped delay.
            if (parent) {
              const siblings = Array.from(parent.children).filter((child) => child.classList.contains("reveal"));
              const siblingIndex = Math.max(0, siblings.indexOf(item));
              item.style.setProperty("--reveal-delay", Math.min(siblingIndex, 6) * 65 + "ms");
            }
            item.classList.add("show");
            currentObserver.unobserve(item);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -35px 0px" }
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    // Keep every section visible when motion is reduced or IntersectionObserver is unavailable.
    revealItems.forEach((item) => item.classList.add("show"));
  }

  // Highlight the current navigation section while the visitor scrolls.
  const navLinks = Array.from(document.querySelectorAll('#menu a[href^="#"]'));
  const observedSections = Array.from(document.querySelectorAll("main section[id]"));
  if ("IntersectionObserver" in window && navLinks.length && observedSections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const active = link.getAttribute("href") === "#" + entry.target.id;
          link.classList.toggle("nav-active", active);
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-28% 0px -58% 0px", threshold: 0 });
    observedSections.forEach((section) => sectionObserver.observe(section));
  }

  // Mouse/pen halo: follow the pointer and expand on interactive elements.
  const cursorAura = document.querySelector(".cursor-aura");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const motionAllowed = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const interactiveSelector = "a, button, .project, .certificate-card, .skill-card, .job, .featured-credential, .contact-box";

  if (cursorAura && finePointer && motionAllowed) {
    document.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      cursorAura.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0) translate(-50%,-50%)`;
      cursorAura.classList.add("is-visible");
    }, { passive: true });

    document.addEventListener("pointerover", (event) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const target = event.target instanceof Element ? event.target.closest(interactiveSelector) : null;
      cursorAura.classList.toggle("is-active", Boolean(target));
    }, { passive: true });

    document.addEventListener("pointerout", (event) => {
      if (event.relatedTarget == null) cursorAura.classList.remove("is-visible", "is-active");
    }, { passive: true });

    window.addEventListener("blur", () => cursorAura.classList.remove("is-visible", "is-active"));
  }

  // Touch/pen taps get a small ripple and short visual feedback without blocking clicks.
  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ripple = document.createElement("span");
    ripple.className = "touch-ripple";
    ripple.setAttribute("aria-hidden", "true");
    ripple.style.left = event.clientX + "px";
    ripple.style.top = event.clientY + "px";
    document.body.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });

    const target = event.target instanceof Element ? event.target.closest(interactiveSelector) : null;
    if (target) {
      target.classList.add("touch-feedback");
      window.setTimeout(() => target.classList.remove("touch-feedback"), 190);
    }
  }, { passive: true });

})();
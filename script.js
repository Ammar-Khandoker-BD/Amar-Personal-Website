(() => {
  "use strict";

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

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -24px 0px" }
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    // The page remains fully readable in browsers without IntersectionObserver.
    revealItems.forEach((item) => item.classList.add("show"));
  }
})();
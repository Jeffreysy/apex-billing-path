/**
 * Entry for the WordPress theme's assets/js/site.js. Bundled to a plain IIFE by
 * scripts/build-wordpress-theme.py (esbuild). The React site does the menu and
 * blog chips in components; WordPress serves static markup, so they live here,
 * next to the shared page interactions.
 */
import { initMarketingSite } from "../src/lib/marketing-site";

const header = document.querySelector<HTMLElement>(".site-header");
const toggle = document.querySelector<HTMLButtonElement>(".nav-toggle");
if (header && toggle) {
  toggle.addEventListener("click", () => {
    const open = header.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && header.classList.contains("nav-open")) {
      header.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    }
  });
}

document.querySelectorAll<HTMLElement>(".chip[data-filter]").forEach((chip) => {
  chip.addEventListener("click", () => {
    const f = chip.getAttribute("data-filter");
    document.querySelectorAll(".chip[data-filter]").forEach((c) => c.setAttribute("aria-pressed", c === chip ? "true" : "false"));
    document.querySelectorAll<HTMLElement>("[data-cat]").forEach((card) => {
      card.hidden = !(f === "all" || card.getAttribute("data-cat") === f);
    });
  });
});

const root = document.querySelector<HTMLElement>("body.lc") ?? document.body;
initMarketingSite(root);

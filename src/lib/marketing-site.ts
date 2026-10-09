/**
 * LexCollect marketing site: progressive-enhancement interactions.
 *
 * One source for both front ends. The React site calls initMarketingSite() from
 * SiteShell; the WordPress theme bundles this file into assets/js/site.js
 * (scripts/build-wordpress-theme.py), because WordPress serves the same markup
 * as static HTML. So every behaviour here is driven by data attributes on
 * server-rendered markup, never by React state, and the page reads correctly
 * with JavaScript off: final numbers are in the markup, every panel is present.
 *
 *   data-reveal            fades a block in when it scrolls into view
 *   data-count             counts a number up from zero when it scrolls into view
 *   data-tabs              tab set (data-tab buttons, data-panel panels), optional autoplay
 *   data-recon             before/after reconciliation toggle (data-recon-set buttons)
 *   data-dash              hero dashboard: entrance sequence + linked legend hover
 *   data-scrolly           steps that drive a sticky stage as you scroll
 *   .site-header           gets data-scrolled once the page moves
 *
 * State lives in attributes React does not own (data-motion, data-scrolled), so a
 * React re-render of the header or shell never wipes it.
 */

type Cleanup = () => void;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const all = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => Array.from(root.querySelectorAll<T>(sel)) as T[];

/** Calls fn once, the first time el is at least `threshold` visible. */
function onceVisible(el: Element, fn: () => void, threshold = 0.25): Cleanup {
  if (!("IntersectionObserver" in window)) {
    fn();
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        fn();
      }
    },
    { threshold },
  );
  io.observe(el);
  return () => io.disconnect();
}

/* ---------- Header ---------- */

function initHeader(): Cleanup {
  const header = document.querySelector<HTMLElement>(".lc .site-header, .site-header");
  if (!header) return () => {};
  const update = () => header.toggleAttribute("data-scrolled", window.scrollY > 8);
  update();
  window.addEventListener("scroll", update, { passive: true });
  return () => window.removeEventListener("scroll", update);
}

/* ---------- Reveal on scroll ---------- */

function initReveal(root: HTMLElement, motion: boolean): Cleanup {
  const els = all(root, "[data-reveal]");
  if (!motion || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-in"));
    return () => {};
  }
  els.forEach((el) => {
    const d = el.getAttribute("data-reveal-delay");
    if (d) el.style.transitionDelay = `${d}ms`;
  });
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
  );
  els.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

/* ---------- Count up ---------- */

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function countUp(el: HTMLElement, duration = 1400): Cleanup {
  const finalText = el.textContent ?? "";
  const target = parseFloat(el.getAttribute("data-count") ?? "");
  if (!isFinite(target)) return () => {};
  const decimals = parseInt(el.getAttribute("data-decimals") ?? "0", 10);
  const prefix = el.getAttribute("data-prefix") ?? "";
  const suffix = el.getAttribute("data-suffix") ?? "";
  const fmt = (v: number) =>
    prefix + v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
  let raf = 0;
  const start = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    el.textContent = t < 1 ? fmt(target * easeOut(t)) : finalText;
    if (t < 1) raf = requestAnimationFrame(tick);
  };
  el.textContent = fmt(0);
  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    el.textContent = finalText;
  };
}

function initCounts(root: HTMLElement, motion: boolean): Cleanup {
  if (!motion) return () => {};
  const cleanups: Cleanup[] = [];
  all(root, "[data-count]").forEach((el) => {
    // Counters inside the hero dashboard are started by its own sequence.
    if (el.closest("[data-dash]")) return;
    cleanups.push(onceVisible(el, () => cleanups.push(countUp(el)), 0.6));
  });
  return () => cleanups.forEach((c) => c());
}

/* ---------- Tabs ---------- */

function initTabs(set: HTMLElement, motion: boolean): Cleanup {
  const tabs = all<HTMLButtonElement>(set, "[data-tab]");
  const panels = all(set, "[data-panel]");
  if (!tabs.length) return () => {};
  const autoplay = motion ? parseInt(set.getAttribute("data-autoplay") ?? "0", 10) : 0;
  let timer = 0;
  let stopped = !autoplay;
  let inView = false;
  let hovering = false;
  let current = Math.max(
    0,
    tabs.findIndex((t) => t.classList.contains("is-active")),
  );

  const tablist = tabs[0].parentElement;
  tablist?.setAttribute("role", "tablist");

  const show = (i: number, focus = false) => {
    current = (i + tabs.length) % tabs.length;
    tabs.forEach((t, j) => {
      const on = j === current;
      t.classList.toggle("is-active", on);
      t.setAttribute("role", "tab");
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.setAttribute("tabindex", on ? "0" : "-1");
      t.classList.remove("is-timing");
    });
    panels.forEach((p, j) => {
      const on = j === current;
      p.classList.toggle("is-active", on);
      p.setAttribute("role", "tabpanel");
      p.hidden = !on;
    });
    if (focus) tabs[current].focus();
    schedule();
  };

  const clear = () => {
    window.clearTimeout(timer);
    tabs.forEach((t) => t.classList.remove("is-timing"));
  };

  const schedule = () => {
    clear();
    if (stopped || !inView || hovering) return;
    const t = tabs[current];
    t.style.setProperty("--dur", `${autoplay}ms`);
    // Restart the progress animation.
    void t.offsetWidth;
    t.classList.add("is-timing");
    timer = window.setTimeout(() => show(current + 1), autoplay);
  };

  const stop = () => {
    stopped = true;
    clear();
  };

  const onClick = (e: Event) => {
    const i = tabs.indexOf(e.currentTarget as HTMLButtonElement);
    stop();
    show(i);
  };
  const onKey = (e: KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (e.key in keys) {
      e.preventDefault();
      stop();
      show(current + keys[e.key], true);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      stop();
      show(e.key === "Home" ? 0 : tabs.length - 1, true);
    }
  };
  const onEnter = () => {
    hovering = true;
    clear();
  };
  const onLeave = () => {
    hovering = false;
    schedule();
  };

  tabs.forEach((t) => {
    t.addEventListener("click", onClick);
    t.addEventListener("keydown", onKey);
  });
  set.addEventListener("mouseenter", onEnter);
  set.addEventListener("mouseleave", onLeave);
  set.addEventListener("focusin", stop);

  let io: IntersectionObserver | null = null;
  if (autoplay && "IntersectionObserver" in window) {
    io = new IntersectionObserver(
      (entries) => {
        inView = entries.some((e) => e.isIntersecting);
        if (inView) schedule();
        else clear();
      },
      { threshold: 0.35 },
    );
    io.observe(set);
  }

  show(current);

  return () => {
    clear();
    io?.disconnect();
    tabs.forEach((t) => {
      t.removeEventListener("click", onClick);
      t.removeEventListener("keydown", onKey);
    });
    set.removeEventListener("mouseenter", onEnter);
    set.removeEventListener("mouseleave", onLeave);
    set.removeEventListener("focusin", stop);
  };
}

/* ---------- Reconciliation toggle ---------- */

function initRecon(el: HTMLElement, motion: boolean): Cleanup {
  const buttons = all<HTMLButtonElement>(el, "[data-recon-set]");
  let touched = false;
  const set = (state: string) => {
    el.setAttribute("data-state", state);
    buttons.forEach((b) => b.setAttribute("aria-pressed", b.getAttribute("data-recon-set") === state ? "true" : "false"));
  };
  const onClick = (e: Event) => {
    touched = true;
    set((e.currentTarget as HTMLElement).getAttribute("data-recon-set") ?? "after");
  };
  buttons.forEach((b) => b.addEventListener("click", onClick));

  let t = 0;
  let stopWatch: Cleanup = () => {};
  if (motion) {
    // Start unreconciled, then line the numbers up the first time it is seen.
    set("before");
    stopWatch = onceVisible(
      el,
      () => {
        t = window.setTimeout(() => {
          if (!touched) set("after");
        }, 1100);
      },
      0.5,
    );
  } else {
    set(el.getAttribute("data-state") ?? "after");
  }

  return () => {
    window.clearTimeout(t);
    stopWatch();
    buttons.forEach((b) => b.removeEventListener("click", onClick));
  };
}

/* ---------- Hero dashboard ---------- */

function initDash(el: HTMLElement, motion: boolean): Cleanup {
  const cleanups: Cleanup[] = [];

  // Hovering or focusing a segment highlights its legend row, and the reverse.
  const linked = all(el, "[data-seg]");
  linked.forEach((node) => {
    if (!node.hasAttribute("tabindex") && node.tagName !== "BUTTON") node.setAttribute("tabindex", "0");
    const key = node.getAttribute("data-seg");
    const on = () => {
      el.classList.add("is-focusing");
      linked.forEach((n) => n.classList.toggle("is-hot", n.getAttribute("data-seg") === key));
    };
    const off = () => {
      el.classList.remove("is-focusing");
      linked.forEach((n) => n.classList.remove("is-hot"));
    };
    node.addEventListener("mouseenter", on);
    node.addEventListener("mouseleave", off);
    node.addEventListener("focus", on);
    node.addEventListener("blur", off);
    cleanups.push(() => {
      node.removeEventListener("mouseenter", on);
      node.removeEventListener("mouseleave", off);
      node.removeEventListener("focus", on);
      node.removeEventListener("blur", off);
    });
  });

  if (!motion) return () => cleanups.forEach((c) => c());

  // Entrance. Until .is-run, marketing.css holds the bar, numbers and queue rows
  // back (with a failsafe that shows them if this script never runs). Then the bar
  // wipes in, numbers count up, and each queue row moves to its new status.
  const chips = all(el, "[data-status-from]");
  const finals = chips.map((c) => c.textContent ?? "");
  chips.forEach((c) => {
    c.textContent = c.getAttribute("data-status-from") ?? "";
    c.classList.add("is-pending");
  });
  const timers: number[] = [];
  const run = () => {
    el.classList.add("is-run");
    all(el, "[data-count]").forEach((c) => cleanups.push(countUp(c, 1600)));
    chips.forEach((c, i) => {
      timers.push(
        window.setTimeout(
          () => {
            c.textContent = finals[i];
            c.classList.remove("is-pending");
            c.classList.add("is-updated");
          },
          1900 + i * 900,
        ),
      );
    });
  };
  cleanups.push(onceVisible(el, run, 0.3));
  cleanups.push(() => {
    timers.forEach((t) => window.clearTimeout(t));
    chips.forEach((c, i) => {
      c.textContent = finals[i];
      c.classList.remove("is-pending", "is-updated");
    });
    el.classList.remove("is-run");
  });
  return () => cleanups.forEach((c) => c());
}

/* ---------- Scroll-driven steps ---------- */

function initScrolly(el: HTMLElement): Cleanup {
  const steps = all(el, "[data-step]");
  const stages = all(el, "[data-stage]");
  if (!steps.length || !("IntersectionObserver" in window)) return () => {};
  const activate = (key: string | null) => {
    const at = steps.findIndex((s) => s.getAttribute("data-step") === key);
    steps.forEach((s, i) => {
      s.classList.toggle("is-active", i === at);
      s.classList.toggle("is-done", i < at);
    });
    stages.forEach((s) => s.classList.toggle("is-active", s.getAttribute("data-stage") === key));
  };
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) activate(e.target.getAttribute("data-step"));
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
  );
  steps.forEach((s) => io.observe(s));
  return () => io.disconnect();
}

/* ---------- Entry point ---------- */

/** Wires every interaction inside `root`. Returns a cleanup for SPA navigation. */
export function initMarketingSite(root: HTMLElement): Cleanup {
  const motion = !prefersReducedMotion();
  if (motion) root.setAttribute("data-motion", "on");
  const cleanups: Cleanup[] = [
    initHeader(),
    initReveal(root, motion),
    initCounts(root, motion),
    ...all(root, "[data-tabs]").map((el) => initTabs(el, motion)),
    ...all(root, "[data-recon]").map((el) => initRecon(el, motion)),
    ...all(root, "[data-dash]").map((el) => initDash(el, motion)),
    ...all(root, "[data-scrolly]").map((el) => initScrolly(el)),
  ];
  return () => {
    cleanups.forEach((c) => c());
    root.removeAttribute("data-motion");
  };
}

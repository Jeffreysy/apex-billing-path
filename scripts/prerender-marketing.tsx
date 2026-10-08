/**
 * Prerenders the public marketing pages to static HTML for review.
 *
 *   npx vite-node --mode production scripts/prerender-marketing.tsx <out-dir>
 *
 * Output: index.html, platform.html, results.html, about.html, blog.html,
 * blog-post.html, contact.html, marketing.css and brand/favicon.svg.
 * Internal links are rewritten to the .html files so the set works as a
 * clickable preview without a server. Forms are inert in the preview.
 */
import { mkdirSync, writeFileSync, copyFileSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// The Supabase client touches localStorage at import time; give Node a stub.
const g = globalThis as unknown as { localStorage?: Storage };
if (!g.localStorage) {
  const mem = new Map<string, string>();
  g.localStorage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, v),
    removeItem: (k: string) => void mem.delete(k),
    clear: () => mem.clear(),
    key: (i: number) => Array.from(mem.keys())[i] ?? null,
    get length() {
      return mem.size;
    },
  } as Storage;
}

const outDir = resolve(process.argv[2] ?? "dist-preview");
mkdirSync(join(outDir, "brand"), { recursive: true });

const [
  { default: LandingPage, HOME_META },
  { default: PlatformPage, PLATFORM_META },
  { default: ResultsPage, RESULTS_META },
  { default: AboutPage, ABOUT_META },
  { default: BlogPage, BLOG_META },
  { default: BlogPostPage, BLOG_POST_META },
  { default: ContactPage, CONTACT_META },
  { BLOG_POST_SLUG },
] = await Promise.all([
  import("../src/pages/LandingPage"),
  import("../src/pages/marketing/PlatformPage"),
  import("../src/pages/marketing/ResultsPage"),
  import("../src/pages/marketing/AboutPage"),
  import("../src/pages/marketing/BlogPage"),
  import("../src/pages/marketing/BlogPostPage"),
  import("../src/pages/marketing/ContactPage"),
  import("../src/lib/marketing"),
]);

interface Page {
  file: string;
  path: string;
  /** Route pattern, when the page reads params. */
  pattern?: string;
  component: React.ComponentType;
  meta: { title: string; description: string };
}

const PAGES: Page[] = [
  { file: "index.html", path: "/", component: LandingPage, meta: HOME_META },
  { file: "platform.html", path: "/platform", component: PlatformPage, meta: PLATFORM_META },
  { file: "results.html", path: "/results", component: ResultsPage, meta: RESULTS_META },
  { file: "about.html", path: "/about", component: AboutPage, meta: ABOUT_META },
  { file: "blog.html", path: "/blog", component: BlogPage, meta: BLOG_META },
  { file: "blog-post.html", path: `/blog/${BLOG_POST_SLUG}`, pattern: "/blog/:slug", component: BlogPostPage, meta: BLOG_POST_META },
  { file: "contact.html", path: "/contact", component: ContactPage, meta: CONTACT_META },
];

const LINK_MAP: Record<string, string> = {
  "/": "index.html",
  "/platform": "platform.html",
  "/results": "results.html",
  "/about": "about.html",
  "/blog": "blog.html",
  [`/blog/${BLOG_POST_SLUG}`]: "blog-post.html",
  "/contact": "contact.html",
  "/login": "#",
};

function rewriteLinks(html: string): string {
  return html.replace(/href="(\/[^"#]*)(#[^"]*)?"/g, (m, path: string, hash: string | undefined) => {
    const target = LINK_MAP[path];
    if (!target) return m;
    if (target === "#") return 'href="#" title="Client log in (workspace, not part of this preview)"';
    return `href="${target}${hash ?? ""}"`;
  });
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const PREVIEW_SCRIPT = `<script>
(function(){
  var header=document.querySelector('.site-header'),toggle=document.querySelector('.nav-toggle');
  if(header&&toggle){toggle.addEventListener('click',function(){var open=header.classList.toggle('nav-open');toggle.setAttribute('aria-expanded',open?'true':'false');});}
  document.querySelectorAll('form').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();var n=f.querySelector('.preview-note');if(!n){n=document.createElement('p');n.className='form-status preview-note';n.setAttribute('role','status');n.textContent='Preview only. On the live site this request is saved to the LexCollect inbox and answered within one business day.';f.appendChild(n);}});});
  document.querySelectorAll('.chip').forEach(function(c){c.addEventListener('click',function(){document.querySelectorAll('.chip').forEach(function(x){x.setAttribute('aria-pressed','false')});c.setAttribute('aria-pressed','true');});});
})();
</script>`;

const HEAD_LINKS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;1,400&display=swap">
<link rel="stylesheet" href="marketing.css">
<style>html,body{margin:0;padding:0}body{background:#0B2540;color:#F1F4F7;color-scheme:dark}</style>`;

/** Artifact main page: no document skeleton, title + styles first. */
function wrapFragment(body: string, meta: Page["meta"]): string {
  return `<title>LexCollect Website</title>
<meta name="description" content="${esc(meta.description)}">
${HEAD_LINKS}
${body}
${PREVIEW_SCRIPT}
`;
}

function wrap(body: string, meta: Page["meta"]): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}">
<meta name="theme-color" content="#0B2540">
<link rel="icon" href="brand/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;1,400&display=swap">
<link rel="stylesheet" href="marketing.css">
<style>html,body{margin:0;padding:0}body{background:#0B2540}</style>
</head>
<body>
${body}
<script>
(function(){
  var header=document.querySelector('.site-header'),toggle=document.querySelector('.nav-toggle');
  if(header&&toggle){toggle.addEventListener('click',function(){var open=header.classList.toggle('nav-open');toggle.setAttribute('aria-expanded',open?'true':'false');});}
  document.querySelectorAll('form').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();var n=f.querySelector('.preview-note');if(!n){n=document.createElement('p');n.className='form-status preview-note';n.setAttribute('role','status');n.textContent='Preview only. On the live site this request is saved to the LexCollect inbox and answered within one business day.';f.appendChild(n);}});});
  document.querySelectorAll('.chip').forEach(function(c){c.addEventListener('click',function(){document.querySelectorAll('.chip').forEach(function(x){x.setAttribute('aria-pressed','false')});c.setAttribute('aria-pressed','true');});});
})();
</script>
</body>
</html>
`;
}

for (const page of PAGES) {
  const markup = renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [page.path] },
      createElement(Routes, null, createElement(Route, { path: page.pattern ?? page.path, element: createElement(page.component) })),
    ),
  );
  const body = rewriteLinks(markup);
  // index.html is published as the artifact page itself, which gets its own
  // document skeleton; every other file is served as-is and needs the full one.
  writeFileSync(join(outDir, page.file), page.file === "index.html" ? wrapFragment(body, page.meta) : wrap(body, page.meta));
  console.log(`wrote ${page.file} (${(markup.length / 1024).toFixed(0)} KB)`);
}

const root = resolve(__dirname, "..");
copyFileSync(join(root, "src/styles/marketing.css"), join(outDir, "marketing.css"));
copyFileSync(join(root, "public/brand/favicon.svg"), join(outDir, "brand/favicon.svg"));
console.log(`done → ${outDir}`);
void readFileSync;

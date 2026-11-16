#!/usr/bin/env node
// Automatable SEO checks (the "A" series in docs/seo-report.md, section 8) against the
// built site. Needs no server and no dependencies (Node 18).
//
//   npm run build && npm run export
//   node .claude/skills/update-seo/audit.mjs [--out out] [--repo .] [--quiet]
//
// Prints PASS / WARN / ERROR per check id (with the page), then a summary. Exit code 1
// if any ERROR. WARNs are advice, not failures. --out / --repo point at another copy of
// the build or repo (used to test the script against a modified fixture).
// Page types: post = out/post/**/*.html (not _fixtures), home = out/index.html,
// about = out/about.html; out/404.html is skipped.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
};
const OUT = path.resolve(opt("--out", "out"));
const REPO = path.resolve(opt("--repo", "."));
const QUIET = args.includes("--quiet");

if (!fs.existsSync(path.join(OUT, "index.html"))) {
  console.error(`No built site at ${OUT}. Run: npm run build && npm run export`);
  process.exit(2);
}

// ---------- helpers ----------
const siteSrc = readRepo("lib/site.js");
const HOST = (siteSrc.match(/https:\/\/[a-z0-9.-]+/i) || ["https://ryanscharfer.blog"])[0];

function readRepo(rel) {
  try {
    return fs.readFileSync(path.join(REPO, rel), "utf8");
  } catch {
    return null;
  }
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

function decode(s = "") {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function attrs(tag) {
  const o = {};
  for (const m of tag.matchAll(/([a-zA-Z:_-][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
    if (m.index === 0) continue; // tag name
    o[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? "");
  }
  return o;
}

const startTags = (html, name) => [...html.matchAll(new RegExp(`<${name}(?=[\\s/>])[^>]*>`, "gi"))].map((m) => attrs(m[0].replace(/^<\w+/, "<x")));
const meta = (html, key, val) => startTags(html, "meta").filter((a) => a[key] === val);
const metaContent = (html, key, val) => meta(html, key, val)[0]?.content;
const strip = (s) => decode(s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const head = (html) => html.match(/<head[\s\S]*?<\/head>/i)?.[0] ?? "";

// ---------- load pages ----------
const pages = walk(OUT)
  .filter((f) => f.endsWith(".html"))
  .map((f) => path.relative(OUT, f))
  .filter((rel) => rel !== "404.html" && !rel.split(path.sep).includes("_fixtures"))
  .map((rel) => {
    const r = rel.split(path.sep).join("/").replace(/\.html$/, "");
    const url = r === "index" ? "/" : "/" + r;
    const type = url === "/" ? "home" : url === "/about" ? "about" : url.startsWith("/post/") ? "post" : "other";
    const html = fs.readFileSync(path.join(OUT, rel), "utf8");
    return { rel, url, type, html, head: head(html) };
  })
  .sort((a, b) => a.url.localeCompare(b.url));
const posts = pages.filter((p) => p.type === "post");

// ---------- result bookkeeping ----------
const checks = []; // { id, rule, findings: [{sev, page, msg}] }
function check(id, rule, fn) {
  const c = { id, rule, findings: [] };
  const add = (sev, page, msg) => c.findings.push({ sev, page, msg });
  try {
    fn(add);
  } catch (e) {
    add("ERROR", "-", `check crashed: ${e.message}`);
  }
  checks.push(c);
}

const jsonLd = (p) => {
  const out = [];
  for (const m of p.head.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      out.push({ ok: true, data: JSON.parse(m[1]) });
    } catch (e) {
      out.push({ ok: false, error: e.message });
    }
  }
  return out;
};
const blogPosting = (p) => jsonLd(p).find((j) => j.ok && [].concat(j.data["@type"]).includes("BlogPosting"))?.data;
const dateOnly = (s) => String(s ?? "").slice(0, 10);
const canonicalOf = (p) => startTags(p.head, "link").find((a) => a.rel === "canonical")?.href;

// ---------- A1-A3: titles and descriptions ----------
check("A1", "exactly one non-empty <title>, unique across pages", (add) => {
  const seen = new Map();
  for (const p of pages) {
    const titles = [...p.head.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)].map((m) => decode(m[1]).trim());
    if (titles.length !== 1) add("ERROR", p.url, `${titles.length} <title> elements`);
    else if (!titles[0]) add("ERROR", p.url, "empty <title>");
    else (seen.get(titles[0]) ?? seen.set(titles[0], []).get(titles[0])).push(p.url);
  }
  for (const [t, urls] of seen) if (urls.length > 1) add("ERROR", urls.join(", "), `duplicate title "${t}"`);
});

check("A2", "titles at most about 60 characters (rule of thumb; Google sets no limit)", (add) => {
  for (const p of pages) {
    const t = decode(p.head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim();
    if (t.length > 60) add("WARN", p.url, `${t.length} chars: "${t}"`);
  }
});

check("A3", "non-empty meta description, unique, about 160 chars or less", (add) => {
  const seen = new Map();
  for (const p of pages) {
    const ds = meta(p.head, "name", "description");
    const d = ds[0]?.content?.trim();
    if (ds.length !== 1 || !d) {
      add("ERROR", p.url, ds.length > 1 ? "more than one meta description" : "missing or empty meta description");
      continue;
    }
    (seen.get(d) ?? seen.set(d, []).get(d)).push(p.url);
    if (d.length > 160) add("WARN", p.url, `description is ${d.length} chars`);
  }
  for (const [d, urls] of seen) if (urls.length > 1) add("ERROR", urls.join(", "), `duplicate description "${d.slice(0, 70)}"`);
});

// ---------- A4-A8: canonical, indexing ----------
check("A4", "exactly one rel=canonical, absolute, on the canonical host", (add) => {
  for (const p of pages) {
    const cs = startTags(p.head, "link").filter((a) => a.rel === "canonical");
    if (cs.length !== 1) add("ERROR", p.url, `${cs.length} canonical links`);
    else if (!cs[0].href?.startsWith(HOST)) add("ERROR", p.url, `canonical "${cs[0].href}" is not on ${HOST}`);
  }
});

check("A5", "canonical is self-referential (no trailing slash except home)", (add) => {
  for (const p of pages) {
    const c = canonicalOf(p);
    if (c && c !== HOST + (p.url === "/" ? "/" : p.url)) add("ERROR", p.url, `canonical ${c} does not match page URL`);
  }
});

const netlify = readRepo("netlify.toml") ?? "";
const headersFile = readRepo("public/_headers") ?? "";

check("A6", "canonical not sent as an HTTP header as well", (add) => {
  if (/Link:.*canonical/i.test(netlify + headersFile)) add("WARN", "netlify.toml/_headers", "canonical sent in an HTTP Link header; use the HTML element only");
});

check("A7", "no noindex anywhere (meta or X-Robots-Tag)", (add) => {
  for (const p of pages) if (/noindex/i.test(p.head)) add("ERROR", p.url, "noindex in <head>");
  if (/X-Robots-Tag/i.test(netlify + headersFile)) add("ERROR", "netlify.toml/_headers", "X-Robots-Tag header set");
});

const robots = readRepo("public/robots.txt");
check("A8", "robots.txt does not block everything and lists the sitemap on the canonical host", (add) => {
  if (robots == null) return add("ERROR", "public/robots.txt", "file missing");
  // Walk groups: a "*" group with "Disallow: /" is an error.
  let star = false;
  for (const line of robots.split(/\r?\n/).map((l) => l.replace(/#.*/, "").trim())) {
    if (/^user-agent:/i.test(line)) star = /:\s*\*\s*$/.test(line);
    else if (star && /^disallow:\s*\/\s*$/i.test(line)) add("ERROR", "public/robots.txt", "Disallow: / for User-agent: *");
  }
  if (!new RegExp(`^Sitemap:\\s*${HOST.replace(/\./g, "\\.")}/\\S+`, "mi").test(robots)) add("ERROR", "public/robots.txt", `no Sitemap: line on ${HOST}`);
});

// ---------- A9-A11: share image, lang ----------
check("A9", "every post has a share image (not the avatar) that exists in out/", (add) => {
  for (const p of posts) {
    const img = metaContent(p.head, "property", "og:image");
    if (!img) add("WARN", p.url, "no og:image");
    else if (/\/avatar\.png$/.test(img)) add("WARN", p.url, "og:image falls back to /avatar.png");
    else if (!fs.existsSync(path.join(OUT, new URL(img, HOST).pathname))) add("ERROR", p.url, `og:image file missing in out/: ${img}`);
  }
});

check("A10", "twitter:card is summary_large_image when a real share image is set", (add) => {
  for (const p of posts) {
    const img = metaContent(p.head, "property", "og:image");
    const card = metaContent(p.head, "name", "twitter:card");
    if (img && !/avatar\.png$/.test(img) && card !== "summary_large_image") add("WARN", p.url, `twitter:card is "${card}"`);
  }
});

check("A11", "<html lang> and viewport meta present", (add) => {
  for (const p of pages) {
    if (!/<html[^>]*\slang="[a-z-]+"/i.test(p.html)) add("ERROR", p.url, "no <html lang>");
    if (!meta(p.head, "name", "viewport").length) add("ERROR", p.url, "no viewport meta");
  }
});

// ---------- A12-A17: JSON-LD ----------
check("A12", "each post has JSON-LD that parses, with exactly one BlogPosting", (add) => {
  for (const p of posts) {
    const ld = jsonLd(p);
    const bad = ld.filter((j) => !j.ok);
    if (bad.length) add("ERROR", p.url, `JSON-LD does not parse: ${bad[0].error}`);
    const n = ld.filter((j) => j.ok && [].concat(j.data["@type"]).includes("BlogPosting")).length;
    if (!bad.length && n !== 1) add("ERROR", p.url, `${n} BlogPosting objects (want 1)`);
  }
  for (const p of pages.filter((p) => p.type !== "post"))
    for (const j of jsonLd(p)) if (!j.ok) add("ERROR", p.url, `JSON-LD does not parse: ${j.error}`);
});

check("A13", "JSON-LD has headline, image, datePublished, dateModified, author.name", (add) => {
  for (const p of posts) {
    const d = blogPosting(p);
    if (!d) continue;
    const missing = ["headline", "image", "datePublished", "dateModified"].filter((k) => !d[k]);
    if (!d.author?.name) missing.push("author.name");
    if (missing.length) add("WARN", p.url, `missing ${missing.join(", ")}`);
  }
});

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;
check("A14", "JSON-LD dates are ISO 8601 with a timezone offset", (add) => {
  const bad = [];
  for (const p of posts) {
    const d = blogPosting(p);
    if (!d) continue;
    for (const k of ["datePublished", "dateModified"]) if (d[k] && !ISO.test(d[k])) bad.push(`${p.url} ${k}="${d[k]}"`);
  }
  // One line per run, not per post, so a site-wide gap stays readable.
  if (bad.length) add("WARN", `${new Set(bad.map((b) => b.split(" ")[0])).size} post(s)`, `no time/timezone, e.g. ${bad[0]}`);
});

check("A15", "JSON-LD author has url or sameAs; name is a bare name", (add) => {
  for (const p of posts) {
    const a = blogPosting(p)?.author;
    if (!a) continue;
    if (!a.url && !a.sameAs) add("WARN", p.url, "author has neither url nor sameAs");
    if (!a.sameAs) add("WARN", p.url, "author has no sameAs (site.js has github/linkedin)");
    if (/https?:|@|\//.test(a.name ?? "")) add("WARN", p.url, `author.name is not a bare name: "${a.name}"`);
  }
});

check("A16", "JSON-LD agrees with the page: url/mainEntityOfPage = canonical, datePublished = article:published_time, headline = og:title", (add) => {
  for (const p of posts) {
    const d = blogPosting(p);
    if (!d) continue;
    const c = canonicalOf(p);
    if (d.url !== c) add("ERROR", p.url, `JSON-LD url ${d.url} != canonical ${c}`);
    const moe = typeof d.mainEntityOfPage === "string" ? d.mainEntityOfPage : d.mainEntityOfPage?.["@id"];
    if (moe !== c) add("ERROR", p.url, `mainEntityOfPage ${moe} != canonical ${c}`);
    const pub = metaContent(p.head, "property", "article:published_time");
    if (pub && d.datePublished !== pub) add("ERROR", p.url, `datePublished ${d.datePublished} != article:published_time ${pub}`);
    const mod = metaContent(p.head, "property", "article:modified_time");
    if (mod && d.dateModified !== mod) add("ERROR", p.url, `dateModified ${d.dateModified} != article:modified_time ${mod}`);
    const og = metaContent(p.head, "property", "og:title");
    if (og && d.headline !== og) add("ERROR", p.url, `headline "${d.headline}" != og:title "${og}"`);
    const h1 = strip(p.html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "");
    if (h1 && d.headline !== h1) add("ERROR", p.url, `headline "${d.headline}" != visible H1 "${h1}"`);
  }
});

check("A17", "dateModified is not before datePublished", (add) => {
  for (const p of posts) {
    const d = blogPosting(p);
    if (d?.datePublished && d?.dateModified && dateOnly(d.dateModified) < dateOnly(d.datePublished))
      add("ERROR", p.url, `dateModified ${d.dateModified} < datePublished ${d.datePublished}`);
  }
});

// ---------- A18-A20: sitemap ----------
const sitemapPath = path.join(OUT, "sitemap.xml");
let sitemapEntries = null;
check("A18", "sitemap: UTF-8, absolute canonical URLs, under 50,000 URLs / 50 MB, no priority/changefreq", (add) => {
  if (!fs.existsSync(sitemapPath)) return add("ERROR", "out/sitemap.xml", "missing (is public/sitemap.xml generated by the build?)");
  const buf = fs.readFileSync(sitemapPath);
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(buf);
  } catch {
    add("ERROR", "out/sitemap.xml", "not valid UTF-8");
  }
  const xml = buf.toString("utf8");
  if (buf.length > 50 * 1024 * 1024) add("ERROR", "out/sitemap.xml", "over 50 MB");
  sitemapEntries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
    loc: decode(m[1].match(/<loc>\s*([^<]*?)\s*<\/loc>/)?.[1] ?? ""),
    lastmod: m[1].match(/<lastmod>\s*([^<]*?)\s*<\/lastmod>/)?.[1],
  }));
  if (!sitemapEntries.length) add("ERROR", "out/sitemap.xml", "no <url> entries");
  if (sitemapEntries.length > 50000) add("ERROR", "out/sitemap.xml", "over 50,000 URLs");
  if (/<priority>|<changefreq>/i.test(xml)) add("ERROR", "out/sitemap.xml", "contains <priority>/<changefreq>, which Google ignores");
  for (const e of sitemapEntries) {
    if (!e.loc.startsWith(HOST)) add("ERROR", e.loc || "(empty loc)", `not an absolute URL on ${HOST}`);
    else if (e.loc !== HOST + "/" && e.loc.endsWith("/")) add("ERROR", e.loc, "trailing slash, differs from canonical form");
    if (e.lastmod && !/^\d{4}-\d{2}-\d{2}([T ].*)?$/.test(e.lastmod)) add("ERROR", e.loc, `bad lastmod "${e.lastmod}"`);
  }
  const locs = sitemapEntries.map((e) => e.loc);
  for (const l of new Set(locs.filter((l, i) => locs.indexOf(l) !== i))) add("ERROR", l, "listed twice");
});

check("A19", "sitemap URLs equal the canonicals of all built pages (excluding 404 and fixtures)", (add) => {
  if (!sitemapEntries) return add("ERROR", "out/sitemap.xml", "not parsed (see A18)");
  const inMap = new Set(sitemapEntries.map((e) => e.loc));
  const built = new Set(pages.map((p) => canonicalOf(p) ?? HOST + p.url));
  for (const u of built) if (!inMap.has(u)) add("ERROR", u, "built page missing from sitemap");
  for (const u of inMap) if (!built.has(u)) add("ERROR", u, "in sitemap but no built page has this canonical");
});

check("A20", "sitemap lastmod = JSON-LD dateModified per post; not identical for every URL", (add) => {
  if (!sitemapEntries) return;
  const byLoc = new Map(sitemapEntries.map((e) => [e.loc, e.lastmod]));
  for (const p of posts) {
    const d = blogPosting(p);
    const lm = byLoc.get(canonicalOf(p) ?? HOST + p.url);
    if (d?.dateModified && lm && dateOnly(lm) !== dateOnly(d.dateModified)) add("WARN", p.url, `lastmod ${lm} != dateModified ${d.dateModified}`);
    if (!lm) add("WARN", p.url, "no lastmod in sitemap");
  }
  const postMods = sitemapEntries.filter((e) => e.loc.includes("/post/") && e.lastmod).map((e) => e.lastmod);
  if (postMods.length > 2 && new Set(postMods).size === 1) add("WARN", "sitemap", `every post has lastmod ${postMods[0]}; Google ignores lastmod that is not verifiably accurate`);
});

// ---------- A21-A26: content ----------
const articleOf = (html) => html.match(/<article[\s\S]*?<\/article>/i)?.[0] ?? null;

check("A21", "every <img> in the article has alt (decorative ones explicit)", (add) => {
  for (const p of posts) {
    const art = articleOf(p.html);
    if (!art) continue;
    for (const m of art.matchAll(/<img\b[^>]*>/gi)) {
      const a = attrs(m[0].replace(/^<img/i, "<x"));
      if (!("alt" in a)) add("ERROR", p.url, `<img> without alt attribute: ${a.src}`);
      else if (!a.alt.trim()) add("WARN", p.url, `<img> with empty alt: ${a.src}`);
    }
  }
});

check("A22", "exactly one <h1> per page", (add) => {
  for (const p of pages) {
    const n = (p.html.match(/<h1[\s>]/gi) || []).length;
    if (n !== 1) add("WARN", p.url, `${n} <h1> elements`);
  }
});

const GENERIC = /^(click here|here|link|this link|read more|more|this|this post|this page)$/i;
function internalHrefs(p) {
  const links = [];
  for (const m of p.html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const a = attrs("<x " + m[1] + ">");
    links.push({ href: a.href, text: strip(m[2]), attrs: a });
  }
  return links;
}

check("A23", "links have descriptive anchor text", (add) => {
  for (const p of pages)
    for (const l of internalHrefs(p)) if (l.href && GENERIC.test(l.text)) add("WARN", p.url, `generic anchor text "${l.text}" -> ${l.href}`);
});

check("A24", "internal hrefs resolve to built files and use canonical form (no trailing slash, netlify.app, www)", (add) => {
  const exists = (u) => {
    const p = decodeURIComponent(u);
    return p === "/" ? fs.existsSync(path.join(OUT, "index.html")) : [p + ".html", p, p + "/index.html"].some((c) => fs.existsSync(path.join(OUT, c)) && fs.statSync(path.join(OUT, c)).isFile());
  };
  const reported = new Set();
  for (const p of pages)
    for (const l of internalHrefs(p)) {
      const h = l.href;
      if (!h || h.startsWith("#") || /^(mailto|tel|javascript):/i.test(h)) continue;
      const key = p.url + h;
      if (reported.has(key)) continue;
      reported.add(key);
      if (/ryansblog\.netlify\.app|:\/\/www\.ryanscharfer\.blog/i.test(h)) {
        add("ERROR", p.url, `non-canonical host in link ${h}`);
        continue;
      }
      let u;
      try {
        u = new URL(h, HOST + p.url);
      } catch {
        add("ERROR", p.url, `unparseable href ${h}`);
        continue;
      }
      if (u.origin !== HOST) continue;
      if (u.pathname !== "/" && u.pathname.endsWith("/")) add("ERROR", p.url, `trailing slash in internal link ${h}`);
      else if (!exists(u.pathname)) add("ERROR", p.url, `internal link does not resolve to a built file: ${h}`);
    }
});

check("A25", "no <meta name=keywords>", (add) => {
  for (const p of pages) if (meta(p.head, "name", "keywords").length) add("WARN", p.url, "keywords meta present; Google ignores it");
});

check("A26", "post text is in the static HTML (ERROR under 30 words in <article>, WARN under 150 as thin)", (add) => {
  for (const p of posts) {
    const art = articleOf(p.html);
    if (!art) add("ERROR", p.url, "no <article> element in static HTML");
    else {
      const words = strip(art).split(/\s+/).filter(Boolean).length;
      if (words < 30) add("ERROR", p.url, `only ${words} words of article text in static HTML (content rendered client-side?)`);
      else if (words < 150) add("WARN", p.url, `thin post: ${words} words of article text (editorial call for Ryan; do not pad)`);
    }
  }
});

// ---------- A27-A33: repo config ----------
check("A27", "netlify.toml still 301-redirects ryansblog.netlify.app/* to the custom host", (add) => {
  const block = netlify.split(/\[\[redirects\]\]/).slice(1).find((b) => /ryansblog\.netlify\.app/.test(b));
  if (!block) return add("ERROR", "netlify.toml", "no redirect from ryansblog.netlify.app");
  if (!/status\s*=\s*301/.test(block)) add("ERROR", "netlify.toml", "redirect is not status = 301");
  if (!new RegExp(`to\\s*=\\s*"${HOST.replace(/\./g, "\\.")}`).test(block)) add("ERROR", "netlify.toml", `redirect does not go to ${HOST}`);
});

check("A28", "no llms.txt (Google Search does not use it); no priority/changefreq generator", (add) => {
  for (const f of [path.join(REPO, "public/llms.txt"), path.join(REPO, "public/llms-full.txt"), path.join(OUT, "llms.txt")])
    if (fs.existsSync(f)) add("WARN", path.relative(process.cwd(), f), "present; not needed for Google Search (harmless elsewhere)");
  if (/priority|changefreq/i.test(readRepo("lib/sitemap.js") ?? "")) add("WARN", "lib/sitemap.js", "mentions priority/changefreq; Google ignores both");
});

const AI_TOKENS = ["OAI-SearchBot", "GPTBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "Google-Extended"];
check("A29", "robots.txt records an AI-crawler decision (names the bots, or has an '# AI crawlers' comment)", (add) => {
  if (robots == null) return;
  const missing = AI_TOKENS.filter((t) => !new RegExp(t, "i").test(robots));
  const commented = /^\s*#.*AI[- ]crawlers?/im.test(robots);
  if (missing.length && !commented) add("WARN", "public/robots.txt", `no recorded AI-crawler policy (not named: ${missing.join(", ")}); ask Ryan, then record it`);
});

check("A30", "comment system adds no raw user links to the HTML (giscus iframe/script only)", (add) => {
  for (const p of posts)
    for (const l of internalHrefs(p)) if (/giscus|discussions/i.test(l.href ?? "")) add("WARN", p.url, `anchor into comments system: ${l.href}`);
});

check("A31", "RSS/Atom <link rel=alternate> in the home <head> and the feed file exists", (add) => {
  const home = pages.find((p) => p.type === "home");
  const feed = startTags(home.head, "link").find((a) => a.rel === "alternate" && /rss|atom/i.test(a.type ?? ""));
  if (!feed) return add("WARN", "/", "no feed <link rel=\"alternate\"> (no RSS/Atom feed)");
  const fp = new URL(feed.href, HOST).pathname;
  if (!fs.existsSync(path.join(OUT, fp))) add("ERROR", "/", `feed ${feed.href} is linked but not in out/`);
});

check("A32", "home page has WebSite or Blog JSON-LD", (add) => {
  const home = pages.find((p) => p.type === "home");
  const ok = jsonLd(home).some((j) => j.ok && [].concat(j.data["@type"]).some((t) => ["WebSite", "Blog"].includes(t)));
  if (!ok) add("WARN", "/", "no WebSite/Blog JSON-LD");
});

check("A33", "post `created:` never hand-edited; `updated:` only changed by the hook", (add) => {
  const git = (...a) => execFileSync("git", ["-C", REPO, ...a], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  try {
    const log = git("log", "-p", "--format=commit %h", "--", "posts");
    let commit = "";
    for (const line of log.split("\n")) {
      if (line.startsWith("commit ")) commit = line.slice(7);
      else if (/^-created:/.test(line)) add("ERROR", commit, `a commit removed/changed a created: line (${line})`);
    }
    const wt = git("diff", "HEAD", "--", "posts");
    for (const line of wt.split("\n")) {
      if (/^[-+]created:/.test(line)) add("ERROR", "working tree", `uncommitted change to ${line}`);
      if (/^[-+]updated:/.test(line)) add("WARN", "working tree", `uncommitted change to ${line}; only the pre-commit hook should write updated:`);
    }
  } catch (e) {
    add("WARN", "git", `could not read git history: ${e.message.split("\n")[0]}`);
  }
});

// ---------- report ----------
const rank = { ERROR: 2, WARN: 1 };
let errors = 0;
let warns = 0;
for (const c of checks) {
  const worst = c.findings.reduce((w, f) => Math.max(w, rank[f.sev]), 0);
  const label = worst === 2 ? "ERROR" : worst === 1 ? "WARN " : "PASS ";
  if (worst === 0 && QUIET) continue;
  console.log(`${label} ${c.id.padEnd(3)} ${c.rule}`);
  for (const f of c.findings) {
    console.log(`        ${f.sev.padEnd(5)} ${f.page}: ${f.msg}`);
    f.sev === "ERROR" ? errors++ : warns++;
  }
}
console.log(`\n${pages.length} pages (${posts.length} posts) audited in ${path.relative(process.cwd(), OUT) || "."}: ${errors} ERROR, ${warns} WARN across ${checks.length} checks`);
console.log("Manual/Search Console checks (B-series) are listed in .claude/skills/update-seo/SKILL.md.");
process.exit(errors ? 1 : 0);

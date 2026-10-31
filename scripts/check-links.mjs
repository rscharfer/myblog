// Checks the links in posts. `node scripts/check-links.mjs` checks every post; pass file paths to
// check just those, or `--staged` (used by .githooks/pre-commit) to check the staged versions of
// added/modified posts. Exits 1 if a link is definitely broken. Timeouts, network errors and
// bot-blocking responses (403/429) are only warnings, so being offline doesn't block a commit.
// Skip it for one commit with `git commit --no-verify`.
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

// Read rather than imported: lib/ is ESM in a package Node treats as CommonJS.
const SITE_URL = fs.readFileSync("lib/site.js", "utf8").match(/url:\s*"([^"]+)"/)[1];
const TIMEOUT_MS = 10000;
const SOFT_STATUSES = new Set([401, 403, 429, 999]);

const git = (args) => execFileSync("git", args, { encoding: "utf8" });

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : entry.name.endsWith(".md") ? [full] : [];
  });
}

// Every post is served at /post/<path under posts/ without .md>.
const slugs = new Set(walk("posts").map((f) => path.relative("posts", f).replace(/\.md$/, "").split(path.sep).join("/")));

function sources() {
  const args = process.argv.slice(2);
  if (args[0] === "--staged") {
    return git(["diff", "--cached", "--name-only", "--diff-filter=AM", "--", "posts"])
      .split("\n")
      .filter((file) => file.endsWith(".md"))
      .map((file) => ({ file, text: git(["show", `:${file}`]) }));
  }
  const files = args.length ? args : walk("posts");
  return files.map((file) => ({ file, text: fs.readFileSync(file, "utf8") }));
}

// Blanks out code (keeping line numbers) so links inside examples aren't checked.
const withoutCode = (text) =>
  text.replace(/^```[\s\S]*?^```/gm, (block) => block.replace(/[^\n]/g, " ")).replace(/`[^`\n]*`/g, (code) => " ".repeat(code.length));

function linksIn(text) {
  const links = [];
  withoutCode(text)
    .split("\n")
    .forEach((line, i) => {
      // `[text] (url)` renders as literal text, not a link.
      for (const m of line.matchAll(/\]\s+\(<?(https?:\/\/[^)>\s]+)>?\)/g)) {
        links.push({ line: i + 1, url: m[1], problem: "space between ] and ( — renders as plain text" });
      }
      for (const m of line.matchAll(/\]\(<?([^)>\s]+)>?(?:\s+"[^"]*")?\)/g)) links.push({ line: i + 1, url: m[1] });
    });
  return links;
}

function internalSlug(url) {
  const pathname = url.startsWith(SITE_URL) ? url.slice(SITE_URL.length) :url.startsWith("/") ? url : null;
  const m = pathname?.match(/^\/post\/([^?#]+?)\/?(?:[?#].*)?$/);
  return m ? decodeURIComponent(m[1]) : null;
}

async function request(url, method) {
  return fetch(url, {
    method,
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "user-agent": "Mozilla/5.0 (link checker for ryansblog)" },
  });
}

const checked = new Map();

// Resolves to { error } for a broken link, { warning } for an unverifiable one, or {}.
function checkUrl(url) {
  if (!checked.has(url)) checked.set(url, checkUncached(url));
  return checked.get(url);
}

async function checkUncached(url) {
  const slug = internalSlug(url);
  if (slug !== null) return slugs.has(slug) ? {} : { error: `no post at posts/${slug}.md` };
  if (url.startsWith("#") || url.startsWith("mailto:")) return {};
  if (!/^https?:\/\//.test(url)) return fs.existsSync(path.join("public", url)) ? {} : { error: "relative link to a missing file" };

  try {
    let res = await request(url, "HEAD");
    // Plenty of servers reject or mishandle HEAD.
    if (!res.ok) res = await request(url, "GET");
    if (res.ok) return {};
    return SOFT_STATUSES.has(res.status) ? { warning: `HTTP ${res.status} (may be blocking bots)` } : { error: `HTTP ${res.status}` };
  } catch (e) {
    return { warning: e.name === "TimeoutError" ? "timed out" : `request failed (${e.cause?.code || e.message})` };
  }
}

const results = await Promise.all(
  sources().flatMap(({ file, text }) =>
    linksIn(text).map(async (link) => ({ file, ...link, ...(link.problem ? { error: link.problem } : await checkUrl(link.url)) }))
  )
);

const errors = results.filter((r) => r.error);
for (const r of results.filter((r) => r.warning)) console.warn(`check-links: warning ${r.file}:${r.line} ${r.url} — ${r.warning}`);
for (const r of errors) console.error(`check-links: broken ${r.file}:${r.line} ${r.url} — ${r.error}`);
if (errors.length) {
  console.error(`check-links: ${errors.length} broken link(s). Fix them, or commit with --no-verify to skip.`);
  process.exit(1);
}

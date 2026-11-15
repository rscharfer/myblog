#!/usr/bin/env node
// Fast HTTP smoke test of a running blog server (dev or `next start`).
//
//   node .claude/skills/verify-change/smoke.mjs [baseUrl] [path ...]
//
// With no paths it tests every post found under posts/ (and the home page).
// Per page it checks: status 200; every <img> and stylesheet it references loads;
// no leftover "TODO(Ryan)", "[object Object]" or Next error text; and that a post
// whose Markdown has ::flowchart / ::figure / :::side renders the matching markup.
// Exit code 1 if anything fails. This does not replace looking at the page in a browser.

import fs from "node:fs";
import path from "node:path";

const [base = "http://localhost:3000", ...given] = process.argv.slice(2);
const root = process.cwd();

function postFiles(dir = path.join(root, "posts")) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return postFiles(p);
    return e.name.endsWith(".md") ? [p] : [];
  });
}

const sources = {}; // url path -> markdown source
for (const f of postFiles()) {
  const slug = path.relative(path.join(root, "posts"), f).replace(/\.md$/, "");
  sources[`/post/${slug}`] = fs.readFileSync(f, "utf8");
}
const pages = given.length ? given : ["/", ...Object.keys(sources)];

// Markdown feature -> a string the rendered HTML must contain.
const EXPECT = [
  [/^::flowchart\{/m, "fc-walkthrough", "interactive flow chart"],
  [/^::figure\{/m, "<figure", "figure"],
  [/^:::side\{/m, 'class="side', "sidenote"],
  [/^```/m, 'class="code"', "code block"],
];
const BAD = ["TODO(Ryan)", "[object Object]", "Application error", "Unhandled Runtime Error", "ReferenceError", ">undefined<"];

let failures = 0;
const fail = (page, msg) => (failures++, console.log(`  FAIL  ${page}: ${msg}`));

async function get(url) {
  try {
    return await fetch(url, { redirect: "follow" });
  } catch (e) {
    return { status: 0, text: async () => "", error: e.message };
  }
}

for (const page of pages) {
  const res = await get(base + page);
  if (res.status !== 200) {
    fail(page, `status ${res.status}${res.error ? ` (${res.error})` : ""}`);
    continue;
  }
  const html = await res.text();
  const problems = [];

  for (const s of BAD) if (html.includes(s)) problems.push(`page contains "${s}"`);
  for (const [re, needle, label] of EXPECT) {
    if (sources[page] && re.test(sources[page]) && !html.includes(needle)) problems.push(`Markdown has a ${label} but the HTML has no "${needle}"`);
  }

  // Images, stylesheets and the page's own scripts must load.
  const refs = new Set();
  for (const m of html.matchAll(/<img[^>]+src="([^"]+)"/g)) refs.add(m[1]);
  for (const m of html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)) refs.add(m[1]);
  for (const m of html.matchAll(/<script[^>]+src="(\/_next\/[^"]+)"/g)) refs.add(m[1]);
  for (const ref of refs) {
    if (/^(data:|https?:\/\/(?!localhost))/.test(ref)) continue;
    const url = ref.startsWith("http") ? ref : base + ref;
    const r = await get(url);
    if (r.status !== 200) problems.push(`${ref} -> ${r.status}`);
  }

  if (problems.length) problems.forEach((p) => fail(page, p));
  else console.log(`  ok    ${page} (${refs.size} assets)`);
}

console.log(failures ? `\n${failures} problem(s)` : "\nAll pages ok");
process.exit(failures ? 1 : 0);

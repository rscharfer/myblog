#!/usr/bin/env node
// Validates interactive flow chart data files (components/post/flows/*.js).
//
//   node .claude/skills/new-flow/check-flow.mjs                 # every flow file
//   node .claude/skills/new-flow/check-flow.mjs path/to/flow.js # specific files
//
// Errors (exit 1) are things that break the page or mis-render it. Warnings are
// things that are probably wrong. Also checks the flow is registered in FLOWS
// (components/post/flowchart/FlowChart.js) and used by a post.

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const flowsDir = path.join(root, "components/post/flows");
const LEVELS = ["required", "recommended", "optional"];
const CHANNELS = ["front", "back"];
const STEP_KEYS = ["id", "short", "title", "arrows", "at", "summary", "tags", "checks", "checksLabel", "message", "paramsLabel", "params", "notShown"];
const MESSAGE_KEYS = ["title", "lang", "code", "mark", "caption"];
const PARAM_KEYS = ["name", "line", "level", "why", "tags"];

let errors = 0;
let warnings = 0;
const err = (file, msg) => (errors++, console.log(`  ERROR  ${msg}`));
const warn = (file, msg) => (warnings++, console.log(`  warn   ${msg}`));

async function load(file) {
  const src = fs.readFileSync(file, "utf8");
  const mod = await import(`data:text/javascript;base64,${Buffer.from(src).toString("base64")}`);
  const exports = Object.entries(mod);
  if (exports.length !== 1) throw new Error(`expected exactly one named export, found ${exports.length}`);
  return exports[0]; // [exportName, flow]
}

// Reads FLOWS = { "kebab-name": importedName, ... } from FlowChart.js.
function registered() {
  const src = fs.readFileSync(path.join(root, "components/post/flowchart/FlowChart.js"), "utf8");
  const body = src.match(/const FLOWS = \{([\s\S]*?)\};/)?.[1] || "";
  const imports = Object.fromEntries(
    [...src.matchAll(/import \{ (\w+) \} from "\.\.\/flows\/(\w+)"/g)].map(([, name, file]) => [name, file]),
  );
  const map = {}; // key -> export name
  for (const m of body.matchAll(/(?:"([\w-]+)"|([\w]+))\s*:\s*(\w+)/g)) map[m[1] || m[2]] = m[3];
  return { map, imports };
}

// ::flowchart{flow="x"} usages: { x: ["posts/a/b.md", ...] }
function usages() {
  const used = {};
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".md")) {
        for (const m of fs.readFileSync(p, "utf8").matchAll(/^::flowchart\{flow="([^"]+)"\}/gm)) {
          (used[m[1]] ||= []).push(path.relative(root, p));
        }
      }
    }
  };
  walk(path.join(root, "posts"));
  walk(path.join(root, "design/fixtures"));
  return used;
}

function checkFlow(file, name, flow, reg, used) {
  const nonEmpty = (v) => typeof v === "string" && v.trim() !== "";
  for (const k of ["title", "before", "start", "end"]) if (!nonEmpty(flow[k])) err(file, `flow.${k} must be a non-empty string`);

  // Lanes
  const lanes = new Set();
  if (!Array.isArray(flow.lanes) || flow.lanes.length < 2) err(file, "flow.lanes needs at least 2 lanes");
  for (const l of flow.lanes || []) {
    if (!nonEmpty(l.id) || !nonEmpty(l.short) || !nonEmpty(l.name)) err(file, `lane ${JSON.stringify(l)} needs id, short and name`);
    if (lanes.has(l.id)) err(file, `duplicate lane id "${l.id}"`);
    lanes.add(l.id);
    if (l.short?.length > 14) warn(file, `lane "${l.id}" short label "${l.short}" is long (${l.short.length} chars); it must fit a column header on a phone`);
  }
  if ((flow.lanes || []).length > 6) warn(file, `${flow.lanes.length} lanes; columns get narrow, especially on a phone`);

  // Steps
  const steps = flow.steps || [];
  if (steps.length === 0) err(file, "flow.steps is empty");
  const ids = new Set();
  const usedLanes = new Set();
  steps.forEach((s, i) => {
    const at = `step ${i + 1} ("${s.id}")`;
    for (const k of Object.keys(s)) if (!STEP_KEYS.includes(k)) warn(file, `${at}: unknown key "${k}" (ignored by the renderer)`);
    for (const k of ["id", "short", "title", "summary"]) if (!nonEmpty(s[k])) err(file, `${at}: "${k}" must be a non-empty string`);
    if (ids.has(s.id)) err(file, `${at}: duplicate step id`);
    ids.add(s.id);
    if (s.short?.length > 40) warn(file, `${at}: "short" is ${s.short.length} chars; it is the row label in the diagram`);

    if (Boolean(s.at) === Boolean(s.arrows)) err(file, `${at}: needs exactly one of "arrows" or "at" (a step on one lane)`);
    if (s.at) {
      if (!lanes.has(s.at)) err(file, `${at}: "at" lane "${s.at}" does not exist`);
      usedLanes.add(s.at);
    }
    for (const a of s.arrows || []) {
      for (const end of ["from", "to"]) {
        if (!lanes.has(a[end])) err(file, `${at}: arrow ${end} "${a[end]}" is not a lane id`);
        usedLanes.add(a[end]);
      }
      if (a.from === a.to) err(file, `${at}: arrow from and to are both "${a.from}"; use "at" for a step on one lane`);
      if (!CHANNELS.includes(a.channel)) err(file, `${at}: arrow channel "${a.channel}" must be one of ${CHANNELS.join("/")}`);
    }
    if (s.arrows && s.arrows.length === 0) err(file, `${at}: "arrows" is empty`);

    // "step N" references in prose must exist
    const prose = [s.summary, s.notShown, ...(s.checks || []), ...(s.params || []).map((p) => p.why)].filter(Boolean).join("\n");
    for (const m of prose.matchAll(/\bsteps? (\d+)/gi)) {
      if (Number(m[1]) > steps.length || Number(m[1]) < 1) err(file, `${at}: text mentions "step ${m[1]}" but the flow has ${steps.length} steps`);
      else if (Number(m[1]) === i + 1) warn(file, `${at}: text refers to its own step number`);
    }

    // Message + params
    const m = s.message;
    const params = s.params || [];
    if (!m) {
      if (params.length) err(file, `${at}: has params but no message (params point at lines of the message)`);
      return;
    }
    for (const k of Object.keys(m)) if (!MESSAGE_KEYS.includes(k)) warn(file, `${at}: message has unknown key "${k}"`);
    for (const k of ["title", "lang", "code"]) if (!nonEmpty(m[k])) err(file, `${at}: message.${k} must be a non-empty string`);
    if (typeof m.code !== "string") return;
    const lines = m.code.split("\n");
    if (!params.length && lines.length > 2) warn(file, `${at}: message has no params; every parameter that matters should explain why it is there`);
    const seenNames = new Set();
    const seenLines = new Set();
    for (const p of params) {
      const pt = `${at}, param "${p.name}"`;
      for (const k of Object.keys(p)) if (!PARAM_KEYS.includes(k)) warn(file, `${pt}: unknown key "${k}"`);
      if (!nonEmpty(p.name) || !nonEmpty(p.why)) err(file, `${pt}: needs name and why`);
      if (seenNames.has(p.name)) err(file, `${pt}: duplicate name (names are React keys)`);
      seenNames.add(p.name);
      if (!Number.isInteger(p.line) || p.line < 1 || p.line > lines.length) {
        err(file, `${pt}: line ${p.line} is outside the message (1-${lines.length})`);
      } else {
        const text = lines[p.line - 1];
        const squash = (x) => x.toLowerCase().replace(/[\s_-]/g, "");
        if (!squash(text).includes(squash(p.name))) {
          warn(file, `${pt}: not found on line ${p.line} (${JSON.stringify(text.trim().slice(0, 50))}); check the line number`);
        }
        if (seenLines.has(p.line)) warn(file, `${pt}: line ${p.line} is already used by another param`);
        seenLines.add(p.line);
      }
      if (p.level !== undefined && !LEVELS.includes(p.level)) err(file, `${pt}: level "${p.level}" must be one of ${LEVELS.join("/")} (or omitted)`);
    }
    for (const mk of (m.mark || "").split(",").map((x) => x.trim().replace(/@\d+$/, "")).filter(Boolean)) {
      if (!m.code.includes(mk)) warn(file, `${at}: mark "${mk}" does not occur in the message code`);
    }
  });
  for (const id of lanes) if (!usedLanes.has(id)) warn(file, `lane "${id}" is never used by a step`);

  // Registration and use
  const key = Object.entries(reg.map).find(([, n]) => n === name)?.[0];
  const base = path.basename(file, ".js");
  if (reg.imports[name] !== base) err(file, `${name} is not imported from "../flows/${base}" in FlowChart.js`);
  if (!key) err(file, `${name} is not registered in FLOWS in components/post/flowchart/FlowChart.js`);
  else if (!used[key]) warn(file, `registered as flow="${key}" but no post uses ::flowchart{flow="${key}"}`);
  else console.log(`  used as flow="${key}" in ${used[key].join(", ")}`);
}

const args = process.argv.slice(2);
const files = (args.length ? args : fs.readdirSync(flowsDir).filter((f) => f.endsWith(".js")).map((f) => path.join(flowsDir, f))).map((f) => path.resolve(f));
const reg = registered();
const used = usages();

for (const file of files) {
  console.log(path.relative(root, file));
  try {
    const [name, flow] = await load(file);
    checkFlow(file, name, flow, reg, used);
    console.log(`  ${flow.steps?.length ?? 0} steps, ${flow.lanes?.length ?? 0} lanes`);
  } catch (e) {
    err(file, `could not load: ${e.message}`);
  }
}

// Posts that name a flow nobody registered
for (const [key, posts] of Object.entries(used)) {
  if (!reg.map[key]) {
    errors++;
    console.log(`ERROR  flow="${key}" used in ${posts.join(", ")} is not registered in FLOWS`);
  }
}

console.log(`\n${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);

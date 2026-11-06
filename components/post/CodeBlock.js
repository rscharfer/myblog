import { useState } from "react";
import Highlight, { defaultProps } from "prism-react-renderer";

// Prism token types -> the design's syntax classes (coloured by the syn-* tokens).
const CLASSES = [
  ["t-c", ["comment", "prolog", "doctype", "cdata"]],
  ["t-s", ["string", "char", "attr-value", "template-string", "regex", "url"]],
  ["t-f", ["function", "class-name", "maybe-class-name"]],
  ["t-p", ["property", "attr-name", "parameter", "property-access"]],
  ["t-k", ["keyword", "boolean", "number", "constant", "tag", "builtin", "important"]],
];

function tokenClass(types) {
  if (types.includes("punctuation") || types.includes("operator") || types.includes("plain")) return undefined;
  const hit = CLASSES.find(([, names]) => types.some((t) => names.includes(t)));
  return hit && hit[0];
}

const LANGUAGES = { js: "jsx", javascript: "jsx", ts: "tsx", typescript: "tsx", sh: "bash", shell: "bash", html: "markup" };

// ```js title="pkce.js" {2-3,11} caption="What to notice" mark="openid,id_token@4"
export function parseMeta(meta = "") {
  const attr = (name) => meta.match(new RegExp(`${name}="([^"]*)"`))?.[1];
  const lines = new Set();
  const ranges = meta.replace(/"[^"]*"/g, "").match(/\{([\d,\s-]+)\}/)?.[1] || "";
  for (const part of ranges.split(",").map((s) => s.trim()).filter(Boolean)) {
    const [a, b = a] = part.split("-").map(Number);
    for (let n = a; n <= b; n++) lines.add(n);
  }
  // mark="a,b@3": strings to wrap in the OIDC mark, everywhere or only on one line.
  const marks = (attr("mark") || "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean)
    .map((m) => {
      const at = m.match(/^(.*)@(\d+)$/);
      return at ? { text: at[1], line: Number(at[2]) } : { text: m, line: null };
    })
    .filter((m) => m.text);
  return { title: attr("title"), caption: attr("caption"), lines, marks };
}

// Character ranges [start, end) of the marked strings in one line of code.
function markRanges(lineText, lineNo, marks) {
  const ranges = [];
  for (const { text, line } of marks) {
    if (line && line !== lineNo) continue;
    for (let i = lineText.indexOf(text); i !== -1; i = lineText.indexOf(text, i + text.length)) {
      ranges.push([i, i + text.length]);
    }
  }
  return ranges;
}

// Splits a line's tokens at mark boundaries, so a marked string can sit inside one
// token (a word in a string) or span several (an object key and its value).
function renderLine(line, lineNo, marks) {
  const ranges = markRanges(line.map((t) => t.content).join(""), lineNo, marks);
  const inMark = (i) => ranges.some(([a, b]) => i >= a && i < b);
  const pieces = [];
  let offset = 0;
  line.forEach((token) => {
    const cls = tokenClass(token.types);
    const cuts = new Set([0, token.content.length]);
    ranges.forEach(([a, b]) => [a, b].forEach((x) => x > offset && x < offset + token.content.length && cuts.add(x - offset)));
    const sorted = [...cuts].sort((a, b) => a - b);
    for (let j = 0; j < sorted.length - 1; j++) {
      const text = token.content.slice(sorted[j], sorted[j + 1]);
      pieces.push({ text, cls, marked: inMark(offset + sorted[j]) });
    }
    offset += token.content.length;
  });
  // Group consecutive marked pieces into one <mark> so the underline is continuous.
  const out = [];
  pieces.forEach((p, k) => {
    const span = <span key={k} className={p.cls}>{p.text}</span>;
    const last = out[out.length - 1];
    if (p.marked && last?.marked) last.children.push(span);
    else out.push({ marked: p.marked, children: [span] });
  });
  return out.map((g, k) => (g.marked ? <mark key={`m${k}`} className="oidc">{g.children}</mark> : g.children[0]));
}

export default function CodeBlock({ code, lang, meta }) {
  const { title, caption, lines, marks } = parseMeta(meta);
  const [copied, setCopied] = useState(false);

  // Copies the original source, never the visually wrapped lines.
  const copy = () => {
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    };
    try {
      navigator.clipboard.writeText(code).then(done, done);
    } catch (_) {
      done();
    }
  };

  return (
    <figure className="code">
      <div className="cap">
        <span>{title || lang || "code"}</span>
        <button type="button" data-copy onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <Highlight {...defaultProps} theme={undefined} code={code} language={LANGUAGES[lang] || lang || "jsx"}>
        {({ tokens }) => (
          // Focusable so keyboard users can scroll long lines (they only wrap on phones).
          <pre tabIndex={0}>
            <code>
              {tokens.map((line, i) => (
                <span
                  key={i}
                  className={[
                    "ln",
                    lines.has(i + 1) && "hl",
                    // Lines with an OIDC mark get an "OIDC" label at the end (drawn by CSS).
                    markRanges(line.map((t) => t.content).join(""), i + 1, marks).length > 0 && "has-oidc",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {line.every((t) => t.empty || t.content === "")
                    ? " "
                    : renderLine(line, i + 1, marks)}
                </span>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

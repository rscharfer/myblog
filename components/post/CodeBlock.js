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

// ```js title="pkce.js" {2-3,11} caption="What to notice"
export function parseMeta(meta = "") {
  const attr = (name) => meta.match(new RegExp(`${name}="([^"]*)"`))?.[1];
  const lines = new Set();
  const ranges = meta.replace(/"[^"]*"/g, "").match(/\{([\d,\s-]+)\}/)?.[1] || "";
  for (const part of ranges.split(",").map((s) => s.trim()).filter(Boolean)) {
    const [a, b = a] = part.split("-").map(Number);
    for (let n = a; n <= b; n++) lines.add(n);
  }
  return { title: attr("title"), caption: attr("caption"), lines };
}

export default function CodeBlock({ code, lang, meta }) {
  const { title, caption, lines } = parseMeta(meta);
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
                <span key={i} className={lines.has(i + 1) ? "ln hl" : "ln"}>
                  {line.every((t) => t.empty || t.content === "")
                    ? " "
                    : line.map((token, k) => (
                        <span key={k} className={tokenClass(token.types)}>
                          {token.content}
                        </span>
                      ))}
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

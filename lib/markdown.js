// Remark plugins that turn plain Markdown into the design's post elements.
// They run twice with identical output: at build time (lib/posts.js, for the
// contents list and reading time) and when react-markdown renders the post.
import { visit, SKIP } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import remarkDirective from "remark-directive";

const h = (hName, hProperties, children = []) => ({
  type: "blogNode",
  data: { hName, hProperties },
  children,
});
const text = (value) => ({ type: "text", value });

export function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Footnotes written as a marker at the end of a heading ("... in play †") and a
// paragraph starting with the same marker ("† When an app ..."). The heading
// marker becomes a link to the paragraph, and the paragraph becomes a note.
const MARKERS = ["†", "‡"];

function markerNotes() {
  return (tree) => {
    let n = 0;
    visit(tree, "paragraph", (node, index, parent) => {
      const first = node.children[0];
      if (!first || first.type !== "text") return;
      const marker = MARKERS.find((m) => first.value.startsWith(m + " "));
      if (!marker) return;

      // Find the heading that references this marker.
      const heading = parent.children
        .slice(0, index)
        .reverse()
        .find((c) => c.type === "heading" && headingMarker(c) === marker);
      if (!heading) return;

      const id = `note-${++n}`;
      const last = heading.children[heading.children.length - 1];
      last.value = last.value.replace(new RegExp(`\\s*${marker}\\s*$`), "");
      heading.children.push(
        h("sup", { className: ["dagger"] }, [
          { type: "link", url: `#${id}`, data: { hProperties: { "aria-label": "See the note" } }, children: [text(marker)] },
        ])
      );

      first.value = first.value.slice(marker.length + 1);
      parent.children[index] = h("div", { id, className: ["fn-target"] }, [
        h("aside", { className: ["note"] }, [h("div", { className: ["kicker"] }, [text(`${marker} Note`)]), node]),
      ]);
      return SKIP;
    });
  };
}

function headingMarker(heading) {
  const last = heading.children[heading.children.length - 1];
  if (!last || last.type !== "text") return null;
  return MARKERS.find((m) => last.value.trimEnd().endsWith(m)) || null;
}

// Stable ids for every heading. Honours the old `## id=my-id Heading` syntax.
function headingIds() {
  return (tree) => {
    const seen = new Map();
    visit(tree, "heading", (node) => {
      let id;
      const first = node.children[0];
      const legacy = first && first.type === "text" && first.value.match(/^id=(.+?)\s/);
      if (legacy) {
        id = legacy[1];
        first.value = first.value.slice(legacy[0].length);
      }
      const title = toString(node.children.filter((c) => c.type !== "blogNode")).trim();
      if (!id) {
        const base = slugify(title) || "section";
        const count = seen.get(base) || 0;
        seen.set(base, count + 1);
        id = count ? `${base}-${count}` : base;
      }
      node.data = { ...node.data, id, title, hProperties: { ...node.data?.hProperties, id } };
    });
  };
}

// :::note[Label]{#id}  ...  :::     and     ::figure{wide="x.svg" narrow="y.svg" caption="..."}
function directives() {
  return (tree) => {
    let fig = 0;
    visit(tree, (node, index, parent) => {
      if (node.type === "containerDirective" && node.name === "note") {
        const labelNode = node.children[0]?.data?.directiveLabel ? node.children.shift() : null;
        const label = labelNode ? labelNode.children : [text("Note")];
        const aside = h("aside", { className: ["note"] }, [h("div", { className: ["kicker"] }, label), ...node.children]);
        const id = node.attributes?.id;
        parent.children[index] = id ? h("div", { id, className: ["fn-target"] }, [aside]) : aside;
        return SKIP;
      }
      if (node.type === "leafDirective" && node.name === "figure") {
        const { wide, narrow, caption = "", label } = node.attributes || {};
        parent.children[index] = h("figure", {
          className: ["diagram"],
          dataWide: wide,
          dataNarrow: narrow || wide,
          dataCaption: caption,
          dataLabel: label || `Fig. ${++fig}`,
        });
        return SKIP;
      }
      // Anything else that looks like a directive is put back as the text it was written as.
      if (/Directive$/.test(node.type) && parent) {
        const raw = `${node.type === "textDirective" ? ":" : node.type === "leafDirective" ? "::" : ":::"}${node.name}`;
        parent.children.splice(index, 1, text(raw), ...(node.children || []));
        return index;
      }
    });
  };
}

// Ordered lists become numbered steps; lists of "**Term:** definition" become icon lists;
// a blockquote whose last line starts with "— " gets that line as its attribution.
function blocks({ icons = {} } = {}) {
  return (tree) => {
    visit(tree, "list", (node) => {
      if (node.ordered) {
        node.data = { hProperties: { className: ["steps"] } };
        node.children.forEach((li) => {
          li.children = [h("div", {}, li.children)];
        });
        return;
      }
      const terms = node.children.map(termOf);
      if (!terms.every(Boolean)) return;
      node.data = { hProperties: { className: ["ilist"] } };
      node.children.forEach((li, i) => {
        const { strong, rest } = terms[i];
        const kind = icons[toString(strong)];
        li.data = { hProperties: { className: kind ? [`k-${kind}`] : [] } };
        li.children = [
          h("span", { className: ["ic"], dataIcon: kind || null }),
          h("span", {}, [strong, text(" "), h("span", { className: ["dash"] }, [text("—")]), text(" "), ...rest]),
        ];
      });
    });

    visit(tree, "blockquote", (node) => {
      const last = node.children[node.children.length - 1];
      const first = last?.type === "paragraph" && last.children[0];
      if (!first || first.type !== "text" || !/^(—|--)\s/.test(first.value)) return;
      first.value = first.value.replace(/^(—|--)\s/, "");
      node.children[node.children.length - 1] = h("footer", {}, last.children);
    });
  };
}

// "**Term:** definition" -> { strong: Term, rest: definition }, or null. Doesn't mutate.
function termOf(li) {
  const p = li.children[0];
  if (li.children.length !== 1 || p.type !== "paragraph") return null;
  const [strong, ...rest] = p.children;
  if (strong?.type !== "strong") return null;
  const last = strong.children[strong.children.length - 1];
  const trim = (nodes) => (nodes[0]?.type === "text" ? [text(nodes[0].value.replace(/^\s+/, "")), ...nodes.slice(1)] : nodes);
  if (last?.type === "text" && last.value.endsWith(":")) {
    const children = [...strong.children.slice(0, -1), text(last.value.slice(0, -1))];
    return { strong: { ...strong, children }, rest: trim(rest) };
  }
  if (rest[0]?.type === "text" && rest[0].value.startsWith(":")) {
    return { strong, rest: trim([text(rest[0].value.slice(1)), ...rest.slice(1)]) };
  }
  return null;
}

export function remarkPlugins(options) {
  return [remarkDirective, directives, markerNotes, headingIds, [blocks, options]];
}

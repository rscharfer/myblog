// Build-time post loading. Only import this from getStaticProps / getStaticPaths.
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";

import { remarkPlugins } from "./markdown";
import { validateDate, latestFirst } from "../utils/publishDate.tsx";

const POSTS_DIR = path.join(process.cwd(), "posts");
// A post that exercises every design element. Only built with SHOW_FIXTURES=1.
const FIXTURES_DIR = path.join(process.cwd(), "design", "fixtures");
const FIXTURE_PREFIX = "_fixtures";
const WORDS_PER_MINUTE = 230;

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : entry.name.endsWith(".md") ? [full] : [];
  });
}

function fileFor(slug) {
  return slug.startsWith(FIXTURE_PREFIX + "/")
    ? path.join(FIXTURES_DIR, slug.slice(FIXTURE_PREFIX.length + 1) + ".md")
    : path.join(POSTS_DIR, slug + ".md");
}

// "react19" -> "React 19", "authentication" -> "Authentication"
export function topicLabel(segment) {
  return segment.replace(/^./, (c) => c.toUpperCase()).replace(/(\D)(\d+)$/, "$1 $2");
}

// "October 29, 2026" -> { iso, short: "Oct 29", long: "October 29, 2026", year }
function formatDate(date) {
  const d = validateDate(date);
  const month = MONTHS[d.getMonth()];
  const pad = (n) => String(n).padStart(2, "0");
  return {
    iso: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    short: `${month.slice(0, 3)} ${d.getDate()}`,
    long: `${month} ${d.getDate()}, ${d.getFullYear()}`,
    year: String(d.getFullYear()),
  };
}

function summary(slug, data) {
  return {
    slug,
    title: data.title,
    // "{:}" is the existing escape for a colon in front matter.
    subtitle: (data.subtitle || "").replace("{:}", ":").trim(),
    topic: topicLabel(slug.split("/").filter((s) => s !== FIXTURE_PREFIX)[0]),
    created: formatDate(data.created),
    // Only set once the post has been edited; scripts/stamp-updated.mjs writes it on commit.
    updated: data.updated ? formatDate(data.updated) : null,
  };
}

export function postSlugs({ fixtures = process.env.SHOW_FIXTURES === "1" } = {}) {
  const slugs = walk(POSTS_DIR).map((f) => path.relative(POSTS_DIR, f).replace(/\.md$/, "").split(path.sep).join("/"));
  if (fixtures && fs.existsSync(FIXTURES_DIR)) {
    fs.readdirSync(FIXTURES_DIR)
      .filter((f) => f.endsWith(".md"))
      .forEach((f) => slugs.push(`${FIXTURE_PREFIX}/${f.replace(/\.md$/, "")}`));
  }
  return slugs;
}

// Newest first by `created`; updates don't reorder the list.
export function allPosts() {
  return postSlugs({ fixtures: false })
    .map((slug) => summary(slug, matter(fs.readFileSync(fileFor(slug), "utf8")).data))
    .sort((a, b) => latestFirst(validateDate(a.created.long), validateDate(b.created.long)));
}

export function loadPost(slug) {
  const file = fileFor(slug);
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const icons = data.icons || {};

  const processor = unified().use(remarkParse).use(remarkPlugins({ icons }));
  const tree = processor.runSync(processor.parse(content));

  const toc = [];
  const figures = {};
  visit(tree, (node) => {
    if (node.type === "heading" && (node.depth === 2 || node.depth === 3)) {
      toc.push({ id: node.data.id, title: node.data.title, depth: node.depth });
    }
    const props = node.data?.hProperties;
    if (node.data?.hName === "figure" && props?.dataWide) {
      for (const name of [props.dataWide, props.dataNarrow]) {
        figures[name] = fs.readFileSync(path.join(path.dirname(file), name), "utf8");
      }
    }
  });

  const words = toString(tree).split(/\s+/).filter(Boolean).length;

  return {
    ...summary(slug, data),
    markdown: content,
    icons,
    related: data.related || [],
    // Open Graph image, a path under public/ (e.g. "/og/authentication/PKCE.png"). The avatar is used until it's set.
    image: data.image || null,
    toc,
    figures,
    readingTime: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
  };
}

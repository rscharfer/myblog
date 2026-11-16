// Build-time only. Writes public/feed.xml (RSS 2.0) so `next export` copies it into out/.
// Called from the home page's getStaticProps next to writeSitemap.
import fs from "fs";
import path from "path";

import { site } from "./site";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// Front matter dates have no time; RSS wants an RFC 822 date, so use midnight UTC.
const rfc822 = (iso) => new Date(`${iso}T00:00:00Z`).toUTCString();

export function writeFeed(posts) {
  const items = posts.map((post) => {
    const url = `${site.url}/post/${post.slug}`;
    return [
      "    <item>",
      `      <title>${esc(post.title)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      `      <pubDate>${rfc822(post.created.iso)}</pubDate>`,
      post.subtitle ? `      <description>${esc(post.subtitle)}</description>` : null,
      "    </item>",
    ].filter(Boolean).join("\n");
  });
  const latest = posts.map((p) => (p.updated || p.created).iso).sort().at(-1);
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${esc(site.name)}</title>`,
    `    <link>${site.url}/</link>`,
    `    <description>${esc(site.description)}</description>`,
    "    <language>en</language>",
    `    <atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml" />`,
    latest ? `    <lastBuildDate>${rfc822(latest)}</lastBuildDate>` : null,
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].filter((l) => l !== null).join("\n");
  fs.writeFileSync(path.join(process.cwd(), "public", "feed.xml"), xml);
}

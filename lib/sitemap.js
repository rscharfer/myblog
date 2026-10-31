// Build-time only. Writes public/sitemap.xml so `next export` copies it into out/.
// Called from the home page's getStaticProps, which already has the post list.
import fs from "fs";
import path from "path";

import { site } from "./site";

export function writeSitemap(posts) {
  const postUrls = posts.map((post) => ({
    loc: `${site.url}/post/${post.slug}`,
    lastmod: (post.updated || post.created).iso,
  }));
  // Posts are sorted by created date, so the most recent change can be anywhere in the list.
  const latest = postUrls.map((u) => u.lastmod).sort().at(-1);
  const urls = [{ loc: `${site.url}/`, lastmod: latest }, { loc: `${site.url}/about` }, ...postUrls];
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(({ loc, lastmod }) => `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`),
    "</urlset>",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(process.cwd(), "public", "sitemap.xml"), xml);
}

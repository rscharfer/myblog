---
name: update-seo
description: Audit and improve search-engine and AI-search optimization for the Worked Examples blog. Runs audit.mjs against the built site (titles, descriptions, canonicals, noindex, robots.txt, Open Graph, JSON-LD, sitemap, alt text, links, Netlify redirect), compares findings with the rules in docs/seo-report.md, proposes fixes, applies the approved code/config ones, then verifies with a build, the audit and the verify-change skill. Use when Ryan asks to audit, improve or update SEO, or after changes to components/Layout.js, pages/_document.js, lib/sitemap.js, lib/site.js, public/robots.txt, netlify.toml or post metadata.
---

# Update SEO

Source of truth for every rule is [docs/seo-report.md](../../../docs/seo-report.md) (fact-checked against Google, OpenAI and Anthropic pages on 2026-11-15; its section 8 is the checklist this skill automates, ids A1-A33 and B1-B11). Read it before proposing anything, and re-check vendor crawler pages before changing crawler policy (B10); they change.

Ground rules from CLAUDE.md that apply here:

- **Never edit post content or front matter.** `title`, `subtitle` (the meta description), `image`, `created`, `updated` and the body are Ryan's. Propose the change in the report; he makes it or asks you to. Never write `updated:` or edit `created:`; the pre-commit hook stamps `updated:`.
- Code and config are fine to change: `components/`, `pages/`, `lib/`, `public/robots.txt`, `netlify.toml`, `styles/`. Don't move or rename posts (the folder is the URL).
- Don't commit without asking (use the task-boundary rule in CLAUDE.md: propose message and file list). Never push or deploy.

## 1. Audit

```sh
npm run build && npm run export        # the audit reads out/, so build first; it needs no server
node .claude/skills/update-seo/audit.mjs
```

It prints PASS / WARN / ERROR per check id with the page, and exits 1 on any ERROR (2 if there is no `out/`). `--quiet` hides passing checks; `--out <dir>` / `--repo <dir>` point at another copy. It covers A1-A33 from the report; the B checks are manual (step 7).

## 2. Review findings against the report

Don't just forward the output. For each ERROR/WARN decide:

- **Real defect or false positive?** Open the built HTML (`out/...html`) and the source (`components/Layout.js`, `lib/sitemap.js`) to confirm. If the script is wrong, fix the script.
- **Is it a rule or a rule of thumb?** ERRORs are mechanical failures (missing/duplicate title, bad canonical, `noindex`, `Disallow: /`, unparseable JSON-LD, sitemap mismatch, broken internal link, missing alt attribute, lost 301). WARNs are advice. A2 (title about 60 characters) is a rule of thumb; Google sets no limit. A14, A9, A15, A31, A32 are known gaps listed in report section 1.
- **Who owns the fix?** Layout/lib/config: you propose and, once approved, change it. Post front matter or content (long titles, thin posts, missing `image:`, empty alt text in a figure, missing `subtitle`): Ryan only.

## 3. Propose fixes

Present a short list, ordered like report section 5, each with: check id, what is wrong, the exact change, which files, and whether it is code (you can do it) or content (Ryan). Examples of code-side fixes the report supports:

- Emit `datePublished`/`dateModified` with a timezone offset in the JSON-LD (A14); `sameAs` (from `site.github`, `site.linkedin`) on the author; `WebSite` JSON-LD on the home page; multiple image ratios if available.
- Always `twitter:card=summary_large_image` once a real share image exists; `og:image:alt`.
- RSS/Atom feed plus `<link rel="alternate" type="application/rss+xml">`.
- AI-crawler policy recorded in `public/robots.txt` (see below).

Wait for Ryan's go-ahead before changing anything.

## 4. Apply approved fixes

Make the smallest change that fixes the check. Keep the canonical host in `lib/site.js` as the single source. Keep `public/sitemap.xml` generated (git-ignored build output); fix `lib/sitemap.js`, not the file. After a Layout/head change, remember `Layout.js` also feeds the home and About pages.

## 5. What NOT to do

From the report (sections 3, 4 and 5.8); each is something Google says it ignores or penalizes:

- No `llms.txt` (or other "AI text files") for Google's sake; Google Search doesn't use them. A28 warns if one appears.
- No `<priority>` or `<changefreq>` in the sitemap; Google ignores them. `lastmod` only from a real content change (`updated`/`created`), never "now" on every build.
- No `<meta name="keywords">`, no keyword stuffing, no word-count targets.
- No special AI schema or chunking of content into tiny pieces, and no AI-specific rewriting; Google says none is needed.
- No fake freshness: don't change dates to look fresh. Don't hand-edit `updated:`/`created:`.
- Don't use robots.txt or `noindex` to pick a canonical; use redirects and `rel="canonical"`. Don't send the canonical in both HTML and an HTTP header.
- Don't add `noindex`, `Disallow: /` or `X-Robots-Tag` "temporarily".
- Don't rename or move a post folder without a 301 (and ask Ryan first).
- Don't claim "many AI crawlers don't run JavaScript" or similar as fact; the report marks such claims unverified.

## 6. AI-crawler policy: ask Ryan

`robots.txt` is currently `User-agent: *` / `Allow: /` with no recorded decision (A29 warns). This is a choice for Ryan, not a default for you to pick. Ask, with the facts from the report:

- Search/user bots (`OAI-SearchBot`, `Claude-SearchBot`, `Claude-User`; `ChatGPT-User` may ignore robots.txt): blocking `OAI-SearchBot` removes the site from ChatGPT search answers; blocking Anthropic's search/user bots may reduce visibility.
- Training bots (`GPTBot`, `ClaudeBot`, `Google-Extended`): blocking them is a separate choice. `Google-Extended` does not affect Google Search. Each OpenAI setting is independent.
- Options: (a) allow everything and record that in a `# AI crawlers: allow all, decided <date>` comment; (b) allow search/user bots, block training bots; (c) block all. Whichever he picks, write it into `robots.txt` explicitly, keep the `Sitemap:` line, and re-read the vendor pages first (B10).

## 7. Verify

Do all of these; don't report success on a skipped step.

1. `npm run build && npm run export` must finish without errors (it fails on bad `created` dates).
2. `node .claude/skills/update-seo/audit.mjs` must exit 0. Check the WARNs didn't grow; explain any that remain.
3. Check the data the audit relies on, if you touched the head or sitemap: every JSON-LD block parses (A12), and sitemap URLs equal built pages (A19). Both are in the audit; read their lines, don't just check the exit code.
4. Follow [the verify-change skill](../verify-change/SKILL.md) for the browser checks: smoke test, Chrome console/network at desktop and phone width, home and one post (and the kitchen sink if a component changed). Also view the page source for the changed tags.
5. `git status --short` should show only the files you meant to change. `public/sitemap.xml` and `out/` are ignored build output.

## 8. Report

- **Audit:** counts of ERROR/WARN before and after; list remaining ERRORs verbatim.
- **Changed:** files and what (code/config only).
- **For Ryan to do (content):** post-level items, each with the post path and the suggested text (titles, `image:`, alt text, thin posts).
- **Decision needed:** AI-crawler policy, if not yet recorded.
- **Not checked:** anything skipped and why.
- **Manual checklist (B-series) to hand to Ryan:**
  - [ ] B1 Search Console property verified; sitemap submitted and read without errors.
  - [ ] B2 URL Inspection on key URLs: indexable, Google-selected canonical equals the declared one.
  - [ ] B3 Performance report, search type "Web": review traffic (it includes AI features).
  - [ ] B4 PageSpeed Insights / CrUX on home and one long post: LCP under 2.5 s, INP under 200 ms, CLS under 0.1.
  - [ ] B5 Rich Results Test or Schema Markup Validator on one post.
  - [ ] B6 `curl -sI https://ryansblog.netlify.app/` returns 301 to `https://ryanscharfer.blog/`; know what the `www` variant does.
  - [ ] B7 Authorship and AI-use disclosure visible where readers would expect it; byline matches JSON-LD author.
  - [ ] B8 Posts are original and first-hand, no mass-produced thin pages.
  - [ ] B9 No intrusive interstitials or layout shift from late embeds (phone and desktop).
  - [ ] B10 Re-read the OpenAI, Anthropic and Google crawler pages before changing crawler policy.
  - [ ] B11 Any folder rename or slug change ships with a 301 (review `git diff` of `posts/` paths).

Don't commit unless Ryan asks; follow CLAUDE.md's commit rules (short imperative message, no `--no-verify`, explicit paths) and never push.

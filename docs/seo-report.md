# SEO for Worked Examples: research report

Draft 2 (fact-checked), 2026-11-15. Every claim below was checked against the primary page named next to it, fetched on 2026-11-15. Tags: **[P]** confirmed on a primary page; **[I]** inference or opinion, not a source claim; **[U]** could not be confirmed (kept only where flagged). Repo claims were checked against the files and the built `out/` HTML.

## 1. Where the repo stands today

Static Next.js 13 export on Netlify, canonical host `https://ryanscharfer.blog` (`lib/site.js`). 15 posts.

Confirmed in place (`components/Layout.js`, `pages/_document.js`, `lib/sitemap.js`, `public/robots.txt`, `netlify.toml`, `out/`):
- Unique `<title>` (`<post title> — Worked Examples`) and `<meta name="description">` per page (description = post `subtitle`; home and About have their own).
- Self-referential absolute `rel="canonical"` with no trailing slash (e.g. `https://ryanscharfer.blog/post/authentication/PKCE`; home is `https://ryanscharfer.blog/`).
- Open Graph tags (`og:site_name/title/description/url/type/image`, `article:published_time`, `article:modified_time` on posts) and `twitter:card`.
- `BlogPosting` JSON-LD on posts only: headline, description, url, mainEntityOfPage, image (one URL), datePublished, dateModified, author `Person` (name + url to `/about`), publisher `Person`.
- Generated `public/sitemap.xml` with `<loc>` and `<lastmod>` only (no `priority`/`changefreq`); `lastmod` = post `updated` or `created`; the home page's `lastmod` is the newest post change; `/about` has no `lastmod`. `robots.txt` is `User-agent: *` / `Allow: /` plus the sitemap line.
- 301 from `ryansblog.netlify.app/*` to the custom domain (`netlify.toml`, `force = true`).
- Static HTML, `<html lang="en">`, viewport meta, lazy-loaded post images with alt from the directive's `alt` attribute.
- Pre-commit link checking (per CLAUDE.md; not re-run here).

Gaps (candidates, not mandates). Corrections from draft 1 are marked.
1. Only 2 of 15 posts (`authentication/PKCE`, `authentication/authorization-code-flow`) set `image:` and have a file in `public/og/`. All others fall back to `/avatar.png` with `twitter:card=summary`. **Corrected:** images do exist for those two; the fallback is the avatar for the other 13. No `og:image:alt`, `og:image:width/height`.
2. No `WebSite`/`Blog` JSON-LD on the home page or About (JSON-LD is emitted only when `article` is passed). Author `Person` has no `sameAs`; `site.github` and `site.linkedin` exist in `lib/site.js`.
3. **Corrected:** dates are date-only strings (`2026-10-29`, from `formatDate` in `lib/posts.js`), with no time and no timezone offset. Google recommends timezone information in `datePublished`/`dateModified`. `image` is a single URL, not multiple ratios. `publisher` is a `Person`.
4. No RSS/Atom feed and no `<link rel="alternate">` (no match in `components/`, `pages/`, `lib/`).
5. No `<meta name="robots">`; default behavior is fine.
6. Figure alt text is author-supplied; `markdownComponents.js` renders `alt={props["data-alt"] || ""}`, so a missing alt silently becomes empty. The avatar `<img alt="">` is intentionally decorative.
7. Titles are `<post title> — Worked Examples`. **Confirmed a real risk:** the PKCE title is about 80 characters with the suffix. Google gives no hard character limit; "about 60" is a rule of thumb [I].
8. Core Web Vitals are not measured anywhere in the repo.
9. New finding: `/about` is in the sitemap without `lastmod` (harmless; Google uses `lastmod` only if accurate).

## 2. SEO to have (the fundamentals)

**Indexing and discovery**
- Every page must be crawlable and indexable: not blocked in robots.txt, no stray `noindex`. Use URL Inspection in Search Console to see how Google views a page. **[P]** https://developers.google.com/search/docs/fundamentals/seo-starter-guide (that page mentions Search Console and URL Inspection but does not name robots.txt or `noindex`; the "content visible without special user interaction" point is **[U]** and removed).
- Sitemap: "submitting a sitemap is merely a hint"; Google ignores `<priority>` and `<changefreq>`; uses `<lastmod>` only when "consistently and verifiably" accurate (a copyright-date change does not count); file must be UTF-8; list fully qualified absolute URLs; list only the canonical version of each page; limit 50 MB uncompressed or 50,000 URLs per file. **[P]** https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Links are how Google finds most new pages; descriptive anchor text helps. **[P]** SEO Starter Guide (it does not spell out `<a href>`; "crawlable `<a href>`" is **[I]**).

**URLs and duplicates**
- Use absolute paths in `rel="canonical"`; include a self-referential canonical on the canonical page; choose the HTML element or the HTTP header, not both ("using both methods at the same time is more error prone"). **[P]** https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Use permanent redirects to mark a duplicate as the worse version. Don't use robots.txt for canonicalization. "We don't recommend using noindex to prevent selection of a canonical page within a single site." **[P]** same URL.
- Trailing-slash consistency across canonicals, sitemap and internal links: the Google page does not address it. **[I]** (good hygiene only).
- A post's folder is its URL (CLAUDE.md rule). Changing it needs a 301 [I].

**Titles, snippets, headings**
- "A good title is unique to the page, clear and concise, and accurately describes the contents of the page." "A good meta description is short, unique to one particular page." Snippets come mainly from page content; the meta description is used only occasionally. **[P]** SEO Starter Guide. ("Google may rewrite either": not confirmed for descriptions in the fetched text, so treat as **[U]**.)
- Heading order does not matter to Google Search ("it doesn't matter if you're using them out of order"); headings still help readers. **[P]** SEO Starter Guide.
- Misconceptions per Google: it doesn't use the keywords meta tag; keyword stuffing is against spam policies; "there's no magical word count target, minimum or maximum"; keywords in the domain or URL path have little ranking effect. **[P]** SEO Starter Guide.

**Content (people-first)**
- Authorship should be clear ("strongly encourage[s] adding accurate authorship information, such as bylines"); disclose automation/AI use "when it would be reasonably expected"; "Why" is "perhaps the most important question". **[P]** https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- First-hand expertise is a people-first signal. "E-E-A-T itself isn't a specific ranking factor"; "trust is most important". **[P]** same URL.
- **Corrected:** the page does not say to keep old posts accurate or remove them. It warns against "changing the date of pages to make them seem fresh" without substantial change. Keeping posts accurate is **[I]**. `updated:` reflecting a real content change is consistent with that warning.

**Images and structured data**
- Descriptive alt text: "a short, but descriptive piece of text that explains the relationship between the image and your content". **[P]** SEO Starter Guide.
- Article structured data: "There are no required properties"; recommended: `author`, `dateModified`, `datePublished`, `headline`, `image`. ISO 8601 dates; "We recommend that you provide timezone information" (otherwise Googlebot's timezone is assumed). Multiple high-resolution images at 16x9, 4x3 and 1x1; minimum 50K pixels (width x height). `author.name` is the name only; `author.url` should identify the author, with `sameAs` as an alternative; use `Person` or `Organization`. **[P]** https://developers.google.com/search/docs/appearance/structured-data/article
- "Markup must match visible content": not in the Article page; it lives in the general structured data guidelines (https://developers.google.com/search/docs/appearance/structured-data/sd-policies), which were not fetched. **[U]**

**Page experience**
- Google says to "strive" for LCP within 2.5 s, INP under 200 ms, CLS under 0.1; it "highly recommend[s]" good Core Web Vitals, and says they align "with what our core ranking systems seek to reward". **Corrected:** draft 1 said Google "states no ranking weight"; the page states no weight, but it does not say they are unused. **[P]** https://developers.google.com/search/docs/appearance/core-web-vitals
- Ads shouldn't be so distracting that they block reading; avoid interstitials. **[P]** SEO Starter Guide (mobile-friendly layout is **[U]** on that page).

**Measurement**
- Set up Search Console and use URL Inspection and the performance data. **[P]** SEO Starter Guide. Bing Webmaster Tools, sitemap submission and the Indexing report: not checked against a primary source. **[U]**

## 3. SEO in the age of AI search

**Google (AI Overviews, AI Mode)**
- Eligibility: indexed and eligible to appear in Search with a snippet. "There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary." "You don't need to create new machine readable files, AI text files, or markup to appear in these features." "There's also no special schema.org structured data that you need to add." **[P]** https://developers.google.com/search/docs/appearance/ai-features
- Controls: `nosnippet`, `data-nosnippet`, `max-snippet`, `noindex`; Googlebot robots.txt rules govern crawling for Search. **[P]** same URL.
- Measurement: AI features traffic is "included in the overall search traffic in Search Console", under the Performance report's "Web" search type. **[P]** same URL.
- **Google's generative-AI optimization guide: confirmed.** Title "Optimizing your website for generative AI features on Google Search", at https://developers.google.com/search/docs/fundamentals/ai-optimization-guide (the page shows no date; a secondary source, Search Engine Roundtable, says it was posted about a month before 2026-06-16 and updated 2026-06-29; secondary sources disagree on May vs August, so the date is **[U]**). Its "things you can ignore for Google Search" list says: llms.txt and other special markup are not needed and "Google Search itself doesn't use them" (creating llms.txt for other services is fine and doesn't help or hurt Search); "There's no requirement to break your content into tiny pieces for AI to better understand it"; "You don't need to write in a specific way just for generative AI search"; also seeking inauthentic "mentions" and over-focusing on structured data. **[P]**
- **Google-Extended**: a standalone robots.txt product token (not a separate crawler) controlling whether crawled content can be used to train future Gemini models and for grounding in Gemini Apps and Vertex AI grounding; "does not impact a site's inclusion in Google Search nor is it used as a ranking signal". **[P]** https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers (draft 1's wording "does not govern Search" is accurate; "AI features" pages only link to it).

**Other AI products** (policies change; recheck before acting)
- OpenAI **[P]**, https://developers.openai.com/api/docs/bots :
  - `OAI-SearchBot`: surfaces sites in ChatGPT search; "Sites that are opted out of OAI-SearchBot will not be shown in ChatGPT search answers" (they may still appear as navigational links); changes take about 24 hours.
  - `GPTBot`: crawls content that may be used to train generative AI foundation models; disallowing it signals content shouldn't be used for training.
  - `ChatGPT-User`: user-initiated actions; "Because these actions are initiated by a user, robots.txt rules may not apply"; not used to determine Search appearance.
  - "Each setting is independent of the others."
- Anthropic **[P]**, https://support.claude.com/en/articles/8896518 :
  - `ClaudeBot`: web content that may contribute to model training. `Claude-User`: fetches when a user asks Claude a question; blocking may reduce visibility for user-directed search. `Claude-SearchBot`: improves search result quality; blocking may reduce visibility and accuracy in search results.
  - Honors robots.txt; supports the non-standard `Crawl-delay`. **Corrected:** Anthropic now publishes IP ranges at https://claude.com/crawling/bots.json (draft 1 said it does not), while warning IP blocking may not reliably opt you out.
  - **Corrected/removed:** the page does not mention `Claude-Web` or `anthropic-ai`, so the "deprecated" claim is **[U]** and dropped.
- Practical meaning **[I]**: allowing search and user bots while blocking training bots is a legitimate, separate choice (the OpenAI page supports independence for OpenAI). Blocking Google-Extended doesn't affect Google Search (**[P]** above). Decide deliberately and record it in `robots.txt`.

**What carries over to AI answers (inference, not a Google claim) [I]**: AI systems quote text they can crawl, so clear headings, direct statements near the top of sections, self-contained code and examples, accurate dates, visible authorship and first-hand material help. "Many AI crawlers don't run JavaScript" is **[U]** and not repeated as fact; static HTML is simply the safe default.

**What not to spend time on**: llms.txt for Google (**[P]** above; no primary evidence checked for other engines), artificial chunking (**[P]**), AI-specific rewriting (**[P]**), AI-only schema (**[P]**). "GEO keyword tricks" are not named by Google [I].

## 4. What hurts SEO

**Spam policies [P]**, https://developers.google.com/search/docs/essentials/spam-policies . Policy names in page order: cloaking; doorway abuse; expired domain abuse; hacked content; hidden text and link abuse; keyword stuffing; link spam; machine-generated traffic; malicious practices; misleading functionality; scaled content abuse; scraping; site reputation policy (abuse); sneaky redirects; thin affiliation; user-generated spam. Separately under "Other practices": legal and personal-information removals, policy circumvention, scam and fraud. **Corrected:** draft 1 omitted "machine-generated traffic" and placed "policy circumvention" in the main list.

**Most relevant to this blog**
- **Scaled content abuse** **[P]**: "many pages are generated for the primary purpose of manipulating" rankings; applies "no matter how it's created", with generative AI as one example. Using AI to help write is not itself the violation [I, reading of the above]; disclose AI use where readers would expect it (**[P]** people-first page).
- **User-generated spam** **[P]**: spam added through channels for user contributions such as comments. Comments here are giscus (iframe, GitHub Discussions), so links stay out of the page HTML [repo fact: `lib/site.js`, `components/post/Comments`]. Google recommends marking links in comments and forum posts with `rel="ugc"` **[P]** https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links . (Draft 1 said `rel="ugc nofollow"`; the page recommends `ugc`.) Paid links need `nofollow` or `sponsored` **[P]** (spam policies).
- **Back-button hijacking** is listed under malicious practices **[P]**.
- **Duplicate/split URLs** (`www`, `netlify.app`, trailing-slash or query variants): the consolidation page supports using redirects and canonicals **[P]**; that variants get indexed separately is **[I]**.
- **Accidental blocking** (`noindex` left on, `Disallow: /`, staging config) **[I]**.
- **Fake dates**: Google warns against changing page dates to look fresh **[P]**. Bumping sitemap `lastmod` site-wide on every build breaks the "verifiably accurate" condition **[P]** (sitemap page).
- Thin or stale posts, truncated titles, missing or duplicate descriptions, generic anchor text, missing alt text: good practice **[I]** (titles/descriptions/alt/anchors guidance is **[P]** in section 2).
- Fake authorship, and structured data that doesn't match visible content: **[I]** here; the structured-data policy page was not fetched.
- Intrusive interstitials **[P]**; layout shift and slow LCP map to Core Web Vitals **[P]**.
- Broken links and redirect chains: **[I]**.

## 5. Recommendations for this repo (ordered)

1. Add Search Console (and Bing Webmaster Tools) verification; submit the sitemap; record the property in a repo note.
2. Give every post a 1200x630 share image (or generate one), use `summary_large_image` always, add `og:image:alt` (13 of 15 posts currently fall back to the avatar) [I].
3. Add `WebSite` JSON-LD to the home page and `sameAs` (GitHub, LinkedIn) to the author `Person`; emit multiple image ratios if available; add a timezone offset to JSON-LD dates (currently date-only).
4. Add an RSS/Atom feed and `<link rel="alternate" type="application/rss+xml">`.
5. Decide and document an AI-crawler policy in `robots.txt`.
6. Add a build-time SEO check from section 8.
7. Measure Core Web Vitals with PageSpeed Insights/CrUX on the home page and one long post after image or font changes.
8. Don't add `llms.txt` for Google's sake, keyword meta tags, or `priority`/`changefreq`.

(Re-count with check A9 in section 8.)

## 6. Primary sources

- Google SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Creating helpful, reliable, people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- AI features and your website: https://developers.google.com/search/docs/appearance/ai-features
- Optimizing for generative AI features on Google Search: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google common crawlers (Google-Extended): https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers
- Article structured data: https://developers.google.com/search/docs/appearance/structured-data/article
- Build a sitemap: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Consolidate duplicate URLs: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Qualify outbound links (`ugc`): https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links
- Core Web Vitals: https://developers.google.com/search/docs/appearance/core-web-vitals
- OpenAI crawlers: https://developers.openai.com/api/docs/bots
- Anthropic crawlers: https://support.claude.com/en/articles/8896518
- Not fetched: structured data general guidelines https://developers.google.com/search/docs/appearance/structured-data/sd-policies

## 7. Verification log

| Claim | Result | Source |
|---|---|---|
| AI features: no additional requirements, no special markup/files/schema | confirmed | ai-features |
| AI features controls (nosnippet, data-nosnippet, max-snippet, noindex) | confirmed | ai-features |
| AI traffic in Search Console Performance, "Web" type | confirmed | ai-features |
| Google guide says llms.txt, chunking, AI rewriting not needed | confirmed; primary page found | ai-optimization-guide |
| Guide published "May 2026" | unverifiable (no date on page; secondary sources conflict) | n/a |
| Google-Extended doesn't govern Search | confirmed | google-common-crawlers |
| OpenAI three bots, independent, blocking OAI-SearchBot removes from ChatGPT search answers | confirmed (nuance: ChatGPT-User may ignore robots.txt) | openai bots |
| Anthropic three bots, robots.txt, Crawl-delay | confirmed | support.claude.com 8896518 |
| Anthropic "does not publish IP ranges" | corrected: it publishes a list | 8896518 |
| `Claude-Web`/`anthropic-ai` deprecated | unverifiable, removed | 8896518 |
| Many AI crawlers don't run JS | unverifiable, removed as fact | n/a |
| Sitemap hint; priority/changefreq ignored; lastmod rule; 50 MB / 50,000; UTF-8; absolute; canonical only | confirmed | build-sitemap |
| Canonical: absolute, self-referential, not both HTML and header; 301; not robots/noindex | confirmed | consolidate-duplicate-urls |
| Google's canonical page doesn't address trailing slashes | confirmed | consolidate-duplicate-urls |
| Title/description guidance | confirmed; "Google may rewrite either" unverifiable for description | seo-starter-guide |
| Misconceptions (keywords meta, word count, domain keywords) | confirmed | seo-starter-guide |
| Content visible without special interaction; robots/noindex named in Starter Guide | unverifiable, removed | seo-starter-guide |
| Who/How/Why, AI disclosure "reasonably expected", E-E-A-T not a ranking factor, trust most important | confirmed | creating-helpful-content |
| "Keep old posts accurate or remove" | corrected (page warns against faking dates) | creating-helpful-content |
| Article SD: no required props, recommended props, tz recommended, 3 ratios, 50K px, author name/url/sameAs | confirmed | structured-data/article |
| "Markup must match visible content" | unverifiable on that page (lives in sd-policies, not fetched) | n/a |
| CWV thresholds | confirmed | core-web-vitals |
| CWV "states no ranking weight" | corrected: page says they align with what core ranking systems reward | core-web-vitals |
| Spam policy list | corrected (added machine-generated traffic; site reputation naming; policy circumvention is under "Other") | spam-policies |
| Scaled content abuse regardless of AI/human | confirmed | spam-policies |
| Back-button hijacking under malicious practices | confirmed | spam-policies |
| `rel="ugc nofollow"` | corrected to `rel="ugc"` | qualify-outbound-links |
| Bing Webmaster Tools, sitemap submission, Indexing report | unverifiable (no primary fetched) | n/a |
| Repo: canonical, OG, twitter, JSON-LD, sitemap, robots, 301, lang | confirmed in files and out/ | repo |
| Repo: dates carry timezone | corrected: date-only, no timezone | lib/posts.js, out/ |
| Repo: post images exist | corrected: only 2 posts have og images; files present | public/og |
| Repo: no feed, no WebSite JSON-LD, no sameAs | confirmed | repo |
| Repo: `alt=""` silently allowed | confirmed | markdownComponents.js |
| Repo: PKCE title length risk | confirmed (~80 chars with suffix) | out/post/authentication/PKCE.html |

## 8. Checklist for a skill

Severity: error = should fail the check; warn = report only. Ids are stable. "Built HTML" means files under `out/` after `npm run build && npm run export`. Page types: post = `out/post/**/*.html` (not `_fixtures`), home = `out/index.html`, about = `out/about.html`; skip `out/404.html`.

### A. Automatable against built `out/` HTML and repo files

| id | rule | how to verify mechanically | sev | source |
|---|---|---|---|---|
| A1 | Each page has exactly one non-empty `<title>`, unique across pages | Parse `title`; count == 1; no duplicates across pages | error | https://developers.google.com/search/docs/fundamentals/seo-starter-guide |
| A2 | Titles are concise: visible length at most about 60 characters | `len(title) <= 60` (rule of thumb, Google sets no limit); list offenders | warn | same (limit is [I]) |
| A3 | Each page has a non-empty `meta[name=description]`, unique across pages, short (about 160 or less) | `meta[name=description]@content`; check non-empty, unique | error (missing/duplicate), warn (long) | same |
| A4 | Exactly one `link[rel=canonical]` with an absolute URL | selector count == 1; href starts `https://ryanscharfer.blog` | error | https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls |
| A5 | Canonical is self-referential and matches the file's URL path (no trailing slash except home) | Map `out/post/x/y.html` to `/post/x/y`; compare to canonical path | error | same |
| A6 | No canonical sent via both HTML and HTTP header | `grep -n "Link:.*canonical" netlify.toml _headers` returns nothing | warn | same |
| A7 | No `noindex` on any page | `grep -il 'noindex' out/**/*.html` is empty; no `X-Robots-Tag` in `netlify.toml` | error | https://developers.google.com/search/docs/appearance/ai-features |
| A8 | `public/robots.txt` does not `Disallow: /` for `*` and contains a `Sitemap:` line with the canonical host | grep the file | error | https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls |
| A9 | Every post sets a share image: `meta[property="og:image"]` is not the avatar, file exists in `out/` | og:image path != `/avatar.png`; `test -f out/<path>` | warn | [I] (repo recommendation) |
| A10 | `twitter:card` is `summary_large_image` when a share image is set | meta check | warn | [I] |
| A11 | `<html lang>` and viewport meta present | `html@lang`, `meta[name=viewport]` | error | [I] |
| A12 | Every post has one `script[type="application/ld+json"]` that parses as JSON with `@type` BlogPosting | JSON.parse; check type | error | https://developers.google.com/search/docs/appearance/structured-data/article |
| A13 | JSON-LD has recommended props: headline, image, datePublished, dateModified, author.name | key presence | warn | same |
| A14 | JSON-LD `datePublished`/`dateModified` are ISO 8601 and include a timezone offset (currently fail: date-only) | regex `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:\d{2})$` | warn | same |
| A15 | JSON-LD `author` has `url` or `sameAs`; `author.name` is a bare name | key presence | warn | same |
| A16 | JSON-LD `url`, `mainEntityOfPage` equal the canonical; `datePublished` equals `article:published_time`; `headline` equals `og:title`/H1 | string equality | error | [I] (consistency) |
| A17 | `dateModified` >= `datePublished` | date compare | error | [I] |
| A18 | Sitemap lists absolute canonical URLs only, UTF-8, under 50,000 URLs and 50 MB, no `priority`/`changefreq` | parse `out/sitemap.xml` | error | https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap |
| A19 | Sitemap URL set equals the set of canonicals of all built pages (excluding 404 and fixtures) | set diff | error | same |
| A20 | Sitemap `lastmod` per post equals that post's JSON-LD `dateModified`; not identical for every URL | compare; count distinct values | warn | same |
| A21 | Every `<img>` in `article` has non-empty alt (decorative images must be explicit) | selector `article img:not([alt]), article img[alt=""]` | error (missing attr), warn (empty) | https://developers.google.com/search/docs/fundamentals/seo-starter-guide |
| A22 | Exactly one `<h1>` per page | count `h1` | warn | [I] |
| A23 | Internal links use `<a href>` with non-generic text (no "click here", "here", "link", "read more") | selector `a[href]`; text blacklist | warn | https://developers.google.com/search/docs/fundamentals/seo-starter-guide |
| A24 | Internal hrefs resolve to a built page and use canonical form (no trailing slash, no `netlify.app`, no `www`) | resolve against `out/`; grep `ryansblog.netlify.app` | error | https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls |
| A25 | `<meta name="keywords">` absent | grep | warn | https://developers.google.com/search/docs/fundamentals/seo-starter-guide |
| A26 | Page text is present in static HTML (post `article` has more than N words without JS) | word count of `article` text in raw HTML | error | [I] |
| A27 | `netlify.toml` still 301-redirects `ryansblog.netlify.app/*` to the custom host | grep `status = 301` and `to = "https://ryanscharfer.blog` | error | https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls |
| A28 | No `llms.txt`, `priority`/`changefreq` added for Google's sake | `test ! -f public/llms.txt` | warn | https://developers.google.com/search/docs/fundamentals/ai-optimization-guide |
| A29 | `robots.txt` names AI crawlers deliberately (OAI-SearchBot, GPTBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, Google-Extended) or has a comment recording the "allow all" decision | grep each token or a `# AI crawlers` comment | warn | https://developers.openai.com/api/docs/bots , https://support.claude.com/en/articles/8896518 |
| A30 | Comment system output adds no raw user links to HTML (giscus iframe only) | `grep -c "giscus" ` shows iframe/script only; no `<a>` in comment region | warn | https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links |
| A31 | RSS/Atom `link[rel=alternate]` present in home `<head>` and feed file exists | selector and `test -f` | warn | [I] |
| A32 | Home page has `WebSite` or `Blog` JSON-LD | parse home JSON-LD | warn | [I] |
| A33 | Post front matter dates unchanged by hand: `created` never edited after first commit; `updated` only changed by the hook | `git log -p -- posts/** | grep '^[-+]created:'` shows only additions | error | https://developers.google.com/search/docs/fundamentals/creating-helpful-content (no faking dates) |

### B. Manual, external or Search Console checks

| id | rule | how to verify | sev | source |
|---|---|---|---|---|
| B1 | Property verified in Search Console; sitemap submitted and read without errors | Search Console, Sitemaps report | warn | https://developers.google.com/search/docs/fundamentals/seo-starter-guide |
| B2 | Key URLs are indexable and the canonical Google selected is the declared one | Search Console, URL Inspection ("User-declared" vs "Google-selected" canonical) | error | https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls |
| B3 | AI features traffic reviewed in Performance report, search type "Web" | Search Console | warn | https://developers.google.com/search/docs/appearance/ai-features |
| B4 | Core Web Vitals meet LCP under 2.5 s, INP under 200 ms, CLS under 0.1 on home and one long post | PageSpeed Insights / CrUX | warn | https://developers.google.com/search/docs/appearance/core-web-vitals |
| B5 | Structured data validates and renders as intended | Google Rich Results Test or Schema Markup Validator on one post | warn | https://developers.google.com/search/docs/appearance/structured-data/article |
| B6 | Live redirect: `curl -sI https://ryansblog.netlify.app/` returns 301 to the custom domain; `www` variant behavior known | curl | error | https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls |
| B7 | Authorship and AI-use disclosure visible where readers would expect it; byline matches JSON-LD author | read a post | warn | https://developers.google.com/search/docs/fundamentals/creating-helpful-content |
| B8 | Posts are people-first: original, first-hand, no mass-produced thin pages | editorial review | warn | https://developers.google.com/search/docs/essentials/spam-policies |
| B9 | No intrusive interstitials or layout shift from late embeds | browser check at phone and desktop width | warn | https://developers.google.com/search/docs/fundamentals/seo-starter-guide |
| B10 | AI-crawler policy (search/user bots vs training bots) re-read against current vendor docs before changing | re-fetch the OpenAI, Anthropic and Google crawler pages | warn | https://developers.openai.com/api/docs/bots , https://support.claude.com/en/articles/8896518 , https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers |
| B11 | Folder renames or slug changes ship with a 301 | review `git diff` of `posts/` paths | error | https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls |

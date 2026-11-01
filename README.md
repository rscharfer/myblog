# Second Draft

Source for [Second Draft](https://ryansblog.netlify.app), Ryan Scharfer's blog: tutorials and notes on React, JavaScript, authentication and the tools around them.

It's a Next.js 13 site (pages router) exported to static HTML and hosted on Netlify. Posts are plain Markdown files rendered with react-markdown.

## Running it

```sh
yarn install
npm run dev                          # http://localhost:3000
npm run build && npm run export      # what Netlify runs; output goes to out/
npx serve out                        # preview the static export
```

Netlify's build command, publish folder and Node version (18) are set in [netlify.toml](netlify.toml).

## Writing a post

Add a Markdown file under `posts/<topic>/`. Its path is its URL: `posts/git/worktree.md` is served at `/post/git/worktree`, and the folder name becomes the topic label ("react19" shows as "React 19").

```markdown
---
title: Git worktree in my own words
created: June 15, 2026
subtitle: Why are worktrees so awesome?
---

Post body…
```

- `title` and `subtitle` are required. The subtitle is also the page's meta description, so make it a real sentence. To include a colon in front matter, write `{:}`.
- `created` must be in the form `Month D, YYYY`; the build fails otherwise. Posts are listed newest first by this date.
- Don't write `updated` by hand. When a commit changes an existing post, the pre-commit hook ([scripts/stamp-updated.mjs](scripts/stamp-updated.mjs)) adds or bumps `updated: <today>`. Changes to only the date lines don't count. The Posts page then shows "Updated …" under the created date, and the post shows "Updated …" above its title instead of the date in the meta row. To skip the stamp for a trivial commit, use `git commit --no-verify`. `yarn install` turns the hook on (it sets `core.hooksPath` to `.githooks`).
- Optional: `related` (a "Related reading" list) and `icons` (see below).

The home page, sitemap, reading time and table of contents (built from `##` and `###` headings) all update automatically.

### Markdown extras

Beyond standard Markdown, the post template supports:

| Element | Syntax |
|---|---|
| Code block with title, highlighted lines and caption | ```` ```js title="pkce.js" {2-3,11} caption="What to notice" ```` |
| Note | `:::note[Label]{#id}` … `:::` |
| Footnote | End a heading with `†` and start a paragraph with `† ` |
| Steps | Any ordered list |
| Icon list | A bullet list where every item is `**Term:** definition`, with `icons: { Term: role \| artifact \| channel }` in front matter |
| Figure | `::figure{wide="a.svg" narrow="b.svg" caption="…"}`, with the SVGs next to the `.md` file |
| Pull-quote | A blockquote whose last line starts with `— ` |
| Related reading | Front matter `related: [{ label, title, href, description }]` |

Raw HTML in Markdown is escaped. To see every element on one page, run `SHOW_FIXTURES=1 npm run build && npx next start` and open `/post/_fixtures/kitchen-sink` (the source is [design/fixtures/kitchen-sink.md](design/fixtures/kitchen-sink.md)).

## Where things live

| Path | What |
|---|---|
| `posts/` | Blog posts |
| `content/about.md` | About page text |
| `lib/site.js` | Site name, URL, author details, social links and comments config |
| `lib/posts.js` | Loads posts at build time: front matter, table of contents, reading time |
| `lib/markdown.js` | The remark plugins behind the Markdown extras |
| `lib/sitemap.js` | Writes `public/sitemap.xml` during the build (git-ignored) |
| `components/` | Layout, top bar, footer, post list; `components/post/` holds the post template |
| `styles/blog.css` | Design tokens and all styles, including light and dark themes |
| `styles/fonts/` | Self-hosted fonts (Bricolage Grotesque, Figtree, JetBrains Mono; SIL Open Font License) |
| `public/` | Favicon, avatar, `robots.txt`, giscus comment themes |
| `design/` | Redesign spec, reference HTML, tokens and the build report |

## Comments

Comments use [giscus](https://giscus.app), stored in this repo's GitHub Discussions ("Announcements" category). The settings are under `comments` in `lib/site.js`.

The custom paper/ink comment theme in `public/giscus/` is turned off (`customTheme: false`) because giscus loads it cross-origin. To enable it, add a `public/_headers` file with:

```
/giscus/*
  Access-Control-Allow-Origin: https://giscus.app
```

Then deploy and set `customTheme: true`.

## SEO

Every page gets a title, description, canonical URL and Open Graph/Twitter tags from `components/Layout.js`. Posts also get `BlogPosting` structured data. `sitemap.xml` is generated on each build, and `public/robots.txt` points to it. If the domain changes, update `url` in `lib/site.js` and the sitemap line in `robots.txt`.

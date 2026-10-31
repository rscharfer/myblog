# Redesign plan

Branch: `redesign` (from `master`). One commit per phase.

## What the stack actually is

- **Next.js 13, pages router**, static export (`next build && next export` on Netlify, Node 18).
  Webpack is configured through `next.config.js` so `.md` files load with `raw-loader`.
- Posts are plain Markdown in `posts/<topic>/<slug>.md` with gray-matter front matter
  (`title`, `published` as "Month D, YYYY", `subtitle`). Routes: `/post/<topic>/<slug>` via
  `pages/post/[...slug].js` (`require.context` over `/posts`).
- Rendering: `react-markdown@8` with custom renderers in `components/CustomRenderers/`;
  code highlighting with `prism-react-renderer@1` and `customPrismTheme.js`.
- Styles: styled-jsx (`<style jsx>`) plus colour constants in `color.js`. Fonts come from `next/font/google` in `_app.js`.
- Comments: utterances script injected on the post page.

## Rendering decision: keep plain `.md` + react-markdown, no MDX

Every new post element can be expressed in plain Markdown, using a few small remark plugins and custom components:

| Design element | Markdown authoring | Implementation |
|---|---|---|
| h2/h3 with anchors, TOC | `##` / `###` | remark plugin `remarkHeadingIds` sets stable slug ids (and still honours the old `id=foo ` prefix). The same plugin runs at build time in `getStaticProps` to produce the TOC, so ids always match. |
| Code block: file label, Copy, highlighted lines, caption | ```` ```js title="pkce.js" {2-3,11} caption="What to notice" ```` | `pre` renderer → `<figure class="code">`, Prism tokens rendered as `.ln` lines, `.ln.hl` for highlighted lines, token colours = `var(--syn-*)` |
| Note / footnote | `:::note[* No web server?]{#no-web-server}` … `:::` (remark-directive). For posts already written with a marker convention (heading ending in `†`/`*`, paragraph starting with the same marker) a small plugin converts them automatically, so post text is unchanged. | `aside.note` + `sup.dagger` link |
| Ordered steps | ordinary `1.` list | `ol.steps` |
| Icon list | list where every item is `**Term:** definition` | `ul.ilist`; per-term icon from optional front matter `icons:` (role / artifact / channel) |
| Figure (wide + narrow SVG) | `::figure{wide="pkce-wide.svg" narrow="pkce-narrow.svg" caption="…"}` | SVG files sit next to the .md file and are inlined at build time (so they can use theme tokens) |
| Blockquote with attribution | `>` quote, last line starting with `— ` | `blockquote` + `footer` |
| Related reading | front matter `related:` list | `section.related` |
| Reading time | n/a | computed in `getStaticProps` (words / 230) |

**Trade-offs.** MDX would allow arbitrary components inline, but it would mean converting or renaming every post (and URLs/loader changes), plus a heavier toolchain. Directives keep posts readable as plain Markdown on GitHub. The costs are a small amount of custom syntax (`:::note`, `::figure`, code-fence meta) and a few remark plugins I maintain in `lib/`.

**Packages (planned):** `remark-directive@2` (for `:::note` / `::figure`). I'm also adding `unified@10`, `remark-parse@10` and `mdast-util-to-string@3` as direct dependencies. All three are already installed as react-markdown 8 dependencies, so this adds no new code; it only stops us importing transitive packages. Highlighting stays on the existing `prism-react-renderer`.

## Important: content vs. reference

The reference PKCE page contains content that is **not in `posts/authentication/PKCE.md`**: three code samples, the five steps, the sequence diagram, the pull-quote, related reading, reworded headings. The rule is "don't change post content", so I will **not** add that content. The template supports all of those elements, and the real post renders with what it has: headings, TOC, drop cap, the † footnote as a note, and the glossary as an icon list (icons via a new `icons` front-matter field). A fixture post that exercises every element is kept outside `/posts` (`design/fixtures/kitchen-sink.md`). It renders only when `SHOW_FIXTURES=1`, so it never ships.

The Posts and About **screenshots show unstyled markup** (numbered lists, run-together text): `reference/styles.css` has no rules for `.plist`, `.pitem`, `.datenote`, `.about-me`, `.elsewhere`. For those I follow the written HANDOFF spec (120px topic/date column on desktop, one line on phones, year kicker over a 1px ink rule), built only from existing tokens and the `.related` row pattern.

## File map

| Piece | Files |
|---|---|
| Tokens + global CSS | `styles/blog.css` (ported from `reference/styles.css` + posts/about rules), imported in `pages/_app.js` |
| Fonts | `next/font/google` (Newsreader w/ opsz + italics, Inter, JetBrains Mono) → `--font-*` vars |
| No-flash theme | `pages/_document.js` inline script (verbatim from reference head) |
| Theme button, top bar, footer, progress bar | `components/TopBar.js`, `components/SiteFooter.js`, `components/Progress.js`, `components/Layout.js` |
| Post template | `pages/post/[...slug].js`, `components/post/*` (Meta, Toc, CodeBlock, renderers), `lib/markdown.js` (plugins), `lib/posts.js` (load/parse/sort/topic labels/reading time) |
| Post behaviour (progress, TOC tracking, copy, close details) | `components/post/usePostBehaviour.js` (port of `reference/blog.js`) |
| Posts list | `pages/index.js`, `components/PostList.js` |
| About | `pages/about.js` + `content/about.md` (placeholder text, easy to edit) |

Existing behaviour I'm keeping: utterances comments (themed to match light/dark), the `id=` heading syntax, URL scheme `/post/<topic>/<slug>`.

## Phases

1. This plan (commit includes the `design/` folder so the spec travels with the branch).
2. Tokens, global styles, fonts, no-flash theme.
3. Top bar, footer, progress bar, theme toggle.
4. Post template; verify `/post/authentication/PKCE` and `/post/react16/use-state` + fixture.
5. Posts list from front matter.
6. About page.

Verification: `npm run build` after each phase. I'll use headless Chromium (Playwright, from a scratch directory) for screenshots at 1440/390, in light and dark, plus axe/Lighthouse-style checks where possible.

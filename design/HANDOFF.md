# Handoff: Ryan's Blog redesign (Editorial)

You are implementing a finished visual design in this blog's existing codebase. The design is complete and approved. Your job is to port it faithfully, not to redesign it.

## What's in this folder

| Path | What it is |
|---|---|
| `reference/` | A working static build of the design: `index.html` (Posts), `about/index.html`, `post/authentication/PKCE/index.html`. **This is the source of truth for markup, class names and behaviour.** Open it with `npx serve reference` to compare. |
| `reference/styles.css` | Every token and style the pages use, light and dark. |
| `reference/blog.js` | All page behaviour (~70 lines, no dependencies). |
| `tokens.json` | Design tokens: colours (light/dark), type families and styles, spacing, radius, measure. |
| `DESIGN.md` | The design notes: principles, layout by width, components, placeholders. |
| `screenshots/` | Full-page renders of each page at 1440px and 390px, plus the post in dark mode. |

## Step 1: Inspect before you write

1. Work out the stack (Next.js, Astro, Gatsby, plain HTML…), how posts are authored (MDX, Markdown, CMS), how routing works, and how styles are done (CSS modules, Tailwind, global CSS).
2. Find where the current layout, header, footer, post template and post list live.
3. Write a short plan mapping each piece below to files in this repo, then show it to Ryan before making large changes.

Keep the repo's conventions. If it uses Tailwind, map the tokens into the Tailwind theme as CSS variables rather than hard-coding hex values. If it uses CSS modules, split `styles.css` by component. Plain global CSS is also fine. Don't add a UI library.

## Step 2: Build these pieces

### Global
- **Tokens:** CSS custom properties from `tokens.json`, under `:root, [data-theme="light"]` and `[data-theme="dark"]`, exactly as at the top of `reference/styles.css`. Use the variables everywhere; no raw hex values in components.
- **Fonts:** Newsreader (serif, for reading), Inter (labels and metadata), JetBrains Mono (code), loaded from Google Fonts with the URL in the reference `<head>`, or `next/font` if this is Next.js.
- **Theme:** an inline script in `<head>` sets `data-theme` before first paint. It uses localStorage key `theme`, falling back to `prefers-color-scheme`. Copy the snippet from the reference head; it prevents a flash of the wrong theme. The sun/moon button toggles the theme and saves the choice.
- **Top bar (every page):** exactly two links, **Posts** (`/`) and **About** (`/about`), plus the theme button on the right. The current page gets `aria-current="page"` and an ink underline. On a post page, Posts gets `aria-current="true"` (posts live under it).
- **Footer (every page):** avatar, name, one-line bio, and GitHub / LinkedIn / website links.
- **Reading progress bar:** 2px, sticky at the top, scales with page scroll.

### Posts page (`/`)
- Title "Posts", an italic subtitle, then "N posts · dates show when a post was last updated".
- Posts newest first, grouped by year: a year kicker over a 1px ink rule.
- Each row is one link: topic label (derived from the URL segment: `authentication` → Authentication, `git` → Git, `react19` → React 19, `react16` → React 16), short date (`Oct 29`), title, subtitle. On desktop, topic and date sit in a 120px left column; on phones they share one line above the title.
- **Data:** generate the list from the real posts' front matter (title, date = last updated, subtitle, path). Don't hard-code it unless the repo has no post data.

### Post page (template for every post)
- **Header:** title (56px light serif), italic subtitle, then a meta row: avatar + name, last-updated date, reading time, LinkedIn / X share links. The meta row is **hidden at ≤640px**.
- **Contents:** generated from the post's h2/h3.
  - At ≥1220px: a sticky list in the left margin with a "% read" counter, and the active section highlighted while scrolling.
  - Below 1220px: a bordered `<details>` bar reading "CONTENTS · N sections" with a chevron; it closes after a link is chosen.
- **Body styles:** h2 has a 40px ink rule above it; h3 is italic. Body is 20px/1.7 at a 64ch measure. The first paragraph gets a drop cap at ≥641px only. Hyphenation is on, except at ≤640px.
- **Code blocks:** a quiet file label and a Copy button above, then a full-bleed `code-bg` band, highlighted lines on `code-hl`, and a caption below. At ≤640px, lines **wrap with a hanging indent** instead of scrolling. Copy must copy the original lines, not the wrapped text.
  - **Syntax highlighting:** the reference uses static spans with classes `t-k`, `t-s`, `t-f`, `t-p`, `t-c`. In the real site, use the repo's highlighter (Shiki, Prism, rehype-pretty-code…) themed with the `syn-*` tokens. It needs a highlighted-lines feature, mapped to `.ln.hl`.
- **Note / callout:** a small-caps label, with an ink rule above and a hairline below. Footnotes use an asterisk link in the heading that scrolls to the note.
- **Ordered steps:** zero-padded numbers (`01`) in the accent colour.
- **Icon list:** a small stroke icon, a bold term, " — ", the definition, with hairlines between rows.
- **Figure:** sequence diagram SVG with a "FIG. 1" caption. It has a wide version and a narrow version for ≤640px, both in the reference HTML. Keep both, toggled by CSS (`.fig-wide` / `.fig-narrow`).
- **Blockquote:** centered italic pull-quote with a small accent quote mark and a small-caps attribution.
- **Related reading:** a kicker over an ink rule, then rows with a label column, title and description.

### About page (`/about`)
- Title "About", then a block with the avatar, name and "Eugene, Oregon", then paragraphs at 21px, then an "Elsewhere" link list.
- The two paragraphs are placeholders; Ryan will write the real text. Keep the content easy to edit: Markdown/MDX if the repo supports it.

## Breakpoints (see DESIGN.md: Layout by width)

- **≥1220px:** three-column grid (contents | 64ch text | space).
- **641–1219px:** single column; contents as the bar.
- **≤640px:** 24px side gutters, meta row hidden, wrapped code, narrow diagram, no drop cap, no hyphenation.

## Don't

- Don't redesign, restyle, or "improve" spacing, colours or type.
- Don't add new nav items, tags on posts, or a search box.
- Don't use shadows, rounded corners (apart from avatars), gradients or emoji.
- Don't render the `.scroller` wrapper. It's gone from the reference; the page scrolls normally.

## Acceptance checklist

- [ ] Light and dark both match the screenshots; the theme survives reloads and doesn't flash.
- [ ] At 390px: no horizontal scrolling anywhere (code wraps, diagram fits), meta row hidden, contents bar works.
- [ ] At 1440px: the sticky contents list highlights the current section, and "% read" updates.
- [ ] Copy buttons copy the unwrapped code.
- [ ] The posts list is generated from real post data, newest first, grouped by year.
- [ ] All text meets 4.5:1 contrast; keyboard focus is visible; `aria-current` is set in the top bar.
- [ ] Lighthouse accessibility ≥ 95 on all three page types.

## Placeholders to replace later

- The GitHub / LinkedIn URLs point to the sites' home pages; ask Ryan for his profile URLs.
- The avatar uses initials ("RS").
- The About text is two placeholder lines.
- The related-reading "Shopify storefront" post doesn't exist yet.

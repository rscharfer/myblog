# Ryan's Blog

The visual system for ryanscharfer.blog: a calm, typographic long-read built for developers who land on one tutorial from search or LinkedIn. The goal is that they're glad they landed and keep reading. Readability comes first, code blocks are first-class, and light and dark modes are equal citizens.

The reference page is the PKCE post (*OAuth — What is the purpose of PKCE?*), shown at desktop, tablet (820px) and phone (390px) widths under **Post page**.

## Pages

Three page types share the top bar, `layout`, type scale and footer:

- **Posts** (`PostsPage`): the home page. Every post newest first, grouped by year under a kicker and an ink rule. Each row shows the topic (taken from the URL path: Authentication, Git, React 19, React 16), the created date (plus a small-caps "Updated …" line if the post was edited later), the title and the subtitle, and the whole row is the link.
- **Post** (`PostEditorial`): the article itself. An edited post gets a kicker above the title, with the topic in `link` and "Updated <date>", and the meta row drops its date.
- **About** (`AboutPage`): name, location, a few paragraphs at 21px, and an "Elsewhere" link list. Add paragraphs as plain `<p>` inside `.about-body`.

**Top bar:** two links, Posts (`/`) and About (`/about`), plus the sun/moon theme button. The current page is underlined in `ink`; on a post, Posts stays underlined because posts live under it.

## Content fundamentals

- Plain words first, the spec's vocabulary second ("the random string" → **code verifier**).
- **Bold** names a concept the first time it appears; *italic* stresses the one word an argument turns on (*actual string*, *their* credentials).
- Every code block gets a one-line caption saying what to notice; highlighted lines are the ones the caption points at.
- Footnotes use an asterisk that links to the note.
- No GIFs, memes or emoji.

## Visual foundations

- **Type ("Font Modern"):** three families, as tokens.
  - `--font-display`, **Bricolage Grotesque**: h1, article h2 and h3, the top-bar links, the post subtitle, pull-quotes, the footer name, related-reading titles, post titles on the Posts page and the name on the About page.
  - `--font-body`, **Figtree**: everything else, i.e. body text plus kickers, metadata, captions and the contents list (`kicker`, `meta`).
  - `--font-mono`, **JetBrains Mono**: code.
- **Type sizes and weights:** title 56px at weight 650 with -0.025em tracking. h2 30px and h3 22px, both 650; h3 is not italic. Body is 18px/1.72 at every width. The subtitle is upright, and pull-quotes are upright at weight 500. About paragraphs are 19px (18px on phones). Inline *em* stays italic, since Figtree has true italics. There is no drop cap.
- **Measure:** `measure` (706px) on tablet and desktop; phones use the full width minus 24px gutters. It was 64ch of the old 20px serif, and is fixed in px so changing fonts doesn't move the layout.
- **Colour:** one accent, `link` (rust), used for links, step numbers, the active contents item, back-channel arrows and the footnote marker. Everything else is `ink`, `muted` and `paper`. Text passes 4.5:1 in both themes.
- **Dividers:** hairlines in `rule` are the only borders, plus a 40px `ink` rule above each h2. There are no shadows, and corners are square (`radius` 0).
- **Code:** full-bleed `code-bg` bands with `code-hl` on highlighted lines and a quiet file label plus Copy above. On phones, long lines wrap with a hanging indent instead of scrolling.
- **Space does the work:** `space-6`/`space-7` between sections, with large top padding on the header.

## Layout by width

| Width | Contents | Header meta | Code | Diagram |
|---|---|---|---|---|
| ≥ 1220px | Sticky list in the left margin with "% read" | Byline, date, read time, share | Full-bleed band, scrolls if needed | Wide sequence diagram |
| 641–1219px (tablet) | Bordered "Contents · 9 sections" bar with arrow | Shown | Same | Wide |
| ≤ 640px (phone) | Same bar | Hidden (byline lives in the footer) | Wraps with hanging indent | Narrow 340px version |

Phones also turn off hyphenation.

## Iconography

A small inline stroke set on a 24px grid with round caps: role (person), artifact (key), channel (arrows), plus calendar, clock, share, copy, link, code, globe and sun/moon. Icons take `currentColor`. Share buttons are text labels, not brand logos.

## Components

`components/bundle.js` (`window.RyansBlog`) provides the page behaviour: `initPost()` (progress bar, scroll-tracking contents, smooth anchors, copy buttons) and `initThemeToggle()` (the sun/moon button in the top bar).

## Placeholders to replace

- Related reading: "How a Shopify storefront logs you in" stands in for the planned auth-series post.
- The About page text is two placeholder lines.
- GitHub and LinkedIn footer links point to the sites' home pages, and the avatar shows initials.

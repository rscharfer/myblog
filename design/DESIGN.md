# Ryan's Blog

The visual system for ryansblog.netlify.app: a calm, typographic long-read built for developers who land on one tutorial from search or LinkedIn. The goal is that they're glad they landed and keep reading. Readability comes first, code blocks are first-class, and light and dark modes are equal citizens.

The reference page is the PKCE post (*OAuth — What is the purpose of PKCE?*), shown at desktop, tablet (820px) and phone (390px) widths under **Post page**.

## Pages

Three page types share the top bar, `layout`, type scale and footer:

- **Posts** (`PostsPage`): the home page. Every post newest first, grouped by year under a kicker and an ink rule. Each row shows the topic (taken from the URL path: Authentication, Git, React 19, React 16), the last-updated date, the title and the subtitle, and the whole row is the link.
- **Post** (`PostEditorial`): the article itself.
- **About** (`AboutPage`): name, location, a few paragraphs at 21px, and an "Elsewhere" link list. Add paragraphs as plain `<p>` inside `.about-body`.

**Top bar:** two links, Posts (`/`) and About (`/about`), plus the sun/moon theme button. The current page is underlined in `ink`; on a post, Posts stays underlined because posts live under it.

## Content fundamentals

- Plain words first, the spec's vocabulary second ("the random string" → **code verifier**).
- **Bold** names a concept the first time it appears; *italic* stresses the one word an argument turns on (*actual string*, *their* credentials).
- Every code block gets a one-line caption saying what to notice; highlighted lines are the ones the caption points at.
- Footnotes use an asterisk that links to the note.
- No GIFs, memes or emoji.

## Visual foundations

- **Type:** Newsreader (serif) for everything you read: title 56px light, h2 30px, h3 22px italic, body 20px/1.7. Inter only for small-caps kickers, metadata and captions (`kicker`, `meta`). JetBrains Mono for code.
- **Measure:** `measure` (64ch, about 680px) on tablet and desktop; phones use the full width minus 24px gutters.
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

Phones also turn off hyphenation and the drop cap.

## Iconography

A small inline stroke set on a 24px grid with round caps: role (person), artifact (key), channel (arrows), plus calendar, clock, share, copy, link, code, globe and sun/moon. Icons take `currentColor`. Share buttons are text labels, not brand logos.

## Components

`components/bundle.js` (`window.RyansBlog`) provides the page behaviour: `initPost()` (progress bar, scroll-tracking contents, smooth anchors, copy buttons) and `initThemeToggle()` (the sun/moon button in the top bar).

## Placeholders to replace

- Related reading: "How a Shopify storefront logs you in" stands in for the planned auth-series post.
- The About page text is two placeholder lines.
- GitHub and LinkedIn footer links point to the sites' home pages, and the avatar shows initials.

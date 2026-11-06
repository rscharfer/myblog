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
- Choose between a sidenote, footnote and note by what the extra text is about and whether a reader can skip it:
  - **Sidenote** (`:side` / `:::side`): a skippable "by the way" about one specific word, phrase or sentence (another name for a term, where a value comes from, why something exists).
  - **Footnote** (`†` on a heading): a caveat about a whole section's premise.
  - **Note** (`:::note`): something every reader should see, or anything long or containing code.
  - The test: if a reader never looked at it, would the post still be correct? If not, it isn't a sidenote.
- The OIDC label (`:oidc[…]` in text, `mark="…"` on code blocks) says "this belongs to OpenID Connect, not plain OAuth". It is a category, not emphasis, so it's a grey tag and never a highlight. Label only the terms OpenID Connect adds (the `openid` scope, `nonce`, the ID token and its claims), never the sentences explaining them, so OpenID Connect reads as a small add-on. Explain the label in one sentence the first time it appears in a post. Don't use it for anything else.
- Sidenotes: highlight the smallest passage the note is actually about ("sets a cookie", not the whole sentence). Keep each note to one to three sentences of plain prose, with no code blocks or lists. Allow at most one per paragraph where possible, since notes that crowd together get pushed down away from their passages.
- The interactive flow chart (`::flowchart`) shows a whole flow once per post, after the big picture and before the detailed steps, under its own heading. Its step numbers are its own, so if the prose numbers steps differently, say so in the sentence introducing it. Each parameter gets a badge and a one-sentence "why" that says what would break without it.
- No GIFs, memes or emoji.

## Visual foundations

- **Type ("Font Modern"):** three families, as tokens.
  - `--font-display`, **Bricolage Grotesque**: h1, article h2 and h3, the top-bar links, the post subtitle, pull-quotes, the footer name, related-reading titles, post titles on the Posts page and the name on the About page.
  - `--font-body`, **Figtree**: everything else, i.e. body text plus kickers, metadata, captions and the contents list (`kicker`, `meta`).
  - `--font-mono`, **JetBrains Mono**: code.
- **Type sizes and weights:** title 56px at weight 650 with -0.025em tracking. h2 30px and h3 22px, both 650; h3 is not italic. Body is 18px/1.72 at every width. The subtitle is upright, and pull-quotes are upright at weight 500. About paragraphs are 19px (18px on phones). Inline *em* stays italic, since Figtree has true italics. There is no drop cap.
- **Measure:** `measure` (706px) on tablet and desktop; phones use the full width minus 24px gutters. It was 64ch of the old 20px serif, and is fixed in px so changing fonts doesn't move the layout.
- **Colour:** one accent, `link` (rust), used for links, step numbers, the active contents item, back-channel arrows, the footnote marker, and the sidenote "+" toggle. The OIDC label is `muted` text in a `rule` border, like the flow chart's tags. Everything else is `ink`, `muted` and `paper`. Text passes 4.5:1 in both themes.
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

**Sidenotes:** at ≥ 1220px each note sits in the otherwise empty right column, level with its highlighted passage, in 14px Figtree `muted` with no border. When notes would overlap, the lower one is pushed down (`components/post/useSidenotes.js`). Below 1220px the note is hidden until the reader taps its passage, which is then a toggle button (`aria-expanded`, Enter/Space) with a small `link` "+" after it that becomes "−". The open note follows its paragraph in 14.5px `muted` with a `rule` hairline on the left. Without JavaScript the notes are always shown there. Highlighted passages have a dotted `muted` underline; on devices with hover, hovering a passage or its note gives the passage a `code-hl` background, turns the note `ink` and, in the margin, shows a 2px `link` bar on the note's left edge (like the active contents item).

**Flow chart:** the swimlanes keep their columns at every width; below 640px the lane headings and arrow labels shrink. The current step's row gets a `code-hl` background and the others drop to 50% opacity. Through-the-browser arrows are dashed `muted`, server-to-server arrows solid `link`, and a step on one machine is a solid `ink` square (never an outlined one, which reads as a checkbox). Start and End are `ink` boxes with an inverted label. Required badges are filled `ink`, Recommended has a `muted` border, Optional a `rule` border.

## Iconography

A small inline stroke set on a 24px grid with round caps: role (person), artifact (key), channel (arrows), plus calendar, clock, share, copy, link, code, globe and sun/moon. Icons take `currentColor`. Share buttons are text labels, not brand logos.

## Components

`components/bundle.js` (`window.RyansBlog`) provides the page behaviour: `initPost()` (progress bar, scroll-tracking contents, smooth anchors, copy buttons) and `initThemeToggle()` (the sun/moon button in the top bar).

## Placeholders to replace

- Related reading: "How a Shopify storefront logs you in" stands in for the planned auth-series post.
- The About page text is two placeholder lines.
- GitHub and LinkedIn footer links point to the sites' home pages, and the avatar shows initials.

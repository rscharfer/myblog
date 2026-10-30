# Redesign report

Branch **`redesign`** (one commit per phase plus follow-ups, on top of `master`; nothing pushed). `npm run build` passes, and so does `npm run export`, the command Netlify runs.

## How to review

```sh
git log --oneline master..redesign      # one commit per phase
npm run build && npx next start          # http://localhost:3000
SHOW_FIXTURES=1 npm run build && npx next start
# then open /post/_fixtures/kitchen-sink  (every post element, see below)
```

Pages to look at: `/`, `/about`, `/post/authentication/PKCE`, `/post/react16/use-state`. Check each at 1440px and 390px, and toggle dark mode with the moon button.

**Read this first:** the reference PKCE page has content your real `posts/authentication/PKCE.md` doesn't: three code samples, the five steps, the sequence diagram, the pull-quote, related reading and reworded headings. Because of the "don't change post content" rule, I did **not** add any of it. The template supports all of those elements, and `/post/_fixtures/kitchen-sink` shows them working. The real PKCE post renders with what it actually has.

## What I built

| Phase | Commit | What |
|---|---|---|
| 1 | `8c96bad` | `design/PLAN.md`; the `design/` folder is now tracked on the branch |
| 2 | `ec1c62c` | `styles/blog.css` (tokens + styles ported from the reference), fonts via `next/font`, no-flash theme script in `pages/_document.js` |
| 3 | `1f3127f` | Top bar (Posts / About + `aria-current`), sun/moon toggle, 2px progress bar, footer. Author details live in `lib/site.js` |
| 4 | `e6b1faf` | Post template: header and meta row, contents (sticky list / `<details>` bar), body styles, code blocks, notes, steps, icon list, figure, pull-quote, related reading, reading time at build time |
| 5 | `90c8963` | Posts list generated from front matter, newest first, grouped by year |
| 6 | `7e0e4c3` | About page; the text is in `content/about.md` |
| fix | `d7af499` | Code blocks that scroll horizontally can now be reached by keyboard (axe finding) |

## Rendering decision

I kept **plain `.md` + react-markdown 8** and added a few small remark plugins (`lib/markdown.js`). I did not use MDX: it would have meant converting posts and changing the loader, for no gain this design needs. The plugins run at build time (`lib/posts.js`, which builds the contents list and reading time) and again during render, with identical output, so heading ids always match the contents links.

Markdown syntax for the new elements:

- **Code:** ```` ```js title="pkce.js" {2-3,11} caption="What to notice" ````. Highlighted lines become `.ln.hl`. Prism (already a dependency) token types are mapped to the `t-k/t-s/t-f/t-p/t-c` classes, which are coloured by the `syn-*` tokens. Copy copies the original source string, not the rendered lines.
- **Note / footnote:** write `:::note[Label]{#id}` … `:::`. Your existing † convention also works automatically: a heading ending in `†` plus a paragraph starting with `† ` becomes a dagger link and a note. That's how the PKCE post gets its note with no text changes.
- **Steps:** any ordered list.
- **Icon list:** any bullet list where every item is `**Term:** definition`. Icons come from an optional front-matter map `icons: { Term: role | artifact | channel }`.
- **Figure:** `::figure{wide="a.svg" narrow="b.svg" caption="…"}`. The SVGs sit next to the `.md` file and are inlined at build time so they pick up the theme tokens.
- **Pull-quote attribution:** a blockquote whose last line starts with `— `.
- **Related reading:** front matter `related: [{label, title, href, description}]`.
- The old `## id=foo Heading` syntax still works.

## Packages added

- `remark-directive@2`: for `:::note` and `::figure`.
- `unified@10`, `remark-parse@10`, `mdast-util-to-string@3`, `unist-util-visit@4`: these were already installed as react-markdown 8 dependencies. I declared them directly because I import them, so there's no new code in the install.

No other packages. Highlighting still uses `prism-react-renderer`.

## Acceptance checklist

I tested in headless Chrome (Playwright + axe-core) against `next start`, with 49 automated checks, plus Lighthouse 12.

| Item | Result |
|---|---|
| Light and dark match the screenshots; the theme survives reloads and doesn't flash | **Pass.** The post page matches the reference HTML side by side in both themes. Posts and About are pixel-identical to the reference HTML rendered in the same browser (≤0.002% of pixels differ at 1440 and 390), and the same size as the screenshots. The no-flash check: `data-theme` is already `dark` when `<body>` starts parsing after a reload. Prefers-color-scheme fallback and persistence across pages also checked. |
| At 390px: no horizontal scroll, code wraps, diagram fits, meta hidden, contents bar works | **Pass** on all pages. The bar opens, a link scrolls to the section and closes it. The code wraps with a hanging indent, and the narrow diagram shows. |
| At 1440px: sticky contents highlights the current section; "% read" updates | **Pass** (e.g. 0% → 71%, active = "What problem did it solve?", stays at top 64px) |
| Copy buttons copy the unwrapped code | **Pass.** The clipboard exactly equals the source, tested at 390px where the lines are visually wrapped. |
| Posts list from real data, newest first, grouped by year | **Pass.** 13 posts in 2026 and 2020, built from front matter. |
| 4.5:1 contrast; visible keyboard focus; `aria-current` in the top bar | **Pass.** axe reports 0 violations on every page, including the fixture, in light and dark, at 1440 and 390. With the updated `syn-c` tokens, comments are 5.09:1 (light) / 5.03:1 (dark) on highlighted lines and 5.77 / 5.78 on `code-bg`. Focus shows as a 2px outline. `aria-current` is `page` on `/` and `/about`, and `true` on posts. |
| Lighthouse accessibility ≥ 95 | **Pass.** 100 on `/`, `/about`, PKCE, use-state and the fixture, mobile and desktop. |

## Not sure about / judgment calls

1. **Posts and About styles (resolved).** The first version of `reference/styles.css` had no rules for these pages, so I improvised them from the HANDOFF text. Once you added styled screenshots and the rules, I replaced my improvised CSS with yours, copied exactly.
2. **Note label.** The reference uses "* No web server?", but your post uses †, so the note reads "† Note". I didn't invent a label or change your marker. The `:::note[Label]` syntax lets you set any label.
3. **Glossary punctuation.** In the icon list, "**Term:** def" renders as "**Term** — def", per the spec. The Markdown is unchanged.
4. **Comments (utterances) are kept.** The design doesn't mention them. They now sit below the article and follow the light/dark toggle. Remove `<Comments />` in `pages/post/[...slug].js` if you don't want them.
5. **The "N sections" count** includes h3s (the reference shows 9 for 6 h2 + 3 h3, so I matched that).
6. **Reading time** = words ÷ 230, rounded, minimum 1, code included.
7. **Share links** point at `https://ryansblog.netlify.app/post/<topic>/<slug>` (the reference used a placeholder `/oauth-pkce`).
8. **Raw HTML in Markdown is escaped**, as before: I didn't add `rehype-raw`. Figures come through `::figure` instead.

## Typography update ("Font Modern")

The fonts are now Bricolage Grotesque (`--font-display`) and Figtree (`--font-body`), with JetBrains Mono kept for code. The old `--font-serif` / `--font-sans` tokens are gone, and the drop cap is removed. `design/tokens.json` and `DESIGN.md` describe the new type.

- **`--measure` is now `706px`, not `64ch`.** `ch` depends on the font, so switching to 18px Figtree widened the text column from 706px to 738px. I pinned it to the old width so the layout stays exactly the same.
- **Rendered fonts:** checked through Chrome's `CSS.getPlatformFontsForNode`, on every element of Posts, PKCE, use-state and About, at 1440 and 390, light and dark. Only Bricolage Grotesque, Figtree and JetBrains Mono render, and code is all JetBrains Mono. CLS is 0, there's no horizontal scroll, and the column is 706px on desktop. There are two system-font glyphs, and neither was caused by the switch:
  - The 👍🏼 in use-state renders in Apple Color Emoji. No web font has emoji.
  - The `⁂` end mark (`hr.end::before`) renders in the system font. None of the new fonts has that glyph, and neither did Newsreader or Inter, so it was always a fallback.
- `next/font` serves the full variable weight axis (Bricolage 200–800, Figtree 300–900) rather than exactly 400–700. That's a self-hosting detail and doesn't change any styles.
- `design/reference/styles.css` still uses the old fonts. It's the original handoff reference, so I left it as is.

## Placeholders still to replace

- **Avatar:** the initials "RS" show until you add a drawing. Put a square image in `public/` (e.g. `public/avatar.png`) and set `avatar: "/avatar.png"` in `lib/site.js`. It's cropped to a circle everywhere the avatar appears.
- **Done:** About text (`content/about.md`), GitHub and LinkedIn profile URLs. Location is now Springfield, Oregon. The fixture's related-reading link points at the git-worktree post instead of the Shopify placeholder.

## Files I didn't delete but think could go

Nothing imports these any more:

- `color.js`, `constants.js` (old palette and golden-ratio constant)
- `siteconfig.json` (unused; the site name, now "Second Draft", lives in `lib/site.js`)
- `othermarkdown/` (`frontPage.md`, `learningLog.md`, `aboutMe.md`), `oldPosts/`
- The `raw-loader` dependency and its rule in `next.config.js`: posts are now read with `fs` in `getStaticProps`. I left `next.config.js` alone.

I did delete `components/CustomRenderers/` and `customPrismTheme.js`, because the new template replaces them directly.

## Untouched

Netlify config, env files and CI. Post bodies are unchanged: the only post edit is new `icons:` front matter in `posts/authentication/PKCE.md`. No files were renamed, so URLs are the same. `.claude/` was untracked at the start and is still untracked.

---
name: paste-to-post
description: Turn a pasted or drafted blog post (plain text, Google Doc copy, or a file whose text is the draft) into a correctly formatted Markdown post under posts/<topic>/ for the Worked Examples blog. Converts `{{figure ...}}`-style draft placeholders into the blog's directive syntax and reports which assets and details the author still owes. Use when Ryan pastes a post, says "here is input for the next post", or asks to create a new post file from text.
---

# Paste to post

Input: the draft text, either in the message or in a file the user names (often a file already sitting in `posts/<topic>/`; if so, the output **replaces** that file's contents). Output: one finished `posts/<topic>/<slug>.md`, plus a report of what is still missing.

The user's request to create or convert this file counts as permission to write it. This skill never edits any other existing post (CLAUDE.md: never edit a post without asking).

## 1. Read the rules first

Read these every time; they change:

- `README.md` ("Writing a post", "Markdown extras")
- `design/fixtures/kitchen-sink.md` (the exact syntax of every element)
- `design/DESIGN.md` → "Content fundamentals" (sidenote vs footnote vs note, caption rules)
- `lib/markdown.js` and `lib/posts.js` if a placeholder doesn't obviously map to a supported element; check what actually renders, not what the README implies.

## 2. Place the file

- Path = URL. `posts/<topic>/<slug>.md` → `/post/<topic>/<slug>`. Use an existing topic folder when one fits (`ls posts`). If the user named a file or folder, use it. If neither exists and the topic isn't obvious, ask; never rename or move existing posts.
- Slug: lowercase, hyphenated, or keep the user's filename.

## 3. Front matter

```yaml
---
title: ...
created: Month D, YYYY     # today's date; never touch `created` on an existing post
subtitle: ...              # a real sentence; it is the meta description
related: [...]             # only if the draft lists related links
---
```

- Lift `Title:` / `Subtitle:` lines from the draft into front matter and remove them from the body. Don't reword them.
- A literal colon in `title`/`subtitle` is written `{:}`.
- Never write `updated:` (the pre-commit hook does it).
- Don't invent `image:` (needs a rendered PNG in `public/og/`); list it as optional follow-up.
- `icons:` only if the post has a `**Term:** definition` bullet list that should carry role/artifact/channel icons.
- `related`: each entry needs `label`, `title`, `href`, `description`. If an href is unknown, put the entry in as a YAML comment with `TODO`, so `npm run check-links` and the pre-commit hook don't fail on it. Internal links are `/post/<topic>/<slug>`; verify the target file exists.

## 4. Convert the body

Keep the author's prose verbatim (including curly quotes and `--`). Only change what must change. Don't add new claims; if you add a connecting sentence or heading the draft didn't have, list it in the report.

Draft placeholders (`{{...}}` or similar) become:

| Draft says | Write |
|---|---|
| `{{figure ...}}` | Screenshots/photos (PNG, JPG): copy the file next to the `.md` and write `::figure{src="a.png,b.png" alt="..." caption="..."}` (comma-separated = shown in a row; always write `alt`). Diagrams: `::figure{wide="x.svg" narrow="y.svg" caption="..."}` with SVGs next to the `.md` (inlined; a missing file fails the build). Either way, on its own line; "Fig. N" labels are automatic. Raster files are copied to `public/post-images/<slug>/` at build time (git-ignored). Screenshots Ryan keeps outside the repo (e.g. a folder on the Desktop) get copied in. |
| `{{side, anchored on "X": "note"}}` | In the paragraph, wrap exactly the anchored words: `:side[X]{#id}`. Directly after that paragraph add `:::side{#id}` / note / `:::`. Unique kebab-case ids. Wrap only the smallest passage; the text must match the paragraph verbatim; one to three plain sentences; no code or lists in a sidenote; ~one per paragraph where possible. If the anchor occurs more than once, wrap the occurrence that fits the note. |
| `{{note[Label]: text}}` | `:::note[Label]` … `:::` (add `{#id}` only if linked) |
| `{{blockquote with attribution: ...}}` | `> quote` / `>` / `> — Attribution` (last line starts with `— `). Separate quotes with a blank line. |
| `{{code block, lang, title=..., highlight ...}}` | ```` ```lang title="..." {lines} caption="..." ````. Highlight lines are the ones the caption points at. Every code block gets a one-line caption. |
| `{{flowchart ..., flow="name"}}` | `::flowchart{flow="name"}` on its own line, under its own `##`/`###` heading with a sentence of intro. The flow's content lives in `components/post/flows/<name>.js` and must be registered in `FLOWS` in `components/post/flowchart/FlowChart.js`; if it isn't, it's a to-do (don't build it unless asked). |
| `{{related links ...}}` | front matter `related:` |
| footnote / caveat about a whole section | heading ends with `†`, paragraph starts with `† ` |
| OpenID Connect terms | `:oidc[...]` (only for OIDC-specific posts) |

Never use raw HTML (it is escaped). Never use emoji, GIFs or memes in the output.

When the draft only *describes* content ("an excerpt of my message", "the real JSON schema"), do not fabricate it. Write the element with a clearly marked `TODO(Ryan): ...` placeholder in the right place with the right fence/language, so the structure and highlights are ready. Content the draft states verbatim (e.g. a quote given in full) goes in as is.

Choosing sidenote vs note vs footnote: if a reader skipping it leaves the post still correct → sidenote; otherwise note or main text.

## 5. Check

- Run `npm run build` if the post has no unresolved asset references; otherwise say the build will fail until the SVGs/flows exist, and name which. (Build also validates `created`.)
- Don't commit. If the user asks, commit with a short imperative message and the required Co-Authored-By line; the pre-commit hook checks links, so fix broken links rather than using `--no-verify`. Never push.

## 6. Report back

Start with one line naming the audience as you understood it only if you produced something for someone other than Ryan (normally not needed here). Then give:

1. The file path and URL.
2. **Needs from you**, grouped:
   - Assets: every figure with its exact filename, format required, and what it should show.
   - Placeholders: every `TODO(Ryan)` (code blocks, quotes, prompts) with what to paste.
   - Flows: any `::flowchart` whose data file or registration is missing.
   - Links: any `related` entries left commented out and what URL is needed.
   - Optional: `image:` Open Graph card.
3. **Judgment calls**: anything you added or changed beyond the draft (headings, intro sentences, dropped lines), and unsupported features.

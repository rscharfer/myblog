---
name: verify-change
description: Verify a change to the Worked Examples blog works. Builds the site, starts the dev server, runs an HTTP smoke test of every page, then opens the affected pages in Chrome to check the console, network, layout at desktop and phone width, and any interactive element (flow charts, sidenotes, code blocks). Use after changing components, styles, lib/, flows or posts, when CLAUDE.md's "Making changes" checklist applies, or when Ryan says "verify", "check it works" or "test the page".
---

# Verify change

CLAUDE.md requires this after every change to the repo: build, look at it in the browser, use Chrome DevTools data to find anything out of the ordinary, and fix what fails. This skill is that checklist. Do the steps in order and stop to fix a failure before continuing; don't report success on a step you skipped.

## 1. Work out what changed and which pages it touches

```sh
git status --short && git diff --stat
```

Map changes to pages to open (always include at least one):

| Changed | Open |
|---|---|
| `posts/<topic>/<slug>.md` or its images/SVGs | `/post/<topic>/<slug>` |
| `components/post/flows/*`, `flowchart/*` | every post with `::flowchart` (`grep -rl "::flowchart" posts design/fixtures`) |
| `components/post/*`, `lib/markdown.js`, `lib/posts.js`, `styles/*` | the kitchen-sink page (see below) plus the two or three posts that use the element most |
| `pages/*`, `lib/sitemap.js`, `components/*` (site chrome) | `/` and one post |

For anything touching a Markdown extra or its styling, the kitchen sink shows every element:
`SHOW_FIXTURES=1 npm run build && npx next start`, then `/post/_fixtures/kitchen-sink`. Plain `npm run dev` hides it unless `SHOW_FIXTURES=1` is set for the dev server too.

## 2. Static checks

Run what applies; fix failures before going on.

```sh
node .claude/skills/new-flow/check-flow.mjs        # if flows or FlowChart.js changed
npm run check-links                                 # if a post changed (or pass file paths)
npm run build                                       # always; fails on bad `created` dates, missing figure files, JS errors
```

`npm run build` must finish without errors, and warnings about sidenotes missing their pair count as failures. Read its output, don't just check the exit code. (Don't run `npm run export` unless asked; `build` is enough to prove it compiles.)

## 3. Start the server and smoke test

Use a port nobody is using. If something already answers on 3000, `lsof -i :3000` to see what.

`npm run build` overwrites `.next/`, which a running `npm run dev` also uses, so it can leave Ryan's dev server in an odd state. If a dev server is already running, don't start a second one and don't kill it: serve the fresh build instead with `npx next start -p 3100` (in the background) and test that. At the end, confirm the original dev server still answers (`curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/`) and tell Ryan to restart it if it doesn't or acts strangely. If nothing is running, `npm run dev -- -p 3100` is fine.

```sh
npm run dev            # run in the background (run_in_background), wait until it prints "ready"
node .claude/skills/verify-change/smoke.mjs http://localhost:3000            # every post
node .claude/skills/verify-change/smoke.mjs http://localhost:3000 /post/AI/thankyouapp
```

The smoke test checks status 200, every image/stylesheet/script loads, no `TODO(Ryan)` or error text in the HTML, and that Markdown features (flow chart, figure, sidenote, code block) produced their markup. Any `FAIL` is a real bug in the change or a missing asset; fix and re-run. (Dev mode compiles pages on first request, so the first run is slow.)

## 4. Look at it in Chrome

Load the browser tools once, together, then work in a **new** tab (never reuse old tab ids):

```
ToolSearch: select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__read_page,mcp__claude-in-chrome__find,mcp__claude-in-chrome__read_console_messages,mcp__claude-in-chrome__read_network_requests,mcp__claude-in-chrome__resize_window,mcp__claude-in-chrome__javascript_tool,mcp__claude-in-chrome__tabs_close_mcp
```

Then `tabs_context_mcp` first, `tabs_create_mcp`, and for each page from step 1:

1. **Navigate**, wait for it to settle, then `read_console_messages` (pattern `error|warn|Warning|hydrat`) and `read_network_requests`. Failures to look for: any console error, React hydration or key warnings, 404s on images/fonts/scripts, requests that never finish.
2. **Desktop (about 1280 wide):** screenshot. Look for: broken or missing images, text overflowing its box, overlapping elements, unstyled content, sidenotes landing in the margin level with their passage (1220px and up), a missing title/kicker.
3. **Phone (`resize_window` to about 390 x 844):** screenshot and scroll through. No horizontal page scroll (check with `javascript_tool`: `document.documentElement.scrollWidth <= window.innerWidth`), tables and code scroll inside their own box, flow chart column headers and arrow labels fit, sidenote "+" opens its note. Restore the window size afterwards.
4. **Dark theme** if the change touched styles or colours: toggle however the site's theme control works and look again.
5. **Exercise what changed.** Examples:
   - *Flow chart:* click Next through every step to the last ("the end"), then Back to step 1; click a parameter and confirm its line highlights in the message; click a row in the diagram; use the arrow keys; confirm Back is disabled on step 1 and Next on the last.
   - *Code block:* the Copy button changes to "Copied".
   - *Figures:* every image loaded. Images are `loading="lazy"`, so offscreen ones look broken until scrolled to. Scroll each into view first (`javascript_tool`: `for (const i of document.images) { i.scrollIntoView(); await new Promise(r => setTimeout(r, 150)); }`, then wait half a second), and only then check `[...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src)`, which should be empty.
   - *Sidenote/footnote links:* the anchor scrolls to its target.
6. After the interactions, read the console again; errors that only appear on interaction are the common ones.

If a browser tool fails two or three times, stop and tell Ryan what happened rather than looping (the Chrome guidance applies). Avoid anything that opens a JS alert or dialog.

## 5. Clean up

Stop the dev server you started (kill the background job; confirm the port is free with `lsof -i :3000`), close the tab you opened, and make sure verification left no new tracked-file changes (`git status --short`; `public/post-images/` and `public/sitemap.xml` are git-ignored build output and fine). Don't commit unless asked, and never push.

## 6. Report

Say exactly what ran and what it showed, in this shape:

- **Static:** flow validator / link check / build: pass or the failing output.
- **Smoke:** pages tested, any `FAIL` lines.
- **Browser:** which pages at which widths, what you clicked, console and network findings (quote any error).
- **Fixed:** anything you found and fixed, and the file.
- **Not checked:** anything skipped and why (be explicit).

If something is broken and you can't fix it, say so plainly and show the evidence; don't describe it as working.

# CLAUDE.md

Ryan Scharfer's blog, "Worked Examples": Next.js 13 (pages router), statically exported and hosted on Netlify. Posts are Markdown under `posts/<topic>/`.

Read [README.md](README.md) for the post format, front matter rules, Markdown extras and where things live. Read [design/DESIGN.md](design/DESIGN.md) before changing anything visual or the way content is written.

## Commands

```sh
npm run dev                         # http://localhost:3000
npm run build && npm run export     # what Netlify runs; output in out/
npm run check-links                 # check links in every post (or pass file paths)
SHOW_FIXTURES=1 npm run build && npx next start   # /post/_fixtures/kitchen-sink shows every element
```

There are no tests. To verify a change, run `npm run build` (it fails on bad `created` dates) and look at the page in `npm run dev`.

## Editing posts
- Never edit a post without asking. The author will ask for help when needed.
- Never write or change `updated:` by hand. The pre-commit hook stamps it when a post's content changes. Never edit `created:` on an existing post.
- The folder under `posts/` is part of the URL, so moving or renaming a post breaks links to it. Ask first.
- Raw HTML in Markdown is escaped; use the Markdown extras in the README instead.

## Commits

- The pre-commit hook (`.githooks/`) checks links in staged posts and then stamps `updated:`. If it blocks a commit on a broken link, fix the link rather than using `--no-verify`. Only use `--no-verify` when asked.
- Write commit messages as a short imperative sentence describing the change ("Align the updated date with the topic in the post kicker").
- Don't push or deploy; Ryan does that.

## Ignore

- `oldPosts/` and `othermarkdown/` are retired drafts and aren't built.
- `.next/` and `out/` are build output. `public/sitemap.xml` is generated.
- `design/reference/` and `design/screenshots/` are the redesign's reference material, not live code.

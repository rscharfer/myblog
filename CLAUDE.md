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

### Commit at task boundaries

- Before starting work that is unrelated to the previous task (different files or a different goal), or when Ryan signals he's done, check for uncommitted changes from that task. If there are any, ask whether to commit them, and include the proposed commit message and file list in the question.
- If Ryan says yes, stage only the files changed for that task by explicit path (never `git add -A` / `git add .`), then commit. A yes counts as permission to commit.
- Follow the rules above for message style and the pre-commit hook.

## Ignore

- `oldPosts/` and `othermarkdown/` are retired drafts and aren't built.
- `.next/`, `.next-dev/` (dev server only) and `out/` are build output. `public/sitemap.xml` is generated.
- `design/reference/` and `design/screenshots/` are the redesign's reference material, not live code.


## Making changes

- when you make changes to the repo, build the app to see that is still builds and run test in the browser to make sure it still works. Use Chrome Dev tools to check if you see anything out of the ordinary. If something fails, fix it.

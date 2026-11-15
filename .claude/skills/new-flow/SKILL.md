---
name: new-flow
description: Create or edit an interactive flow chart (swimlane walkthrough) for the Worked Examples blog. Builds the data file in components/post/flows/, registers it in FLOWS in FlowChart.js, adds the `::flowchart` directive to the post, and validates lane ids, arrows, line numbers and step references. Use when Ryan describes a sequence of requests/steps between systems and wants an interactive flow, says "make a flow for ...", or asks to fix or extend an existing flow.
---

# New flow

A flow is data, not Markdown: `components/post/flows/<camelName>.js` exports one object that `Walkthrough` renders as swimlanes, Back/Next buttons and a per-step panel with the real message and a "why" for each parameter. Existing examples to copy from:

- `components/post/flows/recordANote.js`: system-to-system calls with HTTP, JSON, JS and multipart messages (the more recent, simpler one)
- `components/post/flows/authorizationCode.js`: uses `at`, `tags`, `mark`, `paramsLabel` and `checks`

Read one of them (and `components/post/flowchart/shared.js`, which renders every field) before writing; they are the spec. Never invent the content: the steps, messages and reasons come from Ryan or from the code he built. If something is missing, ask, or write a clearly marked `TODO(Ryan)` rather than making up a request.

The post file is Ryan's (CLAUDE.md: never edit a post without asking). Creating a flow counts as permission to add the one `::flowchart` line, and the intro, to the post he named. Nothing else in the post changes.

## 1. Gather the story

Before writing anything, make sure you know, and list back if unsure:

- **Lanes:** each system or machine that takes part, in left-to-right order of first appearance. Four to six is comfortable; more gets cramped on a phone.
- **Before / Start / End:** one sentence each. *Before* is what must already be true (sign-in, registration). *Start* is the user's action. *End* is what is true when it's finished.
- **Steps:** in order. For each: who talks to whom (or what happens on one machine), the actual message, and why each parameter is there.
- **Source of truth:** the code, docs or logs the messages come from. Real shapes only; shorten with `…`, and say "(shortened)" in the message title.

## 2. Write the data file

File name camelCase (`recordANote.js`), export name the same, with a short header comment saying what the flow is.

```js
export const myFlow = {
  title: "Short human title",                       // aria-label of the figure
  lanes: [{ id: "phone", short: "Phone", name: "My phone (the installed PWA)" }],
  before: "…", start: "…", end: "…",
  steps: [ /* see below */ ],
};
```

**Lanes:** `id` unique and used by arrows; `short` is the column header (keep it to about a dozen characters); `name` shows on hover.

**Step fields:**

| Field | Rule |
|---|---|
| `id` | unique, kebab-case |
| `short` | the row label in the diagram, about 40 characters or fewer |
| `title` | the panel heading: a sentence about what happens |
| `arrows` **or** `at` | exactly one. `arrows: [{ from, to, channel, label }]` for a message between lanes (add the reply as a second arrow going back). `at: "laneId"` for work on one machine. `channel` is `front` (travels through the user's device or browser) or `back` (server to server). `label` is a few words. |
| `summary` | what happens and why, in plain sentences. "step N" references must be real step numbers. |
| `message` | `{ title, lang, code, mark?, caption? }`. `code` is a string (use an array `.join("\n")` for readability); `lang` is a Prism language (`http`, `json`, `js`, `text`). |
| `params` | `[{ name, line, level?, why, tags? }]`. `line` is the **1-based line of `message.code`** where the parameter sits. `level` is `required`, `recommended` or `optional` for things the app sends; leave it off for things it receives or creates. `why` is why it's there, not what it is. |
| `checks` + `checksLabel` | optional list, e.g. "If something goes wrong" |
| `paramsLabel` | optional heading replacing "Parameters" (e.g. "What it creates") |
| `notShown` | optional: what was left out of the message on purpose |
| `tags` | optional; only `"oidc"` has meaning today (OpenID Connect posts) |

Writing rules (from `design/DESIGN.md`, "Content fundamentals"; read it): plain sentences, no emoji, the author's voice ("I tap Record"), no jargon without a reason. A parameter's `why` should let a junior engineer know what breaks without it.

## 3. Register it

In `components/post/flowchart/FlowChart.js`: add `import { myFlow } from "../flows/myFlow";` and an entry in `FLOWS`, `"my-flow": myFlow`. The key is kebab-case and is what the post uses.

## 4. Add it to the post

On its own line, under its own `##` heading with a sentence of intro (so the section can be linked to):

```markdown
## Walk through <what>

An interactive walkthrough of …. Back and Next (or the arrow keys) move through it.

::flowchart{flow="my-flow"}
```

## 5. Verify

Run all three; fix anything they report before saying it's done.

1. **Validate the data:**
   ```sh
   node .claude/skills/new-flow/check-flow.mjs                              # all flows
   node .claude/skills/new-flow/check-flow.mjs components/post/flows/myFlow.js
   ```
   Errors (exit code 1) are real: bad lane ids, arrows from a lane to itself, unknown channel/level, param lines outside the message, "step N" that doesn't exist, missing registration. Warnings are judgment calls: a param name not found on its line (check the number), an overlong label, a lane no step uses, a registered flow no post uses. Fix or justify each one.
2. **Build:** `npm run build`. It must pass; the flow is imported by `FlowChart.js`, so a syntax error breaks every post.
3. **Look at it:** follow the `verify-change` skill for the post's page. In particular, step through the flow with Next, and check on a phone-width window:
   - the swimlane header labels fit and the arrow labels don't collide,
   - every step's panel shows its message and a highlighted line when a parameter is selected (the highlight should land on the line that parameter names),
   - the last step shows "the end", and the Start/End boxes read correctly,
   - no console errors.

## 6. Report

List: the files created or changed, the validator's final output (errors and any remaining warnings, with why they're acceptable), anything marked `TODO(Ryan)`, and the facts you were unsure of that Ryan should double-check against his code. Don't commit unless asked (and never push).

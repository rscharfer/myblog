// Pre-commit hook (wired up by .githooks/pre-commit): sets `updated: <today>` in the front
// matter of every post whose content changed in this commit. New posts only get `created`.
// Skip it for one commit with `git commit --no-verify`.
import { execFileSync } from "child_process";
import fs from "fs";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const now = new Date();
const today = `${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

const git = (args, input) => execFileSync("git", args, { encoding: "utf8", input });

// Applies `edit` to the front matter only, so a body line starting "updated:" is left alone.
function editFrontMatter(text, edit) {
  return text.replace(/^---\n([\s\S]*?)\n---/, (all, front) => `---\n${edit(front)}\n---`);
}

// The dates aren't content: changing only them shouldn't count as an update.
const withoutDates = (text) => editFrontMatter(text, (front) => front.replace(/^(created|updated):.*(\n|$)/gm, ""));

function stamp(text) {
  return editFrontMatter(text, (front) =>
    /^updated:/m.test(front)
      ? front.replace(/^updated:.*$/m, `updated: ${today}`)
      : front.replace(/^created:.*$/m, (line) => `${line}\nupdated: ${today}`)
  );
}

const changed = git(["diff", "--cached", "--name-only", "--no-renames", "--diff-filter=M", "--", "posts"])
  .split("\n")
  .filter((file) => file.endsWith(".md"));

for (const file of changed) {
  const staged = git(["show", `:${file}`]);
  if (withoutDates(staged) === withoutDates(git(["show", `HEAD:${file}`]))) continue;
  // A post created today and edited again before the day is out isn't "updated".
  if (new RegExp(`^created: ${today}$`, "m").test(staged)) continue;

  const stamped = stamp(staged);
  if (stamped === staged) continue;

  // Rewrite the staged blob rather than `git add`, so unstaged edits stay unstaged.
  const mode = git(["ls-files", "-s", "--", file]).split(" ")[0];
  const blob = git(["hash-object", "-w", "--stdin", "--path", file], stamped).trim();
  git(["update-index", "--cacheinfo", `${mode},${blob},${file}`]);
  if (fs.existsSync(file)) fs.writeFileSync(file, stamp(fs.readFileSync(file, "utf8")));

  console.log(`stamp-updated: ${file} → updated: ${today}`);
}

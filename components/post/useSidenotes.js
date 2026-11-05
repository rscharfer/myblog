import { useEffect } from "react";

const WIDE = "(min-width:1220px)";
const GAP = 16; // minimum space between two notes in the margin

// Sidenotes (:side / :::side in Markdown).
// At 1220px and up the CSS takes each note out of the flow into the right margin; this
// places it level with its highlighted passage, pushes it down if it would overlap the
// note above, and sizes it to the margin column. Hovering a passage or its note
// highlights both.
// Below 1220px each passage becomes a toggle button that shows or hides its note
// under the paragraph. Without JavaScript the notes simply stay visible there.
export default function useSidenotes(slug) {
  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;
    const notes = Array.from(article.querySelectorAll("aside.side[data-side]"));
    const pairs = notes
      .map((note) => ({ note, ref: article.querySelector(`.side-ref[data-side="${CSS.escape(note.dataset.side)}"]`) }))
      .filter((p) => p.ref);
    if (!pairs.length) return;

    const mq = window.matchMedia(WIDE);
    const open = new Set(); // ids of notes opened by tapping (narrow screens only)

    const setTappable = (on) => {
      article.classList.toggle("side-tap", on);
      pairs.forEach(({ note, ref }) => {
        if (on) {
          ref.setAttribute("role", "button");
          ref.setAttribute("tabindex", "0");
          ref.setAttribute("aria-controls", note.id);
          ref.setAttribute("aria-expanded", String(open.has(note.dataset.side)));
          note.hidden = !open.has(note.dataset.side);
        } else {
          ["role", "tabindex", "aria-controls", "aria-expanded"].forEach((a) => ref.removeAttribute(a));
          note.hidden = false;
        }
      });
    };

    const layout = () => {
      if (!mq.matches) {
        setTappable(true);
        pairs.forEach(({ note }) => {
          note.style.top = "";
          note.style.width = "";
        });
        return;
      }
      setTappable(false);
      const box = article.getBoundingClientRect();
      const grid = article.parentElement;
      const gridBox = grid.getBoundingClientRect();
      const width = Math.max(120, gridBox.right - parseFloat(getComputedStyle(grid).paddingRight) - box.right - 48);
      const lineHeight = parseFloat(getComputedStyle(article).lineHeight) || 31;
      let floor = -Infinity;
      pairs.forEach(({ note, ref }) => {
        note.style.width = width + "px";
        const line = ref.getClientRects()[0] || ref.getBoundingClientRect();
        // Centre the note's first line on the passage's first line.
        const noteLine = parseFloat(getComputedStyle(note).lineHeight) || 22;
        const top = Math.max(line.top - box.top + (lineHeight - noteLine) / 2 - (lineHeight - line.height) / 2, floor);
        note.style.top = top + "px";
        floor = top + note.offsetHeight + GAP;
      });
    };

    const toggle = (ref) => {
      const id = ref.dataset.side;
      open.has(id) ? open.delete(id) : open.add(id);
      setTappable(true);
    };
    const tapTarget = (e) => {
      if (mq.matches || e.target.closest("a")) return null;
      const ref = e.target.closest(".side-ref[role=button]");
      return ref && article.contains(ref) ? ref : null;
    };
    const onClick = (e) => {
      const ref = tapTarget(e);
      if (ref) toggle(ref);
    };
    const onKey = (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const ref = tapTarget(e);
      if (!ref) return;
      e.preventDefault();
      toggle(ref);
    };

    const hot = (e, on) => {
      const el = e.target.closest?.("[data-side]");
      if (!el || !article.contains(el)) return;
      const related = e.relatedTarget?.closest?.("[data-side]");
      if (related && related.dataset.side === el.dataset.side) return;
      article
        .querySelectorAll(`[data-side="${CSS.escape(el.dataset.side)}"]`)
        .forEach((x) => x.classList.toggle("is-hot", on));
    };
    const over = (e) => hot(e, true);
    const out = (e) => hot(e, false);

    const ro = new ResizeObserver(layout);
    ro.observe(article);
    mq.addEventListener("change", layout);
    window.addEventListener("resize", layout);
    document.fonts?.ready.then(layout);
    article.addEventListener("mouseover", over);
    article.addEventListener("mouseout", out);
    article.addEventListener("click", onClick);
    article.addEventListener("keydown", onKey);
    layout();

    return () => {
      ro.disconnect();
      mq.removeEventListener("change", layout);
      window.removeEventListener("resize", layout);
      article.removeEventListener("mouseover", over);
      article.removeEventListener("mouseout", out);
      article.removeEventListener("click", onClick);
      article.removeEventListener("keydown", onKey);
    };
  }, [slug]);
}

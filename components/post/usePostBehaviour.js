import { useEffect } from "react";

// Port of design/reference/blog.js for the post page: "% read", the active
// contents item, and closing the mobile contents after a link is chosen.
// (The progress bar and theme button live in components/Header.js.)
export default function usePostBehaviour() {
  useEffect(() => {
    const pct = document.querySelector("[data-pct]");
    const links = Array.from(document.querySelectorAll(".toc a"));
    const heads = links
      .map((a) => document.getElementById(decodeURIComponent(a.getAttribute("href").slice(1))))
      .filter((el, i, arr) => el && arr.indexOf(el) === i);

    const tick = () => {
      const se = document.scrollingElement || document.documentElement;
      const max = se.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, se.scrollTop / max) : 0;
      if (pct) pct.textContent = Math.round(p * 100) + "%";
      let cur = heads[0];
      heads.forEach((el) => {
        if (el.getBoundingClientRect().top < 140) cur = el;
      });
      links.forEach((a) => a.classList.toggle("active", !!cur && a.getAttribute("href") === "#" + cur.id));
    };

    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      const details = a && a.closest("details");
      if (details) details.open = false;
    };

    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick);
    document.addEventListener("click", onClick);
    tick();
    return () => {
      window.removeEventListener("scroll", tick);
      window.removeEventListener("resize", tick);
      document.removeEventListener("click", onClick);
    };
  }, []);
}

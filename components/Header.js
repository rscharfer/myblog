import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import Icon from "./icons";

// Reading progress bar, scaled with page scroll.
function Progress() {
  useEffect(() => {
    const bar = document.querySelector(".progress i");
    const tick = () => {
      const se = document.scrollingElement || document.documentElement;
      const max = se.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, se.scrollTop / max) : 0;
      bar.style.transform = `scaleX(${p})`;
    };
    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick);
    tick();
    return () => {
      window.removeEventListener("scroll", tick);
      window.removeEventListener("resize", tick);
    };
  }, []);

  return (
    <div className="progress" aria-hidden="true">
      <i />
    </div>
  );
}

// The inline script in _document.js sets data-theme before paint; this button flips and saves it.
function ThemeButton() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  const toggle = () => {
    const theme = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch (_) {}
    setDark(!dark);
    window.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
  };

  return (
    <button
      type="button"
      className="theme-btn"
      data-theme-toggle
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
    >
      <Icon name="moon" className="moon" />
      <Icon name="sun" className="sun" />
    </button>
  );
}

export default function Header() {
  const { pathname } = useRouter();
  // On a post, Posts stays current because posts live under it.
  const postsCurrent = pathname === "/" ? "page" : pathname.startsWith("/post/") ? "true" : undefined;
  const aboutCurrent = pathname === "/about" ? "page" : undefined;

  return (
    <>
      <Progress />
      <header className="topbar">
        <nav className="mainnav" aria-label="Main">
          <Link href="/" aria-current={postsCurrent}>
            Posts
          </Link>
          <Link href="/about" aria-current={aboutCurrent}>
            About
          </Link>
        </nav>
        <ThemeButton />
      </header>
    </>
  );
}

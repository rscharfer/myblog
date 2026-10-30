import { useEffect, useRef } from "react";

import { site } from "../../lib/site";

// Custom themes in public/giscus/ match the site's tokens. giscus loads them cross-origin,
// so they only work where /giscus/* is served with Access-Control-Allow-Origin: https://giscus.app.
const giscusTheme = (theme) => {
  const mode = theme === "dark" ? "dark" : "light";
  return site.comments.customTheme ? `${window.location.origin}/giscus/${mode}.css` : `noborder_${mode}`;
};

// giscus comments (GitHub Discussions on site.comments.repo), themed to match the site.
// Renders nothing until the discussion category is configured in lib/site.js.
export default function Comments() {
  const container = useRef(null);
  const { repo, repoId, category, categoryId } = site.comments;

  useEffect(() => {
    if (!categoryId) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.crossOrigin = "anonymous";
    script.async = true;
    Object.entries({
      repo,
      "repo-id": repoId,
      category,
      "category-id": categoryId,
      mapping: "pathname",
      strict: "1",
      "reactions-enabled": "1",
      "emit-metadata": "0",
      "input-position": "top",
      theme: giscusTheme(document.documentElement.getAttribute("data-theme")),
      lang: "en",
      loading: "lazy",
    }).forEach(([key, value]) => script.setAttribute(`data-${key}`, value));
    container.current.append(script);

    const onTheme = (e) => {
      const frame = container.current?.querySelector("iframe.giscus-frame");
      frame?.contentWindow.postMessage({ giscus: { setConfig: { theme: giscusTheme(e.detail) } } }, "https://giscus.app");
    };
    window.addEventListener("themechange", onTheme);
    return () => window.removeEventListener("themechange", onTheme);
  }, [repo, repoId, category, categoryId]);

  if (!categoryId) return null;
  return <div className="comments giscus" ref={container} />;
}

import { useEffect, useRef } from "react";

const utterancesTheme = (theme) => (theme === "dark" ? "github-dark" : "github-light");

// utterances comments (GitHub issues on rscharfer/myblog), themed to match the site.
export default function Comments() {
  const container = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://utteranc.es/client.js";
    // The response allows any origin, so the request must be made without credentials.
    script.crossOrigin = "anonymous";
    script.defer = true;
    script.setAttribute("repo", "rscharfer/myblog");
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("theme", utterancesTheme(document.documentElement.getAttribute("data-theme")));
    container.current.append(script);

    const onTheme = (e) => {
      const frame = container.current?.querySelector("iframe.utterances-frame");
      frame?.contentWindow.postMessage({ type: "set-theme", theme: utterancesTheme(e.detail) }, "https://utteranc.es");
    };
    window.addEventListener("themechange", onTheme);
    return () => window.removeEventListener("themechange", onTheme);
  }, []);

  return <div className="comments" ref={container} />;
}

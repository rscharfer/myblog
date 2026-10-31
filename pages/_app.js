import localFont from "next/font/local";

import "../styles/blog.css";

// Latin-subset woff2 files from Google Fonts (all SIL Open Font License), kept in the repo so the
// build never fetches from Google: next/font/google crashes when Google returns extensionless URLs.
// Variable fonts: the wght axis gives the in-between weights (e.g. 650 on headings).
const display = localFont({
  src: "../styles/fonts/bricolage-grotesque.woff2", // wght 200-800 and opsz 12-96
  weight: "200 800",
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: false,
});
const body = localFont({
  src: [
    { path: "../styles/fonts/figtree.woff2", weight: "300 900", style: "normal" },
    { path: "../styles/fonts/figtree-italic.woff2", weight: "300 900", style: "italic" },
  ],
});
const mono = localFont({ src: "../styles/fonts/jetbrains-mono.woff2", weight: "100 800" });

export default function App({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`
        :root {
          --nf-display: ${display.style.fontFamily};
          --nf-body: ${body.style.fontFamily};
          --nf-mono: ${mono.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}

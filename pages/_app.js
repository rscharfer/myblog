import { Bricolage_Grotesque, Figtree, JetBrains_Mono } from "next/font/google";

import "../styles/blog.css";

// Variable fonts: the wght axis gives the in-between weights (e.g. 650 on headings).
const display = Bricolage_Grotesque({ subsets: ["latin"], axes: ["opsz"], fallback: ["system-ui", "sans-serif"], adjustFontFallback: false });
const body = Figtree({ subsets: ["latin"], style: ["normal", "italic"] });
const mono = JetBrains_Mono({ weight: ["400", "600"], subsets: ["latin"] });

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

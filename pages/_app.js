import { Newsreader, Inter, JetBrains_Mono } from "next/font/google";

import "../styles/blog.css";

const newsreader = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"], fallback: ["Charter", "Georgia", "serif"], adjustFontFallback: false });
const inter = Inter({ weight: ["400", "500", "600"], subsets: ["latin"] });
const mono = JetBrains_Mono({ weight: ["400", "600"], subsets: ["latin"] });

export default function App({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`
        :root {
          --nf-serif: ${newsreader.style.fontFamily};
          --nf-sans: ${inter.style.fontFamily};
          --nf-mono: ${mono.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}

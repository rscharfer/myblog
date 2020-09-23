import Head from "next/head";
import Header from "./Header";

import { DARK_GRAY } from "../color";
import { GOLDEN_RATIO } from "../constants";

export default function Layout({ children, pageTitle, ...props }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{pageTitle}</title>
      </Head>
      <section className="layout">
        <style jsx global>{`
          html {
            font-size: 18px;
            line-height: ${GOLDEN_RATIO};
            color: ${DARK_GRAY};
          }
          body {
            padding: 2rem;
            max-width: 80%;
            margin: 0 auto;
          }
          h1 {
            font-size: ${GOLDEN_RATIO * 2}rem;
            line-height: 1.2;
          }
          h2 {
            font-size: ${GOLDEN_RATIO}rem;
            line-height: 1.2;
          }
          .content {
            padding: 1rem 0 0;
          }
        `}</style>
        <Header />
        <div className="content">{children}</div>
      </section>
    </>
  );
}

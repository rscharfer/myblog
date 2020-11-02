import Head from "next/head";
import Header from "./Header";

import { DARK_GRAY } from "../color";
import { GOLDEN_RATIO } from "../constants";
export default function Layout({ children, docTitle, ...props }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{docTitle}</title>
      </Head>
      <section className="layout">
        <style jsx global>{`
          * {
            box-sizing: border-box;
          }
          html {
            font-size: 18px;
            line-height: ${GOLDEN_RATIO};
            color: ${DARK_GRAY};
          }
          body {
            padding: 2rem;
            max-width: 1000px;
            width: 100%;
            margin: 0 auto;
          }
          h1 {
            font-size: 2rem;
            font-weight: 700;
            line-height: 1.2;
          }
          h2 {
            font-size: 1.25rem;
            line-height: 1.2;
          }
          .content {
            margin: 0 auto;
            padding: 1rem 0 0;
          }

          .utterances {
            max-width: 1100px;
          }

          @media screen and (min-width: 800px) {
            h1 {
              font-size: 2.5rem;
            }
            h2 {
              font-size: 1.5rem;
            }
          }
        `}</style>
        <Header />
        <div className="content">{children}</div>
      </section>
    </>
  );
}

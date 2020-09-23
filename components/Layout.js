import Head from "next/head";
import Header from "./Header";

import { DARK_GRAY } from "../color";

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
            color: ${DARK_GRAY};
          }
          body {
            padding: 2rem;
            max-width: 80%;
            margin: 0 auto;
          }
          h1 {
            font-size: 2rem;
          }
          h2 {
            font-size: 1.5rem;
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

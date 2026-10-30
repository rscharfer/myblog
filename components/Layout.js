import Head from "next/head";
import Header from "./Header";

export default function Layout({ children, docTitle, ...props }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{docTitle}</title>
      </Head>
      <Header />
      <div className="layout">{children}</div>
    </>
  );
}

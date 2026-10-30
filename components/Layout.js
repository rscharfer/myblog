import Head from "next/head";

import Header from "./Header";
import SiteFooter from "./SiteFooter";

export default function Layout({ children, docTitle, description }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{docTitle}</title>
        {description && <meta name="description" content={description} />}
      </Head>
      <Header />
      <div className="layout">
        {children}
        <SiteFooter />
      </div>
    </>
  );
}

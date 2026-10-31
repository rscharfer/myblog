import Head from "next/head";

import Header from "./Header";
import SiteFooter from "./SiteFooter";
import { site } from "../lib/site";

// `path` is the page's URL path ("/", "/about", "/post/react19/hooks"), used for the
// canonical and og:url. Pass `article` ({ title, description, date }) on post pages.
export default function Layout({ children, docTitle, description, path, article }) {
  const url = path && site.url + path;
  const image = site.url + site.avatar;
  const jsonLd = article && {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    url,
    mainEntityOfPage: url,
    image,
    // Front matter only has `published`, which is the last-updated date.
    datePublished: article.date,
    dateModified: article.date,
    author: { "@type": "Person", name: site.author, url: `${site.url}/about` },
    publisher: { "@type": "Person", name: site.author },
  };

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{docTitle}</title>
        {description && <meta name="description" content={description} />}
        {url && <link rel="canonical" href={url} />}
        <meta property="og:site_name" content={site.name} />
        <meta property="og:title" content={article ? article.title : docTitle} />
        {description && <meta property="og:description" content={description} />}
        {url && <meta property="og:url" content={url} />}
        <meta property="og:type" content={article ? "article" : "website"} />
        <meta property="og:image" content={image} />
        {article && <meta property="article:modified_time" content={article.date} />}
        <meta name="twitter:card" content="summary" />
        {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      </Head>
      <Header />
      <div className="layout">
        {children}
        <SiteFooter />
      </div>
    </>
  );
}

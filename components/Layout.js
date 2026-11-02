import Head from "next/head";

import Header from "./Header";
import SiteFooter from "./SiteFooter";
import { site } from "../lib/site";

// `path` is the page's URL path ("/", "/about", "/post/react19/hooks"), used for the
// canonical and og:url. Pass `article` ({ title, description, published, modified }) on post pages,
// and `image` (a path under public/, 1200x630) for a large share card instead of the avatar.
export default function Layout({ children, docTitle, description, path, article, image: cardImage }) {
  const url = path && site.url + path;
  const image = site.url + (cardImage || site.avatar);
  const jsonLd = article && {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    url,
    mainEntityOfPage: url,
    image,
    datePublished: article.published,
    dateModified: article.modified,
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
        {article && <meta property="article:published_time" content={article.published} />}
        {article && <meta property="article:modified_time" content={article.modified} />}
        <meta name="twitter:card" content={cardImage ? "summary_large_image" : "summary"} />
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

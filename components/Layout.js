import Head from "next/head";

import Header from "./Header";
import SiteFooter from "./SiteFooter";
import { site } from "../lib/site";

// `path` is the page's URL path ("/", "/about", "/post/react19/hooks"), used for the
// canonical and og:url. Pass `article` ({ title, description, published, modified }) on post pages,
// and `image` (a path under public/, 1200x630) for a large share card instead of the avatar.
// Front matter dates are calendar days with no time. Google recommends a timezone on schema.org dates,
// so pin them to midnight UTC.
const asUtc = (day) => day && `${day}T00:00:00Z`;
const sameAs = [site.github, site.linkedin].filter(Boolean);

export default function Layout({ children, docTitle, description, path, article, image: cardImage }) {
  const url = path && site.url + path;
  const image = site.url + (cardImage || site.avatar);
  const jsonLd = article ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    url,
    mainEntityOfPage: url,
    image,
    datePublished: asUtc(article.published),
    dateModified: asUtc(article.modified),
    author: { "@type": "Person", name: site.author, url: `${site.url}/about`, sameAs },
    publisher: { "@type": "Person", name: site.author, url: `${site.url}/about` },
  } : path === "/" ? {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: "en",
    author: { "@type": "Person", name: site.author, url: `${site.url}/about`, sameAs },
  } : null;

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
        {cardImage && <meta property="og:image:width" content="1200" />}
        {cardImage && <meta property="og:image:height" content="630" />}
        {cardImage && <meta property="og:image:alt" content={article ? article.title : docTitle} />}
        <link rel="alternate" type="application/rss+xml" title={site.name} href={`${site.url}/feed.xml`} />
        {article && <meta property="article:published_time" content={asUtc(article.published)} />}
        {article && <meta property="article:modified_time" content={asUtc(article.modified)} />}
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

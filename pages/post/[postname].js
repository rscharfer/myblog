import Link from "next/link";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";

import Layout from "../../components/Layout";
import CodeBlockRenderer from "../../components/CustomRenderers/CodeBlockRenderer";
import LinkRenderer from "../../components/CustomRenderers/LinkRenderer";
import LinkReference from "../../components/CustomRenderers/LinkReference";
import { DARK_BLUE_TOMATO } from "../../color";

export default function BlogPost({ siteTitle, frontmatter, markdownBody }) {
  if (!frontmatter) return <></>;

  return (
    <Layout pageTitle={`${siteTitle} | ${frontmatter.title}`}>
      <style jsx>
        {`
          a {
            text-decoration: none;
            color: ${DARK_BLUE_TOMATO};
          }
        `}
      </style>
      <Link href="/">
        <a> &#8592; Back to post list</a>
      </Link>
      <article>
        <h1>{frontmatter.title}</h1>
        <div>
          <ReactMarkdown
            renderers={{
              code: CodeBlockRenderer,
              link: LinkRenderer,
            }}
            source={markdownBody}
          />
        </div>
      </article>
    </Layout>
  );
}

export async function getStaticProps({ ...ctx }) {
  const { postname } = ctx.params;

  const content = await import(`../../posts/${postname}.md`);
  const config = await import(`../../siteconfig.json`);
  const data = matter(content.default);

  return {
    props: {
      siteTitle: config.title,
      frontmatter: data.data,
      markdownBody: data.content,
    },
  };
}

export async function getStaticPaths() {
  const blogSlugs = ((context) => {
    const keys = context.keys();
    const data = keys.map((key, index) => {
      let slug = key.replace(/^.*[\\\/]/, "").slice(0, -3);

      return slug;
    });
    return data;
  })(require.context("../../posts", true, /\.md$/));

  const paths = blogSlugs.map((slug) => `/post/${slug}`);

  return {
    paths,
    fallback: false,
  };
}

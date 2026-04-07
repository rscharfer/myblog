import { useRef, useEffect } from "react";
import Link from "next/link";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";

import Layout from "../../components/Layout";
import CodeBlockRenderer from "../../components/CustomRenderers/CodeBlockRenderer";
import LinkRenderer from "../../components/CustomRenderers/LinkRenderer";
import HeadingRenderer from "../../components/CustomRenderers/HeadingRenderer";
import { DARK_BLUE_TOMATO } from "../../color";

export default function BlogPost({ siteTitle, frontmatter, markdownBody }) {
  if (!frontmatter) return <></>;
  const commentContainer = useRef(null);

  useEffect(() => {
    let script = document.createElement("script");
    script.setAttribute("src", "https://utteranc.es/client.js");
    script.setAttribute("crossorigin", "anonymous");
    script.setAttribute("async", true);
    script.setAttribute("repo", "rscharfer/myblog");
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("theme", "github-light");
    commentContainer.current.append(script);
    return () => script.remove();
  }, []);

  return (
    <Layout docTitle={`${siteTitle} | ${frontmatter.title}`}>
      <style jsx>
        {`
          a {
            text-decoration: none;
            color: ${DARK_BLUE_TOMATO};
          }
        `}
      </style>
      <Link legacyBehavior href="/">
        <a> &#8592; Back to post list</a>
      </Link>
      <article>
        <h1>{frontmatter.title}</h1>
        <ReactMarkdown
          components={{
            code: CodeBlockRenderer,
            a: LinkRenderer,
            h1: HeadingRenderer,
            h2: HeadingRenderer,
            h3: HeadingRenderer,
            h4: HeadingRenderer,
            h5: HeadingRenderer,
            h6: HeadingRenderer,
          }}
        >
          {markdownBody}
        </ReactMarkdown>
      </article>
      <div ref={commentContainer}></div>
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
      siteTitle: config.docTitle,
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

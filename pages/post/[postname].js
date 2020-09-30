import Link from "next/link";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";

import Layout from "../../components/Layout";
import CodeBlockRenderer from "../../components/CustomRenderers/CodeBlockRenderer";
import LinkRenderer from "../../components/CustomRenderers/LinkRenderer";
import InlineCodeRenderer from "../../components/CustomRenderers/InlineCodeRenderer";
import HeadingRenderer from "../../components/CustomRenderers/HeadingRenderer";
import { DARK_BLUE_TOMATO } from "../../color";

export default function BlogPost({ siteTitle, frontmatter, markdownBody }) {
  if (!frontmatter) return <></>;
  const commentContainer = React.useRef(null);

  React.useEffect(() => {
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
        <ReactMarkdown
          renderers={{
            code: CodeBlockRenderer,
            link: LinkRenderer,
            inlineCode: InlineCodeRenderer,
            heading: HeadingRenderer,
          }}
          source={markdownBody}
        />
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

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
    script.id = 'utterance-script' //  giving an id so I can track it in DOM to see how the script deletes itself after executing
    script.setAttribute("src", "https://utteranc.es/client.js");
    script.setAttribute("crossorigin", "anonymouse"); 
    // ^^ because the response from the server allows all cross origin 
    // requests i.e. access-control-allow-origin is "*"
    // this HAS to be "anonymous" which sets the credentials flag to false
    // if we set value to "use-credentials" , then the credentials flag is set to true
    // note: the credentials flag is hard to see on the request, hut if the credentials flag is set to true, there will be associated headers in the request
    // which correspond to credentials=true request such as the security header: Sec-Fetch-Storage-Access


    script.setAttribute("defer", true);
    // wait for DOM to be in tact because it needs to replace a particular element.. async does not wait for the DOM
    // to be in tact.. it just starts executing once it has downloaded (async)
    script.setAttribute("repo", "rscharfer/myblog");
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("theme", "github-light");
    commentContainer.current.append(script);
    return () => {
    //  script.remove(); // actually unnecessary because the script deletes itself after its down executing
    };
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
      <div id="comment-container" ref={commentContainer}></div>
    </Layout>
  );
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  const filePath = slug.join("/");
  const content = await import(`../../posts/${filePath}.md`);
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
  const paths = ((context) => {
    return context.keys().map((key) => {
      // key is like './react19/latest_ref_pattern.md'
      const slug = key.replace(/^\.\//, "").replace(/\.md$/, "").split("/");
      return { params: { slug } };
    });
  })(require.context("../../posts", true, /\.md$/));

  return {
    paths,
    fallback: false,
  };
}

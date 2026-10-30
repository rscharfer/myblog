import ReactMarkdown from "react-markdown";

import Layout from "../../components/Layout";
import PostHeader from "../../components/post/PostHeader";
import { TocSide } from "../../components/post/Toc";
import Comments from "../../components/post/Comments";
import usePostBehaviour from "../../components/post/usePostBehaviour";
import { markdownComponents } from "../../components/post/markdownComponents";
import { remarkPlugins } from "../../lib/markdown";
import { site } from "../../lib/site";
import { loadPost, postSlugs } from "../../lib/posts";

export default function BlogPost({ post }) {
  usePostBehaviour();

  return (
    <Layout docTitle={`${post.title} — ${site.name}`} description={post.subtitle}>
      <PostHeader post={post} />
      {post.toc.length > 0 && <TocSide toc={post.toc} />}
      <article>
        <ReactMarkdown
          remarkPlugins={remarkPlugins({ icons: post.icons })}
          components={markdownComponents({ figures: post.figures })}
        >
          {post.markdown}
        </ReactMarkdown>
      </article>
      <hr className="end" />
      {post.related.length > 0 && (
        <section className="related" aria-labelledby="rel">
          <div className="kicker" id="rel">
            Related reading
          </div>
          {post.related.map((r) => (
            <a key={r.href} href={r.href} {...(/^https?:/.test(r.href) ? { target: "_blank", rel: "noopener" } : {})}>
              <span className="k">{r.label}</span>
              <strong>{r.title}</strong>
              {r.description && <span className="d">{r.description}</span>}
            </a>
          ))}
        </section>
      )}
      {/* keyed so client-side navigation between posts loads that post's thread */}
      <Comments key={post.slug} />
    </Layout>
  );
}

export async function getStaticProps({ params }) {
  return { props: { post: loadPost(params.slug.join("/")) } };
}

export async function getStaticPaths() {
  return {
    paths: postSlugs().map((slug) => ({ params: { slug: slug.split("/") } })),
    fallback: false,
  };
}

import Link from "next/link";

import { TOMATO, DARK_GRAY } from "../color";

export default function PostList({ posts }) {
  if (posts === "undefined") return null;

  return (
    <div>
      <style jsx>
        {`
          .entry {
            margin-bottom: 2.5rem;
          }
          .title {
            font-family: var(--font-montserrat);
            font-size: 2rem;
            font-weight: 700;
            line-height: 1.2;
            color: ${TOMATO};
           
          }
          .date {
            font-family: var(--font-lato);
            font-size: 0.875rem;
            color: ${DARK_GRAY};
          }
          .subtitle {
            font-family: var(--font-lato);
            font-size: 1.125rem;
            color: ${DARK_GRAY};
          }
        `}
      </style>
      {posts &&
        posts.map((post) => (
          <div key={post.slug} className="entry">
            <Link style={{
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
           
            }}href={`/post/${post.slug}`}>
              <div className="title">{post.frontmatter.title}</div>
              <div className="date">{post.frontmatter.published}</div>
              <div className="subtitle">{post.frontmatter.subtitle}</div>
            </Link>
          </div>
        ))}
    </div>
  );
}

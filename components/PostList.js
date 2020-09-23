import Link from "next/link";

import { TOMATO, DARK_BLUE_TOMATO } from '../color'

export default function PostList({ posts }) {
  if (posts === "undefined") return null;

  return (
    <div>
      <style jsx>
        {`
          a {
            text-decoration: none;
            color: ${TOMATO}
          }
        `}
      </style>
      {!posts && <div>No posts!! </div>}
      <ul>
        {posts &&
          posts.map((post) => (
            <li key={post.slug}>
              <Link href={{ pathname: `/post/${post.slug}` }}>
                <a>{post.frontmatter.title}</a>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}

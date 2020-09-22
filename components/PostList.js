import Link from "next/link";

export default function PostList({ posts }) {
  if (posts === "undefined") return null;

  return (
    <div>
      {!posts && <div>No posts!! </div>}
      <ul>
        {posts &&
          posts.map((post) => (
            <li key={post.slug}>
              <Link href={{ pathname: `/post/${post.slug}` }}>
                {post.frontmatter.title}
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}

/*
  <Link href="./about">
    Go back to about
  </Link>

*/

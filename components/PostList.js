import Link from "next/link";

// One year's posts: a year kicker over an ink rule, then one link per post.
// The year is the created year, so an update in a later year names its own year.
export default function PostList({ year, posts }) {
  return (
    <section aria-labelledby={`y${year}`}>
      <h2 className="year kicker" id={`y${year}`}>
        {year}
      </h2>
      <ol>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link className="pitem" href={`/post/${post.slug}`}>
              <span className="pmeta">
                <span className="topic">{post.topic}</span>
                <time dateTime={post.created.iso}>{post.created.short}</time>
                {post.updated && (
                  <time className="updated" dateTime={post.updated.iso}>
                    Updated {post.updated.short}
                    {post.updated.year !== post.created.year && `, ${post.updated.year}`}
                  </time>
                )}
              </span>
              <span className="ptitle">{post.title}</span>
              {post.subtitle && <span className="psub">{post.subtitle}</span>}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

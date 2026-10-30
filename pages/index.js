import Layout from "../components/Layout";
import PostList from "../components/PostList";
import { allPosts } from "../lib/posts";
import { site } from "../lib/site";

const Index = ({ posts }) => {
  // Posts arrive newest first, so years come out in descending order too.
  const postsByYear = new Map();
  for (const post of posts) {
    postsByYear.set(post.date.year, [...(postsByYear.get(post.date.year) || []), post]);
  }

  return (
    <Layout docTitle={`Posts — ${site.author}`} description={site.description}>
      <header className="post index-head">
        <h1>Posts</h1>
        <p className="subtitle">{site.description}</p>
        <p className="datenote">{posts.length} posts · dates show when a post was last updated</p>
      </header>
      <main className="plist">
        {Array.from(postsByYear).map(([year, yearsPosts]) => (
          <PostList key={year} year={year} posts={yearsPosts} />
        ))}
      </main>
    </Layout>
  );
};

export async function getStaticProps() {
  return { props: { posts: allPosts() } };
}

export default Index;

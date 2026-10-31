import Layout from "../components/Layout";
import PostList from "../components/PostList";
import { allPosts } from "../lib/posts";
import { writeSitemap } from "../lib/sitemap";
import { site } from "../lib/site";

const Index = ({ posts }) => {
  // Posts arrive newest first, so years come out in descending order too.
  const postsByYear = new Map();
  for (const post of posts) {
    postsByYear.set(post.created.year, [...(postsByYear.get(post.created.year) || []), post]);
  }

  return (
    <Layout docTitle={site.name} description={site.description} path="/">
      <header className="post index-head">
        <h1>Posts</h1>
        <p className="subtitle">{site.description}</p>
        <p className="datenote">{posts.length} posts, newest first by the date each was published</p>
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
  const posts = allPosts();
  writeSitemap(posts);
  return { props: { posts } };
}

export default Index;

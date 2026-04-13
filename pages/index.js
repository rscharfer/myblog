import matter from "gray-matter";
// get matter from gray-matter

import Layout from "../components/Layout";
// get the layout component which seems to accept any amount of children 
import PostList from "../components/PostList";

import { validateDate, latestFirst } from "../utils/publishDate.tsx";

const Index = ({ docTitle, posts }) => {
  const postsByYear = new Map();
  for (let post of posts) {
    const postYear = post.frontmatter.published.match(/\d{4}$/)[0];
    const yearsPosts = postsByYear.get(postYear);
    postsByYear.set(postYear, yearsPosts? [...yearsPosts, post]: [post])
  }



  return (
    <Layout docTitle={docTitle}>
      <main>
        {Array.from(postsByYear).map(([year, posts]) => {

        return <PostList key={year} year={year} posts={posts} />
        })}
      </main>
    </Layout>
  );
};

export async function getStaticProps() {
  const {
    default: { docTitle, description },
  } = await import(`../siteconfig.json`);

  const getParsedPosts = (context) => {
    const keys = context.keys();
    const values = keys.map(context);

    const parsedPosts = keys.map((key, index) => {
      let slug = key.replace(/^\.\//, "").replace(/\.md$/, "");
      const value = values[index];
      const document = matter(value.default);
      return {
        frontmatter: document.data,
        markdownBody: document.content,
        slug,
      };
    });
    return parsedPosts
      .filter((post) => Boolean(post.frontmatter.published))
      .sort(function (post1, post2) {
        return latestFirst(
          validateDate(post1.frontmatter.published),
          validateDate(post2.frontmatter.published)
        );
      });
  };

  const posts = getParsedPosts(require.context("../posts", true, /\.md$/));

  return {
    props: {
      posts,
      docTitle,
      description,
    },
  };
}

export default Index;

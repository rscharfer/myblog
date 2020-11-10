import matter from "gray-matter";

import Layout from "../components/Layout";
import PostList from "../components/PostList";

import { validateDate, latestFirst } from "../utils/publishDate.tsx";

const Index = ({ docTitle, description, posts, ...props }) => {
  return (
    <Layout docTitle={docTitle}>
      <h1 className="title">Welcome to my blog!</h1>
      <p className="description">{description}</p>
      <main>
        <PostList posts={posts} />
      </main>
    </Layout>
  );
};

export async function getStaticProps() {
  // asynchronously load title and description of the blog
  const {
    default: { docTitle, description },
  } = await import(`../siteconfig.json`);

  const getParsedPosts = (context) => {
    // context.keys() returns an array of paths to the files in given directory with given directory as current directory
    // e.g. ['./thirdPartyScripts.md','./threePatterns.md']
    const keys = context.keys();
    // use the context function to map the file paths to their contents
    const values = keys.map(context);

    // use another function to map each of the paths to
    // an object containing the "slug" of the path as well its contents frontmatter and body
    const parsedPosts = keys.map((key, index) => {
      let slug = key.replace(/^.*[\\\/]/, "").slice(0, -3);
      const value = values[index];
      const document = matter(value.default);
      return {
        frontmatter: document.data,
        markdownBody: document.content,
        slug,
      };
    });
    // only return the posts which are "ready"
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

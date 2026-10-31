import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";

import Avatar from "../components/Avatar";
import Layout from "../components/Layout";
import { site } from "../lib/site";

const About = ({ markdown }) => (
  <Layout docTitle={`About — ${site.name}`} description={`About ${site.author}, full-stack engineer in ${site.location}.`} path="/about">
    <header className="post">
      <h1>About</h1>
    </header>
    <main className="about-body">
      <div className="about-me">
        <Avatar />
        <div>
          <b>{site.author}</b>
          <span>{site.location}</span>
        </div>
      </div>
      {/* The text lives in content/about.md */}
      <ReactMarkdown skipHtml>{markdown}</ReactMarkdown>
      <section className="elsewhere" aria-labelledby="else">
        <div className="kicker" id="else">
          Elsewhere
        </div>
        <ul>
          <li>
            <a href={site.github} target="_blank" rel="noopener">
              GitHub<span>Code and side projects</span>
            </a>
          </li>
          <li>
            <a href={site.linkedin} target="_blank" rel="noopener">
              LinkedIn<span>Work history</span>
            </a>
          </li>
        </ul>
      </section>
    </main>
  </Layout>
);

export async function getStaticProps() {
  const markdown = fs.readFileSync(path.join(process.cwd(), "content", "about.md"), "utf8");
  return { props: { markdown } };
}

export default About;

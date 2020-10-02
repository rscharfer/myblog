import Layout from "../components/Layout";

const About = ({ docTitle, description }) => (
  <Layout docTitle={`${docTitle} | About`}>
    <p className="description">{description} </p>
    <p>I live with my wife and two kids in Hamburg. 👨‍👨‍👧‍👦 </p>
  </Layout>
);

export async function getStaticProps() {
  const configData = await import("../siteconfig.json");
  return {
    props: {
      docTitle: configData.default.docTitle,
      description: configData.default.description,
    },
  };
}

export default About;

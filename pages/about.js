import Layout from "../components/Layout";

const About = ({ title, description }) => (
  <Layout docTitle={`${title} | About`}>
    <p className="description">{description} </p>
    <p>I live with my wife and two kids in Hamburg. 👨‍👨‍👧‍👦 </p>
  </Layout>
);

export async function getStaticProps() {
  const configData = await import("../siteconfig.json");
  return {
    props: {
      title: configData.default.title,
      description: configData.default.description,
    },
  };
}

export default About;

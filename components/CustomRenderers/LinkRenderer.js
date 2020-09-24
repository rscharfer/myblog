import { DARK_BLUE_TOMATO } from "../../color";

export default (props) => {
  const linkText = props.children[0].props.value;
  return (
    <>
      <style jsx>{`
        a {
          text-decoration: none;
          color: ${DARK_BLUE_TOMATO};
        }
      `}</style>
      <a href={props.href}>{linkText}</a>
    </>
  );
};

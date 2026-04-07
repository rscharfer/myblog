import { DARK_BLUE_TOMATO } from "../../color";

const LinkRenderer = ({ href, children }) => (
  <a href={href} style={{ textDecoration: "none", color: DARK_BLUE_TOMATO }}>
    {children}
  </a>
);

export default LinkRenderer;

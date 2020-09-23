import { DARK_BLUE_TOMATO } from "../color";

export default ({ value }) => (
  <pre
    style={{
      color: DARK_BLUE_TOMATO,
      overflow: "scroll",
    }}
  >
    <code>{value}</code>
  </pre>
);

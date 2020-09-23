import Highlight, { defaultProps } from "prism-react-renderer";
// import { DARK_BLUE_TOMATO } from "../color";

// export default ({ value }) => (
//   <pre
//     style={{
//       color: DARK_BLUE_TOMATO,
//       overflow: "scroll",
//     }}
//   >
//     <code>{value}</code>
//   </pre>
// );

export default ({ value }) => (
  <Highlight {...defaultProps} code={value} language="jsx">
    {({ className, style, tokens, getLineProps, getTokenProps }) => (
      <pre className={className} style={style}>
        {tokens.map((line, i) => (
          <div {...getLineProps({ line, key: i })}>
            {line.map((token, key) => (
              <span {...getTokenProps({ token, key })} />
            ))}
          </div>
        ))}
      </pre>
    )}
  </Highlight>
);

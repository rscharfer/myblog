import Highlight, { defaultProps } from "prism-react-renderer";
// import theme from 'prism-react-renderer/themes/shadesOfPurple'
import theme from '../../customPrismTheme';
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
  <Highlight {...defaultProps} theme={theme} code={value} language="jsx">
    {({ className, style, tokens, getLineProps, getTokenProps }) => (
      <pre className={className} style={style}>
        <style jsx>{`
          pre {
            padding: 0.5rem 1rem;
            overflow: scroll;
            border-radius: 5px;
          }
          div {
            display: table-row;
          }
          .lineNumber {
            display: table-cell;
            text-align: right;
            padding-right: 1rem;
            user-select: none;
            opacity: 0.5;
          }
          .lineContent {
            display: table-cell;
          }
        `}</style>
        {tokens.map((line, i) => (
          <div {...getLineProps({ line, key: i })}>
            <span className="lineNumber">{i + 1}</span>
            <span className="lineContent">
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
              ))}
            </span>
          </div>
        ))}
      </pre>
    )}
  </Highlight>
);

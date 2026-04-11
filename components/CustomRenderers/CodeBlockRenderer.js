import Highlight, { defaultProps } from "prism-react-renderer";
import theme from '../../customPrismTheme';

export default ({ inline, children }) => {
  if (inline) {
    return <code style={{ overflowWrap: "break-word" }}>{children}</code>;
  }

  const value = String(children).replace(/\n$/, "");
  debugger

  return (
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
          {tokens.map((line, i) => {
            const { key: lineKey, ...lineProps } = getLineProps({ line, key: i });
            return (
              <div key={lineKey} {...lineProps}>
                <span className="lineNumber">{i + 1}</span>
                <span className="lineContent">
                  {line.map((token, key) => {
                    const { key: tokenKey, ...tokenProps } = getTokenProps({ token, key });
                    return <span key={tokenKey} {...tokenProps} />;
                  })}
                </span>
              </div>
            );
          })}
        </pre>
      )}
    </Highlight>
  );
};

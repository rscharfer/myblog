import React from "react";

import CodeBlock from "./CodeBlock";
import Icon from "../icons";

function Heading({ level, id, children }) {
  return React.createElement(
    `h${level}`,
    { id },
    children,
    <a className="anchor" href={`#${id}`} aria-label="Link to this section">
      #
    </a>
  );
}

// react-markdown component overrides for the post body. `figures` maps an SVG
// file name to its source, loaded at build time by lib/posts.js.
export function markdownComponents({ figures = {} } = {}) {
  return {
    h2: Heading,
    h3: Heading,
    pre: ({ children }) => <>{children}</>,
    code({ inline, className, children, node }) {
      if (inline) return <code>{children}</code>;
      const lang = (className || "").replace(/^language-/, "") || undefined;
      return <CodeBlock code={String(children).replace(/\n$/, "")} lang={lang} meta={node.data?.meta} />;
    },
    span({ node, className, children, ...props }) {
      if (className === "ic") {
        const name = props["data-icon"];
        return <span className="ic">{name && <Icon name={name} />}</span>;
      }
      return (
        <span className={className} {...props}>
          {children}
        </span>
      );
    },
    figure({ node, className, children, ...props }) {
      if (className !== "diagram") return <figure className={className}>{children}</figure>;
      const wide = figures[props["data-wide"]];
      const narrow = figures[props["data-narrow"]];
      return (
        <figure className="diagram">
          <div className="figscroll fig-wide" dangerouslySetInnerHTML={{ __html: wide }} />
          <div className="fig-narrow" dangerouslySetInnerHTML={{ __html: narrow }} />
          <figcaption>
            <span className="kicker">{props["data-label"]}</span> {props["data-caption"]}
          </figcaption>
        </figure>
      );
    },
  };
}

import React from "react";

const HeadingRenderer = ({ node, children }) => {
  const hTag = node.tagName; // 'h1', 'h2', etc.
  const headingText = Array.isArray(children)
    ? children.map((child) => (typeof child === "string" ? child : "")).join("")
    : String(children);

  const idRegEx = /^id=(.+?)\s/;
  const id = headingText.match(idRegEx)?.[1];
  const cleanedText = headingText.replace(idRegEx, "");

  return React.createElement(hTag, { id }, cleanedText);
};

export default HeadingRenderer;

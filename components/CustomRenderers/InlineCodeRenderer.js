import React from "react";

const InlineCodeRenderer = ({ children, inline, value }) => {
  return React.createElement("code", {
    style: { overflowWrap: "break-word" },
    children,
  });
};

export default InlineCodeRenderer;


/**
 * This is how it is used somewhere
 * 
 * <InlineCode inline={true} value={'<head/>'}><head/></InlineCode>
 * 
 * 
 */

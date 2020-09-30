import React from 'react';
import { DARK_BLUE_TOMATO } from "../../color";

const LinkRenderer = ({ href, children }) => {
  const textElement = children[0];
  return React.createElement(
    "a",
    {
      href,
      style: { textDecoration: 'none', color: DARK_BLUE_TOMATO },
    },
    textElement
  );
};

export default LinkRenderer;

/**
 *
 *
 * Example Useage
 *
 * <LinkRenderer href="https://codesandbox.io/s/third-party-script-c4ki9">
 *  <TextRenderer nodeKey:{'text-58-440-0'} value={Here is the code in Code Sandbox.'}/>
 *    Here is the code in Code Sandbox.
 *  <TextRenderer>
 * </LinkRenderer>
 */

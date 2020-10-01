import React from "react";

const HeadingRenderer = ({ level, children: [TextRenderer] }) => {
  // a TextRenderer React element is the only child 
  const headingText = TextRenderer.props.value;

  // this markdown...
  // ## id=what_keeps_browsers What keeps browsers from executing a script in a script tag
  // will be rendered to ...
  // <h2 id="what_keeps_browsers">What keeps browsers from executing a script in a script tag</h2>
  

  // get the id "tag" if there is one
  const idRegEx = /^id=(.+?)\s/;
  // if there is a match, grab the first group, otherwise leave undefined
  const id = headingText.match(idRegEx)?.[1]

  // remove the id tag from the text
  const cleanedText = headingText.replace(idRegEx, "");
  const hTag = `h${level}`;

  return React.createElement(hTag, { id }, cleanedText);
};

export default HeadingRenderer;

/**
 * Example Usage
 *
 * <HeadingRenderer level={2}>
 *  <TextRenderer nodeKey:{'text-60-4-0'} key={'text-60-4-0'} value="id=what_keeps_browsers Why isn't the script tag removed from React on subsequent renders"/>
 *    id=what_keeps_browsers Why isn't the script tag removed from React on subsequent renders
 * </TextRenderer>
 * </HeadingRender/>
 *
 *
 */

import React from 'react';

export default (props) => {

  console.log('here are the props', props);

  const openTag = `h${props.level}`

  return React.createElement(openTag, null, 'heading');
};
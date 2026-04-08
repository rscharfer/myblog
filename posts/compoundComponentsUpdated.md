---
title: (React 19): Compound Comoponents Pattern
# keywords:
#   - React
#   - Kent C. Dodds
#   - advanced React patterns
published: 2026.04.07
---


## What is a compound component?

You can think of compound components as groups of components which cannot live without each other, such as the  `select` and `option` elements in HTML. They will always consist of:

- a parent component with nested child components

- the parent component shares state _implicitly_ with its children components

## How do you implement a compount component?

You first create a root component which wraps its children in a context provider.  Via the value prop, the root component can share state and ways to manipuate that state with its children.  Via `use` the children component can consume the state and ways to manipulate that state provided by the parent and act accordingly.

[Here is an example of the new approach on Code Sandbox. ] (<https://codesandbox.io/p/sandbox/blog-compound-components-react-19-ynjyln>)


## React 16 (class component) approach vs React 19 (functional component) approach

[A previous blog post of mine] (<https://ryansblog.netlify.app/post/compoundComponents>) showed a way the compound component pattern was implemented in the days of React 16. At that time, class components were in full swing. 

The way for a root component to implicitly share state and functionality with its children was for the root component to map its children to clones of themselves. The clones would receive the parent's state and functionality via their props. 

[Here is an example of the old approach on Code Sandbox. ] (<https://codesandbox.io/s/blog-compound-components-09bdz>)


## What is no longer being used in the modern version?

- `React.cloneElement` - We do not need to clone the children to make sure they have access to the parent's state. Instead the children will grab the state from the parent directly with the `use` API. 

- `React.Children.map` - As mentioned above, we do not need to map through the children to make clones which receive parent state and functionality.  Instead the children will grab global state directly from the parent via the `use` API.

## A note on adding child components to the root component via static properties

Sometimes the child components are pinned directly to the parent component via static props.
```js
Toggle.On = ({ on, children }) => on && children;
Toggle.Off = ({ on, children }) => !on && children;
Toggle.Button = ({ on, toggle }) => <button onClick={toggle}> Toggle </button>;
```
An advantage of doing this means you only have to worry about importing Toggle i.e. the root component into your App, and the children components come along for the ride.  You can do this, but note that using the modern approach described here, you can render _any_ components inside the root component, not just the set of components which can read the state from the parent. And if you try to render a component which does read state from the root, an error will be thrown via the custom hook to let you know that you are not allowed to do that.


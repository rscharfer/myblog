---
title: Epic React Pattern 2 - Compound Components
keywords:
  - React
  - Kent Dodds
  - advance React patterns
published: 11.06.2020
status: ready
---


## What does Kent mean that a `select` element has state

That state that Kent is referring to is the `value` property on the `select` element, which is always set to the `value` attribute of the current selected `option`.

## What are some other things that are helpful to know

- `React.cloneElement` - Because React elements are immutable, the only way you can add a prop to it is to clone it first and add a prop to the clone. You will see why we want to do that below.

- `React.Children.map`- We will want to loop through the children of a prop, but if we tried looping over `this.props.children` doing something like `this.props.children.map(child => React.cloneElement(child, {newProp: 'new prop!'}))`, we would run into problems if `this.props` is not an array. When there is only one child or if there are no children, we actually have that case. `React.Children` contains a set of utilities such as `React.Children.map` that allows us 'fail gracefully' if the children is not an array like we might expect it to be.

## What are compound components

You will get a feel for what compound components are as you use them, but you can think of compound components as components who cannot live without each other, such as `select` and `option`. It will always consist of:

- components nested inside a parent component

- the parent component shares state _implicitly_ or _covertly_ with its children components

- just like you can only use `option` elements inside of a `select` element, you can only use specific components inside the parent component. Components not built to be nested inside of a parent compound component will not implicitly receive its state.

- In order to make the tight relationship between the parent and possible children of compound components, the possible children components are often added as static properties of the parent coponent.

## Ok. Let's see an example

[Here is an example on Code Pen. Make sure to read the comments!] (<https://codesandbox.io/s/blog-compound-components-09bdz>)

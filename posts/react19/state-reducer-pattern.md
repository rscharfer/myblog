---
title: The state reducer pattern in React 19, with TypeScript
created: April 8, 2026
updated: November 10, 2026
subtitle: TypeScript's types replace the old actionTypes variable.
---

The premise: A stateful component (or hook) uses `useReducer` to keep track of state. The consumer of this stateful component (or hook) can pass in its _own_ reducer, which is then passed to `useReducer` and used instead of the stateful component's (or hook's) default one. In this way, the consumer can control state updates from the "outside". This is an example of [inversion of control](https://en.wikipedia.org/wiki/Inversion_of_control).

[This older example using React 16](https://codesandbox.io/p/sandbox/blog-state-reducer-pattern-eyrsc) is pretty much still what this pattern would look like using React 19, but the React 19 version would probably use TypeScript in lieu of the `actionTypes` variable for type safety. 

[Here is what it might look like if you were using React 19.](https://codesandbox.io/p/sandbox/sharp-david-w3lqtw) 



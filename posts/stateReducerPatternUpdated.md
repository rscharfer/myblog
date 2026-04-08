---
title: (React 19): State Reducer Pattern
# keywords:
#   - React
#   - Kent Dodds
#   - advance React patterns
published: 2026.04.08
---

The premise : A stateful component (or hook) uses `useReducer` and a default reducer to keep track of state. The consumer of this stateful component (or hook) can pass in its _own_ reducer, which is then passed to the `useReducer` instead of the default one, so that it can be responsible for handling the state updates from the "outside".

[The example using React 16](https://codesandbox.io/p/sandbox/blog-state-reducer-pattern-eyrsc) is pretty much this pattern would look like using React 19, but the React 19 version would probaby use TypeScript in lieu of `actionTypes` variable for type safety. 

[Here is what that would look like.](https://codesandbox.io/p/sandbox/sharp-david-w3lqtw) 



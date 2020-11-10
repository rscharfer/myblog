---
title: Epic React Pattern 3 - Flexible Compound Components
# keywords:
#   - React
#   - Kent Dodds
#   - advance React patterns
published: 2020.11.08
---

## What is weakness of making "compound component"s with `React.cloneElement`

The "clone element and add props to the clone" method of sharing state with the child elements becomes cumbersome if you want to share state with "grandchildren" and descendents ever further down the React element tree. And if one of the children is a built-in React element, such as `div`, you have to remember there is a restricted set of "props" you can add to it; you can only add props which are valid attributes of DOM elements.

```javascript
import React from "react";
import "./styles.css";

export default function App() {
  const divElement = <div>Hello</div>;

  // React will warn you that it is only permissible to give built in elements such as a div valid HTML attributes
  const Clone = React.cloneElement(divElement, {
    handleUpdate: () => console.log("updated!"),
  });
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      {Clone}
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}
```

## What alternatives are there to `React.cloneElement` if I want to "covertly" share state

You can share state via a React context. In this case, you would have to make sure that the children which need access to this state use `React.useContext` either directly or indirectly. Using this technique, you can ancestors several layers deep will have access to the state provided by the parent component

```javascript
import React from "react";
import "./styles.css";

const CountContext = React.createContext();

const Count = ({ children }) => {
  const [count, setCount] = React.useState(0);
  const increment = () => setCount((count) => count + 1);
  const decrement = () => setCount((count) => count - 1);
  const value = {
    count,
    increment,
    decrement,
  };
  return (
    <CountContext.Provider value={value}>{children}</CountContext.Provider>
  );
};

Count.CounterDisplay = (props) => {
  /* eslint react-hooks/rules-of-hooks: "off" */
  const { count } = React.useContext(CountContext);
  return (
    <div>
      Here is the count! <strong>{count}</strong>
    </div>
  );
};

Count.Button = ({ type }) => {
  const { increment, decrement } = React.useContext(CountContext);
  const clickHandler = type === "increment" ? increment : decrement;
  const label = type === "increment" ? "increment" : "decrement";
  return <button onClick={clickHandler}>{label}</button>;
};

export default function App() {
  return (
    <div className="App">
      <Count>
        <Count.CounterDisplay />
        <div>
          <span>And for some updater buttons</span>
          <Count.Button type="increment" />
          <Count.Button type="decrement" />
        </div>
      </Count>
    </div>
  );
}
```

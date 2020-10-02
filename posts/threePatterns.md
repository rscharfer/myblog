---
title: Three conditional rendering patterns
status: ready
---

There are three conditional rendering patterns which I have recently learned about and I am excited about using more of in the future. Two are cool and one is **really** cool. Here is a short description of each:

## Conditional Rendering with Higher Order Components

Rather than performing the "do we even have data?" check in a component and rendering something completely different when we don't, we can let a higher order component take care of this scenario for us, and safely assume the data we need will always be there.

So rather than a `List` component which looks like this...

```javascript
function List({ listItems }) {
  if (!listItems) return <div>Need data!!</div>;

  return (
    <ul>
      {listItems.map((item) => (
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  );
}
```

... we can utilize a higher-order component which will make sure the data we need is there and take care of rendering the error message when it isn't:

```javascript
const withData = (needsToBeTruthyProp) => (Component) => (props) => {
  if (!props[needsToBeTruthyProp]) return <div>Need data!!</div>;

  return <Component {...props} />;
};

const ListWithData = withData("listItems")(List);
```

Higher order components take a React component and return a React component and conventionally begin with the word "with". This is a signal to other developers that the function is a higher order component (HOC). In this case, if `listItems` has a falsey value, the error message will be rendered.

## Conditional Rendering with a Switch Statement

For a recent code challenge, I was under a lot of time pressure, and I discovered a way to conditionally render by using a switch statement inside of an immediately invoked function expression. I copied and pasted it into my code, and I have since taken the time to understand it. 😁 This is what it looks like..

```javascript
function App() {
  const [view, setView] = React.useState("hello");

  return (
    <div className="App">
      <button onClick={() => setView("hello")}>View 1</button>
      <button onClick={() => setView("bye")}>View 2</button>
      <button onClick={() => setView("fun")}>View 3</button>

      {(function () {
        switch (view) {
          case "hello":
            return <Hello />;
          case "bye":
            return <Bye />;
          case "fun":
            return <Fun />;
          default:
            return null;
        }
      })()}
    </div>
  );
}
```

This definitely worked for my use case, but defining and calling a function within a return statement seemed a little verbose somehow.

## Conditional Rendering with an Enum Pattern

Here is the **really** cool one. A colleague looked at what I sumbitted and suggested something way cooler to replace the switch statement. It uses an emum pattern 😍. This is what that looks like:

```javascript
function App() {
  const [view, setView] = React.useState("hello");

  return (
    <div className="App">
      <button onClick={() => setView("hello")}>View 1</button>
      <button onClick={() => setView("bye")}>View 2</button>
      <button onClick={() => setView("fun")}>View 3</button>
      {
        {
          hello: <Hello />,
          bye: <Bye />,
          fun: <Fun />,
        }[view]
      }
    </div>
  );
}
```

Rather than using an immediately invoked function expression, we are using an object literal mapping different states of the component to React elements and passing in the state we want rendered with bracket notation. Cool, isn't it?

[Play with the code here in Code Sandbox](https://codesandbox.io/s/blog-three-conditional-rendering-patterns-o57kq)

---
title: useState and props
keywords:
  - React
  - Kent Dodds
published: 10.18.2020
status: ready
---

When you initialize `useState` with a prop, you have to remember that all you are doing is _initializing_ the state with the prop. I was working on a project recently, and I had forgotten this fact, and I was wondering why the state of our component was not remaining in sync with prop changes. But of course this is silly because if you want a piece of state to remain in sync with a prop, you would probably just use the prop to begin with and not bother creating creating state in the compomnent that tracks the prop changes. Once a component creates a piece of state, it is not meant to be overridden from a prop coming in from the outside; the state is meant to be completely controlled by the component.

```javascript
function App() {
  const [counter, setCounter] = React.useState(0);
  return (
    <div className="App">
      <button onClick={() => setCounter(counter + 1)}>increment</button>
      <button onClick={() => setCounter(counter - 1)}>decrement</button>
      <CounterDisplay parentCounterVal={counter} />
      <SmarterCounterDisplay parentCounterVal={counter} />
    </div>
  );
}

function CounterDisplay({ parentCounterVal }) {
  // once counter is part of the component state, it is something completely controlled by the component
  const [counter, setCounter] = React.useState(parentCounterVal);

  return (
    <>
      <h1 style={{ color: "green" }}>{counter} </h1>
    </>
  );
}

function SmarterCounterDisplay({ parentCounterVal }) {
  // if you something to stay in sync with the props, use the props directly
  return (
    <>
      <h1 style={{ color: "tomato" }}>{parentCounterVal} </h1>
    </>
  );
}
```

[Here is a little demo on CodePen] (<https://codesandbox.io/s/use-prop-to-set-initial-state-with-usestate-wps9h>)

While we are on `useState`, I recently learned that you can lazily initialize a piece of state with it, but I wasn't really clear on why you would want to do that. I know now. 👍🏼 It is because `useState` is called on _every_ render, and in order for React to call it, it of course needs to calculate its arguments, so it knows what to call it with.  You use lazy initialization when calculating these arguments is an expensive task.

```javascript
// Example 1

// In order for React to call useState on every render it needs to first grab the value from local storage (even though it doesn't use it) and this is relatively expensive.
const [name, setName] = useState(window.localStorage.getItem("name") || "");

// Example 2

// React needs to know what the cool number is before calling use state, and this is done on every render
const [coolNumber, setCoolNumber] = useState(calculateCoolNumber());

// You can think of the above example this way. On every render, coolNumber is defined and then passed to useState.

const coolNumber = calculateCoolNumber();
const [coolNumber, setCoolNumber] = useState(calculateCoolNumber);

```

When you pass a function into `useState`, the function is defined and saved into memory on every render, but it is only called in the initial render and the value created on the initial render, which is now in memory, is returned.

```javascript
function App() {
  const [count, setCount] = React.useState(
    () => JSON.parse(window.localStorage.getItem("counterValue")) || 0
  );

  React.useEffect(() => {
    window.localStorage.setItem("counterValue", JSON.stringify(count));
  }, [count]);

  return (
    <div>
      Here is the count: {count}
      <div>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </div>
      <div>
        <button onClick={() => setCount(count - 1)}>Decrement</button>
      </div>
    </div>
  );
}
```

[Here is the code in CodePen] (<https://codesandbox.io/s/blog-lazy-initialization-ployt>)

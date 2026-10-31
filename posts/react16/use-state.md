---
title: Use a prop, not another piece of state
created: October 18, 2020
updated: October 31, 2026
subtitle: The argument passed to useState is only used once.

---

When you pass a value into `useState`, you have to remember that all you are doing is _initializing_ the state with the value. I was working on a project recently, and I had forgotten this fact. The value given to `useState` was a prop that was passed to the component, and I was wondering why the state of the component was not remaining in sync with prop changes. In hindsight, the fix was obvious. If you want a piece of state to remain in sync with a prop, you would probably just use the prop to begin with and not bother creating state in the component that "tracks" the prop changes. Once a component creates a piece of state, it is not meant to be overridden from a prop coming in from the outside; the state is meant to be completely controlled by the component.

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
  // counter is initialized with parentCounterVal but can only be changed by calling setCounter once initialized; a different parentCounterVal passed in once the component has rendered will not change the UI

  const [counter, setCounter] = React.useState(parentCounterVal);

  return (
    <>
      <h1 style={{ color: "green" }}>{counter} </h1>
    </>
  );
}

function SmarterCounterDisplay({ parentCounterVal }) {
  // if you want something to stay in sync with the props, use the props directly
  return (
    <>
      <h1 style={{ color: "tomato" }}>{parentCounterVal} </h1>
    </>
  );
}
```

[Here is a little demo on CodeSandbox](https://codesandbox.io/s/use-prop-to-set-initial-state-with-usestate-wps9h)


If you are calling an expensive function to create the initial state, doing so could hurt performance. Though the return value is only used on first render, the function is still called each time.

```javascript
// Example 1

// localStorage is read and parsed every render, although the result is used only once.
const [count, setCount] = useState(JSON.parse(window.localStorage.getItem("counterValue")) || 0);

// Example 2

// calculateLongArray is called every render, although its return value is used only once
const [longArray, setLongArray] = useState(calculateLongArray());
```

When you pass a _function_ into `useState`, the function is only called on the initial render. That means we can pass a function so that the expensive calculation like grabbing something from localStorage or calling `calculateLongArray` is only done once.

```javascript
function App() {
  const [count, setCount] = useState(
    () => JSON.parse(window.localStorage.getItem("counterValue")) || 0
  );

  const [longArray, setLongArray] = useState(calculateLongArray);

  useEffect(() => {
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
      <div>
        <button onClick={() => setLongArray([...longArray, Math.round(Math.random() * 10)])}>
          Add value to array
        </button>
      </div>
      <pre>
        {JSON.stringify(longArray)}
      </pre>
    </div>
  );
}
```

[Here is the code in CodeSandbox](https://codesandbox.io/s/blog-lazy-initialization-ployt)

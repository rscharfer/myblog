---
title: Advanced React pattern - State reducer pattern
# keywords:
#   - patterns
#   - React
#   - Kent Dodds
---

The premise : A stateful component (or hook) has its own state by default, and its own way of updating it, but that component (or hook) gives the user of it the opportunity to override this behavior if it wants.

Let's look at an example. Let's say there is a custom hook called `usePointTotal`. By default, `usePointTotal` will react to events this way: if an `ADD_ONE` action is dispatched, the point total in the state will be increased by one. If an `ADD_FIVE` action is dispatched, the point total in the state will be increased by five. And a dispatched `ADD_TEN` action would do what you would expect it to do. 😉

However, `usePointTotal` also gives its users the opportunity to override this behavior. Let's say a user wanted the point total to reset to 0 when it exceeds 100. It can do that by passing in its _own_ reducer. The customer reducer actually uses the default reducer first to get what the default reducer would return given the state and action, but overrides the return value in certain cases. And it's this state which is saved in memory somewhere and passed to the custom reducer (and by extension the default reducer it uses) that next time it is called.

Here is what that looks like:

```javascript
const actionTypes = {
  ADD_FIVE: "ADD_FIVE",
  ADD_ONE: "ADD_ONE",
  ADD_TEN: "ADD_TEN",
};

function defaultReducer(state, action) {
  switch (action.type) {
    case actionTypes.ADD_ONE:
      return { ...state, pointTotal: state.pointTotal + 1 };
    case actionTypes.ADD_FIVE:
      return { ...state, pointTotal: state.pointTotal + 5 };
    case actionTypes.ADD_TEN:
      return { ...state, pointTotal: state.pointTotal + 10 };
    default:
      return state;
  }
}

// we have a custom hook here
// which has some local state when called
// it returns its state and methods to update its state

function usePointTotal({ reducer = defaultReducer } = {}) {
  // we are going to keep track of some state, which will be an object with the property "point total" on it.
  const [{ pointTotal }, dispatch] = React.useReducer(reducer, {
    pointTotal: 0,
  });

  const addTen = () => dispatch({ type: actionTypes.ADD_TEN });
  const addOne = () => dispatch({ type: actionTypes.ADD_ONE });
  const addFive = () => dispatch({ type: actionTypes.ADD_FIVE });

  return {
    addOne,
    addFive,
    addTen,
    pointTotal,
  };
}

export default function App() {
  const { pointTotal, addOne, addFive, addTen } = usePointTotal({
    reducer(state, action) {
      const { pointTotal } = defaultReducer(state, action);
      if (pointTotal > 100) {
        return { pointTotal: 0 };
      } else
        return {
          pointTotal,
        };
    },
  });
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <div>
        <button
          onClick={() => {
            addOne();
          }}
        >
          Add One
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            addTen();
          }}
        >
          Add Ten
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            addFive();
          }}
        >
          Add Five
        </button>
      </div>
      <div>
        Point total <span>{pointTotal}</span>
      </div>
    </div>
  );
}
```

[Here is the code on CodePen.](https://codesandbox.io/dashboard/all/Blog?workspace=162522ac-f6a7-47f3-99c0-5d08f717afc3)

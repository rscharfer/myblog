---
title: "State Reducer Pattern"
keywords:
  - patterns
  - React
  - Kent Dodds
published: 10.01.2020
status: "ready"
---

Premise : an external entity X gives another entity Y control over its state. Y informs X how it wants X's state to change what an event Z occurs.

Let's look at an example. Let's say there is an external entity, a custom hook called `useToggle`. `useToggle` uses `useReducer`. `useToggle` allows the users of it to customize how it makes changes to the state by accepting a reducer function from the user. It still defines the actions that can be disptached, but allows the user to define how state is modified by those actions (via this reducer function). In this case, the user wants to first get the state as it would look if it didn't provide a custom reducer function. (Kent Dodds calls this the "changes" object.) It then overrides some of the properties in the state (or "changes" object) if it deems necessary, usually based on what is going on in its own state or on what type of action it is.

```javascript
const defaultReducer = (state, action) => {
  switch (action.type) {
    case "INCREMENT_BY_FIVE":
      return { pointTotal: state.pointTotal + 5 };
    case "INCREMENT":
      return { pointTotal: state.pointTotal + 1 };
    default:
      return state;
  }
};

function usePointTotal({ reducer = defaultReducer } = {}) {
  const [{ pointTotal }, dispatch] = React.useReducer(reducer, {
    pointTotal: 0,
  });
  const incrementByFive = () => dispatch({ type: "INCREMENT_BY_FIVE" });
  const increment = () => dispatch({ type: "INCREMENT" });
  return [pointTotal, incrementByFive, increment];
}

export default function App() {
  const [buttonClicks, setButtonClicks] = React.useState(0);

  const [pointTotal, incrementByFive, increment] = usePointTotal({
    reducer(state, action) {
      let { pointTotal } = defaultReducer(state, action);
      return buttonClicks > 5 ? { pointTotal: "DONE" } : { pointTotal };
    },
  });
  return (
    <div className="App">
      <div>Point total {pointTotal}</div>
      <div>Clicks {buttonClicks}</div>
      <div>
        <button
          onClick={() => {
            incrementByFive();
            setButtonClicks(buttonClicks + 1);
          }}
        >
          Increment Points By 5
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            increment();
            setButtonClicks(buttonClicks + 1);
          }}
        >
          Increment Points By 1
        </button>
      </div>
    </div>
  );
}
```

It seems like this state reducer pattern, which allows users of entities to determine how the state in those entities will change in response to certain events is a huge violation of object orienting programming policy. In OOP, objects provide methods to others to call and the objects choose how they will respond to (and how their state will change in respose to) those events. In this case _the user_ determines how the state in the entity changes in response to a certain event. This isn't OOP, however.

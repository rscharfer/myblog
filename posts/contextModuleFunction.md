---
title: Epic React Pattern 1 - Context module function
# keywords:
#   - React
#   - Kent Dodds
#   - advance React patterns
published: 2020.10.26
---

Essentially, what Kent C. Dodds dubs the "context module pattern" is a combination of two things:

- passing down a naked "updater" function as part of a React context `value`. An 'updater' function can be the second item in the array returned from `React.useReducer` or the second item in the array returned by `React.useState`.

  ```javascript
  const CountContext = React.createContext();
  const Provider = (props) => {
    const [count, setCount] = React.useState(0);
    const value = [count, setCount];
    // we are merely providing the naked updater, setCount, and the count itself to consumers.
    // we are _not_ passing down a helper from the provider such as:
    // const increment = () => setState(state => state + 1);
    return <CountContext.Provider value={value} {...props} />;
  };
  ```

- a helper exported from the "context module". Although there is no helper passed from the provider when you use this pattern, you can still (and are encouraged to) use helpers.  The context module is the module is where you might create the context and define the provider above. In contrast to a helper function provided by the context provider, an `export`ed/`import`ed function from the _context module_ can be lazily loaded on an as-needed basis, providing a performance gain. The helper function takes the naked updater as an argument.

```javascript
export async function updateUser(dispatch, user, updates) {
  dispatch({ type: "start update", updates });
  try {
    const updatedUser = await userClient.updateUser(user, updates);
    dispatch({ type: "finish update", updatedUser });
    return updatedUser;
  } catch (error) {
    dispatch({ type: "fail update", error });
    return Promise.reject(error);
  }
}
```

## What is good about this pattern?

1. Ultimate flexibility as the consumer has access to the 'naked' updater. It can, for example, dispatch any variety of actions with the `dispatch` function if it wishes to.

2. You can still provide helpers which ease the burden on the user. A helper which dispatches a sequence of actions would be an example.

3. Because the helpers are imported as needed, they can be loaded on an as-needed basis via code-splitting.

4. React knows the updaters such as those returned as the second item in the arrays returned from `useReducer` and `useState` do not change, so there is no need to memoize them.

## What is not so good about this pattern?

1. More flexibility is not always something you want. It may be easier on the user if you restrict what the user can do with the updater. This can be done by passing down helpers such as `increment` via the provider, and not the naked updater function.

---
[The context module pattern on Code Sandbox](https://codesandbox.io/s/context-module-function-8z83p)

## How you can enhance this pattern?

You can pass the updater and the actual state into two different providers.  That one the user of one does not have to subscribe to other.  For example, if the component just subscribes to the updater function, it will not be rerendered just because the state part of the context value changes. 

[Enhanced pattern on Code Sandbox](https://codesandbox.io/s/two-providers-for-state-and-state-updater-yu3sn)

---
title: (React 19) Latest Ref Pattern
# keywords:
#   - React
#   - Kent C. Dodds
#   - advanced React patterns
published: 2026.04.07
---


## What problem does the latest ref pattern solve?

Functions that are created inside of function components have immediate access to the state of that component and props passed to the component.
```js
 function MyComponent({ name, age }) {
    const [likeCount, setLikeCount] = useState(0)

    const createWelcomeMessage = () => {
        return `Hello, ${name} of age ${age}.  You currently have ${likeCount} likes.`
    }

    return <div>{createWelcomeMessage()}</div>
 } 

```
Here `likeCount`, `name`, and `age` are in `createWelcomeMessage`'s lexical scope, so it can pluck them right out of there and use them.

Sometimes though, a function is async and when by the time it gets around to finishing, the props and state of the function have changed. If the function needs the newest state and props, it would be out of luck;  it only has access to the values in its lexical scope.

Here we have a "game" where the you can summon help from another user.  Unfortunately, summoning help takes about two seconds because the back end needs to choose a player to help you.  After the server returns a helper, it tries to place the helper in the same location you (represented by your pointer) currently is.  Unfortunately, it can't do that though because your old location is "locked in" its lexical scope. As a result, if you keep moving your mouse while the helper is being fetched, the helper is placed somewhere you aren't.
[Sandbox Link](https://codesandbox.io/p/sandbox/blog-react-19-latest-ref-problem-xhyr9v)



## What can we do about this?

Instead of having `summonHelp` grab x and y from its lexical scope, have it grab them from a ref.  That is the latest ref pattern.


[Sandbox Link](https://codesandbox.io/p/sandbox/latest-ref-solution-d3gzg2) 

## In a nutshell...

If you have an async function which needs access to the latest state i.e. not the state in its lexical scope, you can save that state to a ref either in `useEffect` or `useLayoutEffect`. 





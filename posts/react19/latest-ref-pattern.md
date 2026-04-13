---
title: React 19 - Latest Ref Pattern
published: April 7, 2026
subtitle: here is the subtitle
---


## What problem does the latest ref pattern solve? Use Case #1

Functions that are created inside of function components have immediate access to the state of that component and props passed to the component. Here `likeCount`, `name`, and `age` are in `createWelcomeMessage`'s lexical scope, so it can "see them" and use them.

```js
 function MyComponent({ name, age }) {
    const [likeCount, setLikeCount] = useState(0)

    const createWelcomeMessage = () => {
        return `Hello, ${name} of age ${age}.  You currently have ${likeCount} likes.`
    }

    return <div>{createWelcomeMessage()}</div>
 } 

```

Sometimes though, a function is async and by the time it gets around to finishing, the props and state of the function have changed. If the function needs the newest state and props, it would be out of luck;  it only has access to the values in its lexical scope.

[Here we have a "game" where the you can summon help from another user](https://codesandbox.io/p/sandbox/blog-react-19-latest-ref-problem-xhyr9v).  Unfortunately, summoning help takes about two seconds because the back end needs to choose a player to help you.  After the server returns a helper, it tries to place the helper in the same location you (represented by your pointer) currently are.  Unfortunately, it can't do that because your old location is "locked in" its lexical scope. As a result, if you keep moving your mouse while the helper is being fetched, the helper is placed somewhere you aren't. 

```js
 const summonHelp = async () => {
    const helper = await grabAHelper(); // takes two seconds or so to grab a helper from the back end
    placeHelperNextToMe(helper, location); // puts the helper next to the user on the screen
  };

```



## What can we do about this?

Instead of having `summonHelp` grab x and y from its lexical scope, have it grab them from a ref.  That is the latest ref pattern.


[Here is the fixed version of the game.](https://codesandbox.io/p/sandbox/latest-ref-solution-d3gzg2) 

## What problem does the latest ref pattern solve? Use Case #2

Some use this pattern to remove a dependency for an effect that is causing the entire effect to re-synchronize when the dependency's value changes, which they do not want to happen.

In this example, `increment` is updated with a button in the UI.  An interval set in an effect is used to update `count` every second. Because of the reference to `increment`, the linter requires it to be listed as a dependency. The drawback of listing `increment` as a dependency is that the interval is cleared and re-set each time `increment` changes, which could make the count update appear to hang.

```js

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + increment);
    }, 1000);
    return () => {
      clearInterval(id);
    };
  }, [increment]);

```

This is where using the ref pattern could potentially help.

```js

  const incrementRef = useRef(increment);
  
  useEffect(() => {
    incrementRef.current = increment
  })
  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + incrementRef.current);
    }, 1000);
    return () => {
      clearInterval(id);
    };
  }, []);

```

This problem illustrated in use case #2 can actually also be solved by [useEffectEvent](https://react.dev/reference/react/useEffectEvent). 

## In summary

Two use cases where the latest ref pattern could be beneficial are:
* an async event handler needs access to the latest state / props i.e. use case #1
* a value used in your use effect is causing re-synchronization of that effect, and that is not a good thing.  i.e. use case #2.  The [useEffectEvent](https://react.dev/reference/react/useEffectEvent) hook can now help us with this. 






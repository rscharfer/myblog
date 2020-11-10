---
title: Adding a third party script to a React app
published: 2020.10.18
---

I recently wanted to add a third party script for a comments widget to this blog, and I realized utilizing some of the conventional ways to add third-party scripts to React apps would not work. This was because the widget's installation instructions required me to place the script tag not in the `<head/>` of the document, but in the `<body/>`, and at the exact location where I wanted to widget to be inserted. The script would then use `document.currentScript.insertAdjacentHTML` to insert a the widget immediately after itself in the DOM. Pretty cool, but I wasn't sure where I would place the thing.

Lacking any other ideas, I first tried placing the script tag directly in the returned JSX.

```javascript
function Post() {
  return (
    <>
      <div>Post body....</div>
      <script src="commentswidget.js"></script>
    </>
  );
}
```

Because React only updates the nodes in the JSX it needs to, this idea is not as crazy as it probably sounds. Unfortunately, it doesn't work. React renders the script tag in the DOM as expected, but the `src` is not retrieved by the browser.

After a little more research I learned that I could "dynamically" add the script to the DOM in `componentDidMount` or `useEffect` with an empty dependency array, depending on whether you are using class or function components.

```javascript
function ThirdPartyCodeExample() {
  const [timesClicked, setTimesClicked] = React.useState(0);
  const scriptContainer = React.useRef(null);

  React.useEffect(() => {
    const script = document.createElement("script");
    // this can be any third party script
    script.src = "https://utteranc.es/client.js";
    script.integrity = "sha256-4+XzXVhsDmqanXGHaHvgh1gMQKX40OUvDEBTu8JcmNs=";
    script.crossOrigin = "anonymous";
    scriptContainer.current.append(script);
    return () => script.remove();
  }, []);

  return (
    <>
      <div>Times clicked:{timesClicked}</div>
      <button onClick={() => setTimesClicked(timesClicked + 1)}>
        Update times clicked
      </button>
      <div ref={scriptContainer}></div>
    </>
  );
}
```

That worked. The `src` was downloaded one time and one time only even when the component rerenders due to changes in state.

But then I was curious:

- Why didn't the first solution work? The script was added to the DOM, so why wasn't the `src` downloaded and executed?

- And why wasn't the script tag _removed_ by React on subsequent re-renders? It seems if React would compare the JSX to the DOM on subsequent re-renders, it would see there was a difference and remove the script tag again to smooth out those differences.

## id=what_keeps_browsers What keeps browsers from executing a script in a script tag

After some research, [I found out browsers will not execute scripts in script tags inserted into the DOM via innerHTML](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#Security_considerations). (This is the reason why inserting a third-party-script with `dangerouslySetInnerHTML` doesn't work. You will see the script in the DOM, but it will be "inert".) And this is exactly how React renders script tags into the DOM. [Here is it in the source code.](https://github.com/facebook/react/blob/a08ae9f147a716520a089055e2dec8f5397a4b0f/packages/react-dom/src/client/ReactDOMComponent.js#L439)

## Why isn't the script tag removed from React on subsequent renders

Between renders, React will only touch the DOM nodes it has to touch. If a node doesn't change between renders, then it won't touch it. And _as far as React knows_ the DOM node holding the widget never changes. The script container starts as a empty `div` (according to the JSX) and remains an empty `div` (according to the JSX). For React, the React element tree is the single source of truth.

So that is what I found out after a couple days of research. Hoped it helped!

[Here is the code in Code Sandbox.](https://codesandbox.io/s/third-party-script-c4ki9)

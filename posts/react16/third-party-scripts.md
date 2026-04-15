---
title: Why you can't add a third party script in the render function
published: October 18, 2020
subtitle: Turns out scripts added with innerHTML are inert.
---

[I recently wanted to add a third-party script for a comments widget to this blog.](https://github.com/utterance) My first thought was to add this to the `<head/>` of the document, maybe with a `defer` attribute because it needed to latch onto a DOM node. [Then I found some documentation which indicated that the script needed be placed in the `<body/>`, and at the exact place in the DOM where the widget should be instealled.](https://utteranc.es/#heading-enable). The script would then use `document.currentScript.insertAdjacentHTML` to insert the widget immediately after itself in the DOM, and then the script would delete itself.  Pretty cool, but I wasn't sure where I could place the thing.
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

The `<script/>` was indeed rendered to the DOM but the `src` was not downloaded. Putting aside the issue that the script deleted itself and I don't know how React would reconcile that on subsequent renders, I dug around in the React source code to find out why the `src` was not downloading.  

[It turns our browsers will not execute scripts in script tags inserted into the DOM via innerHTML](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#Security_considerations). You will see the script in the DOM, but it will be "inert".  [And this is exactly how React renders "JSX" script tags into the DOM.](https://github.com/facebook/react/blob/a08ae9f147a716520a089055e2dec8f5397a4b0f/packages/react-dom/src/client/ReactDOMComponent.js#L439) 

So that idea did not work. 

After a little more research I figured out that I could dynamically add the script to the DOM the way I wanted to in an effect using a `ref`.

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


[Here is the code in Code Sandbox.](https://codesandbox.io/s/third-party-script-c4ki9)

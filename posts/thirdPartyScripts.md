---
title: "Adding a third party script to a React app"
author: "Ryan Scharfer"
---

I recently added a third party script for a comments widgit to this blog, and I realized utilizing some of the conventional ways of doing this in a React app would not work for my case. This was because the installation instructions required me to place the script tag in the `body`, and at the exact location where I wanted to widget to be placed, not in the `head`. The script would then use `document.currentScript.insertAdjacentHTML` to insert a the widgit immediately after itself in the DOM. Pretty cool, but I wasn't sure where I would place the thing.

Lacking another idea, I first tried placing the script tag directly in the returned JSX.

```javascript
function Post() {
  return (
    <>
      <div>Post body....</div>
      <script src="commentsWidgit.js"></script>
    </>
  );
}
```

Because React only updates the nodes in the JSX that it needs to, this idea is not as crazy as it probably sounds. But it didn't work. React rendered the script tag in the DOM as expected, but the `src` was not retrieved by the browser. After I did a little more research I learned that I could "dynamically" add the script to the DOM in componentDidMount. That worked. The src was downloaded one time and only one time even when the app was subsequenty rerendered.

```javascript
function Post() {
  const scriptContainer = React.useRef(null);

  React.useEffect(()=>{
    const script = document.createElement('script');
    script.src = "commentsWidgit.js";
    scriptContainer.current.appendChild(script);
  },[])
  return (
    <>
      <div>Post body....</div>
      <div ref={scriptContainer}></div>
    </>
  );
}
```

But then I was curious:

- When the script tag was added to the DOM using the "React way", why wasn't the `src` downloaded by the browser?

- Why wasn't the script tag removed by React in subsequent renders? After all the the JSX is supposed to describe for React how it wants the UI to look, and JSX definitely does not mention any sort of script tag.

## What keeps browsers from executing a script in a script tag

After some research, I found out browsers will not execute scripts in script tag inserted into the DOM via innerHTML. (This is the reason why inserting a third-party-script with `dangerouslySetInnerHTML` doesn't work. You will see the script in the DOM, but it will be "inert".) So is that how React inserts nodes into the DOM? That was my theory, but the more I thought about it, the more I thought that it had to be done in a more sophisticated way.

## Why isn't the script tag removed from React on subsequent renders

Between renders, React will only touch the DOM nodes it has to touch. If a node doesn't change between renders, then it won't touch it. And _as far as React knows_ the DOM node holding the widgit never changes. This is because React's source of truth for the DOM description is the React element tree returned by the component and that does not change. The container for the widgit starts as a empty `div` (according to the JSX) and remains an empty `div` (according to the JSX).

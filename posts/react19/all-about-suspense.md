---
title: Implementing the loading spinner in React
published: April 22, 2026
subtitle: Different ways to use React's <Suspense> to providing a pleasant UX as a page loads
---

In the old days, you might fetch data in an `useEffect` hook, set some state inside the hook once you have the data, and show a spinner if that state is not yet set.

`<Suspense/>` lets you write that kind of logic in a much more declarative way. You can create a component that uses `use` to fetch the data inside a `<Suspense>` boundary's child, and `<Suspense` will show the `fallback` UI e.g. a spinner - until the promise passed to `use` resolves.

It takes some work to set this up because you need a way of caching the promise passed to `use` so that you are not passing a new promise every render, but if you are using a framework like Next.js or Relay, and using their data-fetching mechanisms, using `<Suspense>` around data fetching components could be the way to go.

You can also use `<Suspense/>` to declaratively write fallback UI logic when you are lazily loading a component with `React.lazy`.

If for whatever reason, you do not what to show an alternative `fallback` UI, you can just omit it. What is wrapped with the `Suspense>` wrapper will not keep the rest of the component from rendering.

If you like using `<Suspense>` and you do not want to keep showing the `fallback` UI every time the `children` are loading something, you can use either `startTransition` or `useDeferredValue` to keep what is already loaded on the screen there until the new content is ready.  In these cases, the `fallback` UI is still important, but only used once - on loading.

What does "suspend" mean?

A component "suspends" when it uses either `lazy` to load a component or `use` to wait on a promise to resolve.  Technically, both functions throw promises which resolve when the promise passed to them resolves, and the `<Suspense>` boundary catches this promise and shows `fallback` until it resolves.



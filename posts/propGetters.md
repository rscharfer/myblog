---
title: Epic React Pattern 4 - Prop Collections and Prop Getters
# keywords:
#   - React
#   - Kent Dodds
#   - advance React patterns
published: 2020.11.09
---


## Why use them?

Some hooks are used to build UI. If you are building one of these hooks for others, you may want to use "prop collections" or "prop getters" to make it easy to automatically add important properties to the UI, such as event handlers and `aria` attributes used for accessibility.

## Where can I find these in the "real world"?

The hooks built by [React Table](https://github.com/tannerlinsley/react-table) provide the user with prop getters you can call to get the attributes you will need to add to your `table`, `thead`, and `tbody` elements. The prop getters will add things such as the [role attribute] (https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Table_Role) to each element. You can pass in an object to the prop getter to override the values that are returned.

## What do you have to watch for?

You need to make sure the user knows where to apply the prop collections he is getting back.

## What is the difference between a prop collection and prop getters?

With prop getters, you allow the user to override the props he would typically get back with a prop collection. A lot of times this involves composing functions together.

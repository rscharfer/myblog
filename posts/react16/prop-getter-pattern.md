---
title: Use prop collections to pass on aria attributes
published: November 9, 2020
subtitle: Package up the props which always need to be passed to a component in a hook.
---


## Why use them?

Sometimes a set of properties needs to be passed to a component which you do not necessarily need to customize all of the time, such as aria props. One way to make this easy on yourself is to a write a hook that can always provided the "fixed" properties - i.e. a property colleciton -- and you spread the return value from that hook into your component.

```javascript
function useToggle() {
	const [on, setOn] = useState(false)
	const toggle = () => setOn(!on)

	return {
		on,
		toggle,
		togglerProps: {
			'aria-checked': on,
			onClick: toggle,
		},
	}
}

function App() {
	const { on, togglerProps } = useToggle()
	return (
        <button aria-label="custom-button" {...togglerProps}>
            {on ? 'on' : 'off'}
        </button>

	)
}
```


## Where can I find these in the "real world"?

The hooks built by [React Table](https://github.com/tannerlinsley/react-table) provide the user with prop getters you can call to get the attributes you will need to add to your `table`, `thead`, and `tbody` elements. The prop getters will add things such as the [role attribute](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Table_Role) to each element. You can pass in an object to the prop getter to override the values that are returned.

## What do you have to watch for?

You need to make sure the user knows where to apply the prop collections they are getting back.

## What is the difference between a prop collection and prop getters?

With prop getters, you allow the user to override the props they would typically get back with a prop collection. A lot of times this involves composing functions together.

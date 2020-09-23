---
title: "Two Conditional Rendering Patterns"
author: "Ryan Scharfer"
---

There are a couple of conditional rendering patterns which I have recently learned about and which I am excited about using more of in the future. Here is a short description of each:

## Conditional Rendering with Higher Order Components
Rather than performing the "do we even have data?" check in a component and rendering something completely different when we don't, we can let a higher order component take care of this scenario for us, and safely assume the data we need will always be there.

So rather than a <code>List</code> component which looks like this...

```javascript
import React from "react";

function List({ listItems }) {
  // here is the "do we have data?" check which we might be doing in a lot of components
  if (!listItems) return <CustomErrorComponent />;
  // the "yes, we have data" scenario
  return (
    <ul>
      {listItems.map((item) => (
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  );
}
```

... we can utilize a higher-order component which will make sure the data we need is there and take care of rendering the error message when it isn't:

```javascript
 // returns a component which will either render <CustomErrorComponent/> or the previously passed component if the prop is truthy
 const withData = needsToBeTruthyProp => Component  => props => {
   if (!propThatNeedsToBeTruthy) return <CustomErrorComponent/>
   return <Component ...props>
 }

 const ListWithData = withData('listItems')(List);

 export default ListWithData
```

Higher order components take a React component and return a React component and conventionally begin with the word "with". This is a signal to other developers that the function is a higher order component (HOC).

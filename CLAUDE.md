## Prose

When writing, please avoid using common AI punctuation. I.e. instead of em dashes, use hyphens, instead of ellipses, use periods, etc.

## React Components

When writing react components, please keep code in this specific order of sections:

- **Refs** - Any react refs, from useRef, useImperativeHandle, etc.
- **State** - Mutable state, from useState, useOptimistic, useReducer, etc.
- **Computed values** - any values that are derived from other values in the component, including hooks.
- **Methods** - Functions called as part of the UI, onClick, onSubmit, etc.
- **Effects** - Any side effects, from useEffect, useLayoutEffect, etc.
- **Renderers** - Any function returning JSX, other than return value.

To make the component more readable, please add comments above the section. I.e.

```tsx
function SomeComponent() {
  // State
  const [count, setCount] = useState(0);
  
  // Computed Values
  const timesTwo = count * 2;
  
  // Methods
  const onClick = () => setCount((count) => count + 1);
  
  // Effects
  useEffect(() => {
    console.info('Mounted');
  }, []);
  
  // Renderers
  const renderItem = (index: number) => <p>#{index}</p>;
  
  return (
    <div>
      <p>Total * 2 = {timesTwo}</p>
      {Array.from({ length: count }, (_, index) => renderItem(index))}
    </div>
  )
}
```

Do not include a `// Renderers` comment if there are no renderers, only a return value.
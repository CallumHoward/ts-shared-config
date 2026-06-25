// JSX sample — exercises the react built-in plugin (no-array-index-key) and
// gives the react jsPlugins something to run against.
export function List({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

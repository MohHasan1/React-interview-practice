import Child from "./Child.jsx";

export default function ChildToParent() {
  // TODO: Store the message received from the child in state.
  // TODO: Create a callback and pass it to Child as a prop.

  return (
    <>
      <h1>Pass state from child to parent</h1>
      <p>
        Type a message in the child and click Send. Show that message in the
        parent.
      </p>

      <h2>Parent</h2>
      <p>Received message: {/* TODO: Display the message here. */}</p>

      <Child />
    </>
  );
}

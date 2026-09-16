export default function Child() {
  // TODO: Store the input value in state.
  // TODO: Receive the parent's callback as a prop.
  // TODO: Call it with the input value when Send is clicked.

  return (
    <section>
      <h2>Child</h2>
      <label>
        Message: <input type="text" placeholder="Enter a message" />
      </label>
      <button type="button">Send</button>
    </section>
  );
}

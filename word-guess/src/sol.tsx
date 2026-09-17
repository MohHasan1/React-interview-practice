// // Word Guess
// //
// // Read INSTRUCTIONS.md before starting.
// //
// // TODO 1: Render the 5x5 game board with the required accessible roles.
// // TODO 2: Add the Guess input and Submit guess behavior.
// // TODO 3: Validate guesses without consuming attempts.
// // TODO 4: Score submitted letters as correct, present, or absent.
// // TODO 5: Handle duplicate letters correctly.
// // TODO 6: Add win and loss behavior.
// // TODO 7: Add the attempts counter.
// // TODO 8: Add New game reset behavior.
// // TODO 9: Make the UI readable and responsive.
// // TODO 10: Run required tests, build, and lint before submitting.

// import { useState } from "react";

// const SECRET_WORD = "SPEND";
// const MAX_GUESSES = 5;
// const WORD_LENGTH = 5;

// export default function App() {
//   const [guesses, setGuesses] = useState([]);
//   const [input, setInput] = useState("");
//   const [gameStatus, setGameStatus] = useState("playing");
//   const [error, setError] = useState("");

//   function getBackgroundColor(letter, index) {
//     if (SECRET_WORD[index] === letter) {
//       return "green";
//     }

//     if (SECRET_WORD.includes(letter)) {
//       return "yellow";
//     }

//     return "red";
//   }

//   function handleInputChange(event) {
//     const value = event.target.value
//       .toUpperCase()
//       .replace(/[^A-Z]/g, "")
//       .slice(0, WORD_LENGTH);

//     setInput(value);
//     setError("");
//   }

//   function handleSubmit(event) {
//     event.preventDefault();

//     if (gameStatus !== "playing") {
//       return;
//     }

//     if (input.length !== WORD_LENGTH) {
//       setError("Guess must be 5 characters.");
//       return;
//     }

//     const newGuesses = [...guesses, input];

//     setGuesses(newGuesses);
//     setInput("");
//     setError("");

//     if (input === SECRET_WORD) {
//       setGameStatus("won");
//       return;
//     }

//     if (newGuesses.length === MAX_GUESSES) {
//       setGameStatus("lost");
//     }
//   }

//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "center",
//         alignItems: "center",
//       }}
//     >
//       <h1>Wordle</h1>

//       <div>
//         {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
//           const guess = guesses[rowIndex];

//           return (
//             <div
//               key={rowIndex}
//               style={{
//                 display: "flex",
//               }}
//             >
//               {Array.from({ length: WORD_LENGTH }).map((_, columnIndex) => {
//                 const letter = guess?.[columnIndex] ?? "";

//                 return (
//                   <div
//                     key={columnIndex}
//                     style={{
//                       width: "50px",
//                       height: "50px",
//                       border: "1px solid black",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       backgroundColor: guess
//                         ? getBackgroundColor(letter, columnIndex)
//                         : "white",
//                     }}
//                   >
//                     {letter}
//                   </div>
//                 );
//               })}
//             </div>
//           );
//         })}
//       </div>

//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           value={input}
//           onChange={handleInputChange}
//           maxLength={WORD_LENGTH}
//           disabled={gameStatus !== "playing"}
//         />

//         <button type="submit" disabled={gameStatus !== "playing"}>
//           Guess
//         </button>
//       </form>

//       {error && <p>{error}</p>}
//       {gameStatus === "won" && <p>You've won!</p>}
//       {gameStatus === "lost" && <p>You've lost!</p>}
//     </div>
//   );
// }

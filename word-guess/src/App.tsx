// Word Guess
//
// Read INSTRUCTIONS.md before starting.
//
// TODO 1: Render the 5x5 game board with the required accessible roles.
// TODO 2: Add the Guess input and Submit guess behavior.
// TODO 3: Validate guesses without consuming attempts.
// TODO 4: Score submitted letters as correct, present, or absent.
// TODO 5: Handle duplicate letters correctly.
// TODO 6: Add win and loss behavior.
// TODO 7: Add the attempts counter.
// TODO 8: Add New game reset behavior.
// TODO 9: Make the UI readable and responsive.
// TODO 10: Run required tests, build, and lint before submitting.

import { useState } from "react";

const SECRET_WORD = "SPEND";
const MAX_GUESSES = 5;
const WORD_LENGTH = 5;

export default function App() {
  const [guess, setGuess] = useState<string>("");
  const [guessList, setGuessList] = useState<string[]>([]);

  function handleSubmit() {
    setGuessList([...guessList, guess]);
    setGuess("");
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1>2D Arrays</h1>

      <div>
        {/* row */}
        {Array.from({ length: MAX_GUESSES }).map((_, row) => {
          const word = guessList[row];
          return (
            <div
              key={row}
              style={{
                padding: "10px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {row + 1}
              {/* cells inside each row */}
              {Array.from({ length: WORD_LENGTH }).map((_, rowCell) => {
                const letter = word?.[rowCell] ?? "";
                return (
                  <div
                    style={{
                      border: "1px solid green",
                      height: "50px",
                      width: "50px",
                      textAlign: "center",
                    }}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div>
        <input
          type="text"
          maxLength={5}
          minLength={5}
          value={guess}
          onChange={(e) => setGuess(e.target.value.toUpperCase())}
          style={{
            padding: "5px",
            background: "limegreen",
            border: "1px solid green",
            marginTop: "20px",
          }}
        />

        <button
          onClick={handleSubmit}
          style={{
            padding: "5px",
            background: "green",
            border: "1px solid green",
            marginTop: "20px",
            cursor: "pointer",
          }}
        >
          Guess
        </button>
      </div>
    </div>
  );
}

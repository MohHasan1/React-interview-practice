# Word Guess

## Scenario and time target

You have **75 minutes** to build a simplified Wordle-style game in React and TypeScript. The player enters guesses for a supplied secret word. Each guess appears on a board, with every letter classified as `correct`, `present`, or `absent`. The game ends on a win or when attempts run out. You own the application logic and styling; the starter app intentionally contains none of it.

## Configuration and files

`src/gameConfig.ts` exports exactly `SECRET_WORD = "PLANT"`, `WORD_LENGTH = 5`, and `MAX_ATTEMPTS = 5`. You may import them. The secret is intentionally visible. `src/types.ts` exports the `LetterResult` union type (`"correct" | "present" | "absent"`); it does not score guesses. Implement the application in `src/App.tsx` and style it in `src/App.css` if desired. No backend, API, dictionary, or word list is required. Any alphabetic five-letter guess is valid, even if it is not a dictionary word.

## Rules and examples

A valid guess has **exactly 5 letters**. Comparison is case-insensitive, and submitted guesses must be stored and displayed in uppercase. For example, typing `plant` submits `PLANT` and wins.

Classify each submitted letter:

- `correct`: the letter matches the secret at that position.
- `present`: the letter is in another position of the secret and an unmatched copy is still available.
- `absent`: no unmatched copy of that letter remains in the secret.

Apply proper duplicate-letter accounting: **assign correct-position matches first**, then use only the remaining unmatched secret letters to assign `present`. One secret letter can satisfy only one guessed letter. For `SECRET_WORD = PLANT`, guess `ALLEY` has results `present, correct, absent, absent, absent`: the secret has only one `L`, and the `L` in the correct position uses it. For `PLATE`, the results are `correct, correct, correct, present, absent`.

## Candidate tasks

1. **Game board:** Render exactly `MAX_ATTEMPTS` rows and `WORD_LENGTH` cells in each row: 5 rows and 25 cells with the supplied configuration. Empty cells are visible before any guess. The board is a `grid` named `Game board`; its rows are `row` and cells are `gridcell`.
2. **Guess input:** Add a `textbox` named `Guess`. It accepts alphabetic letters. You may block invalid characters while typing or reject them on submission; invalid guesses must not be submitted. The useful maximum length is 5, but do not silently truncate longer input such that it submits as a valid five-letter guess.
3. **Submit guess:** Add a button named `Submit guess`. A button click or Enter while focused in the Guess input submits. Normalize to uppercase, validate, score, put the guess in the next board row, and clear the input after a successful submission.
4. **Validation:** A guess of any length other than 5, including a longer guess, shows an accessible `alert` containing `Guess must be 5 letters`. A guess with nonalphabetic characters is also invalid and must not be submitted; its exact error text is not tested. Invalid guesses do not consume an attempt or appear on the board. Clear the length error after a later valid submission.
5. **Letter states:** Each submitted cell shows its visible uppercase letter and has `data-state="correct"`, `data-state="present"`, or `data-state="absent"`, according to the rules above. Empty cells do not need `data-state`. You may style these states however you like.
6. **Win:** Submitting `PLANT`, regardless of input case, shows a `status` containing `You won!`. The winning row remains visible. Disable the Guess input and Submit guess button; no further guesses can be added.
7. **Loss:** Five valid guesses that are not `PLANT` show a `status` containing `Game over`, plus visible text `The word was PLANT`. Disable the Guess input and Submit guess button; no further guesses can be added.
8. **Attempt counter:** Show `Attempts: X / 5`, initially `Attempts: 0 / 5`. Increase X by one for each valid submitted guess. Invalid guesses do not increase X.
9. **New game:** Provide a button named `New game`. Clicking it resets guesses, letter states, input, validation error, win/loss state, counter, and board. Return to `Attempts: 0 / 5` with all 25 cells empty. The same secret word may be reused. Guess input and submit button must be enabled again.
10. **Styling:** Create a readable game that remains usable on a narrow/mobile-sized screen. CSS Grid, Flexbox, classes, and inline styles are allowed. No pixel-perfect style, exact color, dimensions, or class names are tested.

## Exact public UI contract

| Area                  | Required public UI contract                                    |
| --------------------- | -------------------------------------------------------------- |
| Board                 | `grid` with accessible name `Game board`                       |
| Board rows            | `row`                                                          |
| Cells                 | `gridcell`                                                     |
| Submitted cell result | `data-state="correct"`, `"present"`, or `"absent"`             |
| Guess input           | `textbox` with accessible name `Guess`                         |
| Submit                | button named `Submit guess`                                    |
| Validation error      | alert containing `Guess must be 5 letters`                     |
| Win state             | status containing `You won!`                                   |
| Loss state            | status containing `Game over` and visible `The word was PLANT` |
| Counter               | visible `Attempts: X / 5`                                      |
| Reset                 | button named `New game`                                        |

An accessible name is what assistive technology announces. An HTML `name`, `id`, or placeholder alone does not guarantee the required accessible name. The required roles, names, `data-state` values, and visible strings above are the complete public testing contract. Tests do not require `data-testid`, custom CSS classes, a particular component tree, or particular React hooks.

## Edge cases

- Lowercase input is accepted and shown as uppercase after submission.
- A short or long guess does not use a board row or an attempt.
- A successful valid guess removes an earlier length error.
- Correct matches take priority over present matches for duplicate letters.
- A completed game cannot accept further guesses; reset restores play.
- Reset also clears an existing validation error.

## Optional bonus work

Bonus checks run separately and do not affect required results. You may add physical keyboard input without focusing the textbox, an on-screen A–Z keyboard, on-screen Enter and Backspace controls, or visual reveal/flip polish. For the optional checks, physical A–Z keys update the Guess textbox even when it is not focused; on-screen letter keys are buttons named by their uppercase letter, and on-screen control buttons are named `Enter` and `Backspace`. `Backspace` removes the last input letter and `Enter` submits. No automated test depends on animation timing. Bonus behavior is described in `src/__tests__/bonus.test.tsx`; it is optional and does not change the required contract.

## Commands

Run these inside `word-guess`:

```bash
npm run dev
npm test
npm run test:bonus
npm run build
npm run lint
```

`npm test` runs the required suite once and exits. `npm run test:bonus` runs only optional tests. Starter behavior tests are expected to fail until you implement the game. The untouched starter must build and lint successfully.

## Submission checklist

- Required game behavior and the exact public UI contract are complete.
- Duplicate letters are scored with limited availability.
- `npm test`, `npm run build`, and `npm run lint` have been run.
- Any remaining failures are reported honestly. Bonus work is optional.

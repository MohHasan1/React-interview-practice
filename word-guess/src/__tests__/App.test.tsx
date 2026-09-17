import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const board = () => screen.getByRole('grid', { name: 'Game board' })
const rows = () => within(board()).getAllByRole('row')
const cells = (index: number) => within(rows()[index]).getAllByRole('gridcell')
const input = () => screen.getByRole('textbox', { name: 'Guess' }) as HTMLInputElement
const submit = () => screen.getByRole('button', { name: 'Submit guess' })
const reset = () => screen.getByRole('button', { name: 'New game' })
const start = () => {
  render(<App />)
  return userEvent.setup()
}
const guess = async (user: ReturnType<typeof userEvent.setup>, word: string) => {
  await user.type(input(), word)
  await user.click(submit())
}
const rowLetters = (index: number) => cells(index).map(cell => cell.textContent?.trim() ?? '').join('')
const rowStates = (index: number) => cells(index).map(cell => cell.getAttribute('data-state'))

it('01 exposes a grid named Game board', () => {
  start()
  expect(board()).toBeInTheDocument()
})

it('02 renders five rows and twenty-five empty cells initially', () => {
  start()
  expect(rows()).toHaveLength(5)
  expect(within(board()).getAllByRole('gridcell')).toHaveLength(25)
  for (let row = 0; row < 5; row++) {
    expect(cells(row)).toHaveLength(5)
    expect(rowLetters(row)).toBe('')
  }
})

it('03 exposes the Guess textbox and Submit guess button', () => {
  start()
  expect(input()).toBeEnabled()
  expect(submit()).toBeEnabled()
})

it('04 starts with zero of five attempts', () => {
  start()
  expect(screen.getByText('Attempts: 0 / 5')).toBeInTheDocument()
})

it('05 submits a valid guess into the first row in uppercase', async () => {
  const user = start()
  await guess(user, 'plate')
  expect(rowLetters(0)).toBe('PLATE')
  expect(rowLetters(1)).toBe('')
})

it('06 clears the input and increases attempts after a valid guess', async () => {
  const user = start()
  await guess(user, 'plate')
  expect(input()).toHaveValue('')
  expect(screen.getByText('Attempts: 1 / 5')).toBeInTheDocument()
})

it('07 accepts Enter from the Guess input as submission', async () => {
  const user = start()
  await user.type(input(), 'plate{enter}')
  expect(rowLetters(0)).toBe('PLATE')
  expect(screen.getByText('Attempts: 1 / 5')).toBeInTheDocument()
})

it('08 rejects a short guess with the specified alert', async () => {
  const user = start()
  await guess(user, 'PLA')
  expect(screen.getByRole('alert')).toHaveTextContent('Guess must be 5 letters')
})

it('09 rejects a long guess with the specified alert', async () => {
  const user = start()
  await guess(user, 'PLANET')
  expect(screen.getByRole('alert')).toHaveTextContent('Guess must be 5 letters')
})

it('10 rejects nonalphabetic guesses', async () => {
  const user = start()
  await guess(user, 'PL4NT')
  expect(rowLetters(0)).toBe('')
  expect(screen.getByText('Attempts: 0 / 5')).toBeInTheDocument()
})

it('11 invalid guesses do not consume an attempt or board row', async () => {
  const user = start()
  await guess(user, 'PLA')
  expect(screen.getByText('Attempts: 0 / 5')).toBeInTheDocument()
  expect(rowLetters(0)).toBe('')
})

it('12 a later valid guess clears the length error', async () => {
  const user = start()
  await guess(user, 'PLA')
  await user.clear(input())
  await guess(user, 'PLATE')
  expect(screen.queryByRole('alert', { name: /Guess must be 5 letters/i })).not.toBeInTheDocument()
  expect(screen.queryByText(/Guess must be 5 letters/)).not.toBeInTheDocument()
  expect(rowLetters(0)).toBe('PLATE')
})

it('13 marks correct-position letters correct', async () => {
  const user = start()
  await guess(user, 'PLATE')
  expect(rowStates(0).slice(0, 3)).toEqual(['correct', 'correct', 'correct'])
})

it('14 marks displaced available letters present', async () => {
  const user = start()
  await guess(user, 'PLATE')
  expect(rowStates(0)[3]).toBe('present')
})

it('15 marks unavailable letters absent', async () => {
  const user = start()
  await guess(user, 'PLATE')
  expect(rowStates(0)[4]).toBe('absent')
})

it('16 limits duplicate matches after assigning correct positions first', async () => {
  const user = start()
  await guess(user, 'ALLEY')
  expect(rowLetters(0)).toBe('ALLEY')
  expect(rowStates(0)).toEqual(['present', 'correct', 'absent', 'absent', 'absent'])
})

it('17 places each valid guess in the next board row', async () => {
  const user = start()
  await guess(user, 'PLATE')
  await guess(user, 'ALLEY')
  expect(rowLetters(0)).toBe('PLATE')
  expect(rowLetters(1)).toBe('ALLEY')
  expect(screen.getByText('Attempts: 2 / 5')).toBeInTheDocument()
})

it('18 winning with lowercase plant shows the win status', async () => {
  const user = start()
  await guess(user, 'plant')
  expect(screen.getByRole('status')).toHaveTextContent('You won!')
})

it('19 a win keeps the winning guess visible', async () => {
  const user = start()
  await guess(user, 'plant')
  expect(rowLetters(0)).toBe('PLANT')
  expect(rowStates(0)).toEqual(Array(5).fill('correct'))
})

it('20 a win disables input and submission', async () => {
  const user = start()
  await guess(user, 'PLANT')
  expect(input()).toBeDisabled()
  expect(submit()).toBeDisabled()
  await user.click(submit())
  expect(screen.getByText('Attempts: 1 / 5')).toBeInTheDocument()
  expect(rowLetters(1)).toBe('')
})

const lose = async (user: ReturnType<typeof userEvent.setup>) => {
  for (let i = 0; i < 5; i++) await guess(user, 'ZZZZZ')
}

it('21 five valid incorrect guesses show Game over and reveal PLANT', async () => {
  const user = start()
  await lose(user)
  expect(screen.getByRole('status')).toHaveTextContent('Game over')
  expect(screen.getByText(/The word was PLANT/)).toBeInTheDocument()
})

it('22 a loss reaches five attempts and fills the five rows', async () => {
  const user = start()
  await lose(user)
  expect(screen.getByText('Attempts: 5 / 5')).toBeInTheDocument()
  for (let row = 0; row < 5; row++) expect(rowLetters(row)).toBe('ZZZZZ')
})

it('23 a loss disables input and submission, blocking another guess', async () => {
  const user = start()
  await lose(user)
  expect(input()).toBeDisabled()
  expect(submit()).toBeDisabled()
  await user.click(submit())
  expect(screen.getByText('Attempts: 5 / 5')).toBeInTheDocument()
})

it('24 exposes a New game button', () => {
  start()
  expect(reset()).toBeInTheDocument()
})

it('25 New game clears submitted letters and letter states', async () => {
  const user = start()
  await guess(user, 'PLATE')
  await user.click(reset())
  expect(within(board()).getAllByRole('gridcell')).toHaveLength(25)
  for (let row = 0; row < 5; row++) {
    expect(rowLetters(row)).toBe('')
    expect(rowStates(row)).toEqual(Array(5).fill(null))
  }
})

it('26 New game resets attempts, input, and validation error', async () => {
  const user = start()
  await guess(user, 'PLATE')
  await user.type(input(), 'PL')
  await user.click(submit())
  expect(screen.getByRole('alert')).toHaveTextContent('Guess must be 5 letters')
  await user.click(reset())
  expect(screen.getByText('Attempts: 0 / 5')).toBeInTheDocument()
  expect(input()).toHaveValue('')
  expect(screen.queryByText(/Guess must be 5 letters/)).not.toBeInTheDocument()
})

it('27 New game clears the win and re-enables controls', async () => {
  const user = start()
  await guess(user, 'PLANT')
  await user.click(reset())
  expect(screen.queryByText('You won!')).not.toBeInTheDocument()
  expect(input()).toBeEnabled()
  expect(submit()).toBeEnabled()
  expect(screen.getByText('Attempts: 0 / 5')).toBeInTheDocument()
})

it('28 New game clears the loss and re-enables controls', async () => {
  const user = start()
  await lose(user)
  await user.click(reset())
  expect(screen.queryByText('Game over')).not.toBeInTheDocument()
  expect(screen.queryByText(/The word was PLANT/)).not.toBeInTheDocument()
  expect(input()).toBeEnabled()
  expect(submit()).toBeEnabled()
  expect(screen.getByText('Attempts: 0 / 5')).toBeInTheDocument()
})

import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const input = () => screen.getByRole('textbox', { name: 'Guess' })
const board = () => screen.getByRole('grid', { name: 'Game board' })
const firstRow = () => within(board()).getAllByRole('row')[0]
const firstGuess = () => within(firstRow()).getAllByRole('gridcell').map(cell => cell.textContent?.trim() ?? '').join('')

it('bonus: physical alphabetic keys work without focusing Guess', async () => {
  render(<App />)
  const user = userEvent.setup()
  await user.keyboard('PLATE')
  expect(input()).toHaveValue('PLATE')
})

it('bonus: an on-screen A-Z keyboard enters letters', async () => {
  render(<App />)
  const user = userEvent.setup()
  for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    expect(screen.getByRole('button', { name: new RegExp(`^${letter}$`) })).toBeInTheDocument()
  }
  for (const letter of 'PLATE') {
    await user.click(screen.getByRole('button', { name: new RegExp(`^${letter}$`) }))
  }
  expect(input()).toHaveValue('PLATE')
})

it('bonus: on-screen Backspace edits and Enter submits', async () => {
  render(<App />)
  const user = userEvent.setup()
  for (const letter of 'PLATZ') {
    await user.click(screen.getByRole('button', { name: new RegExp(`^${letter}$`) }))
  }
  await user.click(screen.getByRole('button', { name: 'Backspace' }))
  expect(input()).toHaveValue('PLAT')
  await user.click(screen.getByRole('button', { name: /^E$/ }))
  await user.click(screen.getByRole('button', { name: 'Enter' }))
  expect(firstGuess()).toBe('PLATE')
})

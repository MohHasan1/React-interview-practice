import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { mockApi } from '../api'

beforeEach(() => mockApi.reset())
afterEach(() => { cleanup(); vi.restoreAllMocks() })

const ready = async () => {
  render(<App />)
  await screen.findByRole('table', { name: 'Transactions' })
  await waitFor(() => expect(within(table()).getByRole('row', { name: /Freshii/i })).toBeInTheDocument())
}
const table = () => screen.getByRole('table', { name: 'Transactions' })
const rowFor = (name: string) => within(table()).getByRole('row', { name: new RegExp(name, 'i') })

it('bonus: debounces search results by about 300ms', async () => {
  await ready()
  await userEvent.type(screen.getByRole('searchbox', { name: 'Search transactions' }), 'Figma')
  expect(rowFor('Freshii')).toBeInTheDocument()
  await waitFor(() => expect(rowFor('Figma')).toBeInTheDocument(), { timeout: 1200 })
  expect(within(table()).queryByRole('row', { name: /Freshii/i })).not.toBeInTheDocument()
})

it('bonus: optimistic approval appears immediately and rolls back on PATCH failure', async () => {
  await ready()
  await userEvent.type(screen.getByRole('searchbox', { name: 'Search transactions' }), 'Figma')
  await waitFor(() => expect(rowFor('Figma')).toBeInTheDocument())
  mockApi.setDelay(500)
  mockApi.failNextPatch()
  await userEvent.click(within(rowFor('Figma')).getByRole('button', { name: 'Approve Figma' }))
  expect(rowFor('Figma')).toHaveTextContent(/approved/i)
  expect(await screen.findByRole('alert')).toHaveTextContent(/Unable to update transaction/i)
  expect(rowFor('Figma')).toHaveTextContent(/pending/i)
})

it('bonus: shows the visible count out of the filtered result count', async () => {
  await ready()
  expect(screen.getByText(/Showing\s*3\s*of\s*7\s*transactions/i)).toBeInTheDocument()
  await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Category' }), 'Travel')
  await waitFor(() => expect(screen.getByText(/Showing\s*2\s*of\s*2\s*transactions/i)).toBeInTheDocument())
})

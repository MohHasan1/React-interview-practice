import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import * as api from '../api'

beforeEach(() => api.mockApi.reset())
afterEach(() => { cleanup(); vi.restoreAllMocks() })

const allMerchants = ['Figma', 'Air Canada', 'Uber', 'Notion', 'Freshii', 'Staples', 'GitHub']
const table = () => screen.getByRole('table', { name: 'Transactions' })
const rows = () => within(table()).queryAllByRole('row').filter((row) => within(row).queryAllByRole('cell').length > 0)
const merchants = () => rows().map((row) => allMerchants.find((name) => row.textContent?.includes(name)))
const rowFor = (name: string) => within(table()).getByRole('row', { name: new RegExp(name, 'i') })
const search = () => screen.getByRole('searchbox', { name: 'Search transactions' })
const status = () => screen.getByRole('combobox', { name: 'Status' })
const category = () => screen.getByRole('combobox', { name: 'Category' })
const sort = () => screen.getByRole('combobox', { name: 'Sort' })
const summary = () => screen.getByRole('region', { name: 'Summary' })
const pagination = () => screen.getByRole('navigation', { name: 'Pagination' })
const next = () => within(pagination()).getByRole('button', { name: 'Next' })
const previous = () => within(pagination()).getByRole('button', { name: 'Previous' })
const ready = async () => {
  render(<App />)
  await screen.findByRole('table', { name: 'Transactions' })
  await waitFor(() => expect(rows().some((row) => allMerchants.some((name) => row.textContent?.includes(name)))).toBe(true))
}
const findMerchant = async (name: string) => {
  await userEvent.type(search(), name)
  await waitFor(() => expect(rowFor(name)).toBeInTheDocument())
}

it('01 shows Loading during the initial GET', async () => {
  api.mockApi.setDelay(300)
  render(<App />)
  expect(screen.getByText(/Loading/i)).toBeInTheDocument()
  await screen.findByRole('table', { name: 'Transactions' })
  await waitFor(() => expect(rows().some((row) => allMerchants.some((name) => row.textContent?.includes(name)))).toBe(true))
})

it('02 renders transactions after GET succeeds', async () => {
  await ready()
  expect(rowFor('Freshii')).toBeInTheDocument()
  expect(rowFor('Uber')).toBeInTheDocument()
})

it('03 gives the semantic transaction table its required name', async () => {
  await ready()
  expect(table()).toBeInTheDocument()
})

it('04 shows every required field for Figma', async () => {
  await ready()
  await findMerchant('Figma')
  const row = rowFor('Figma')
  expect(row).toHaveTextContent('Maya Chen')
  expect(row).toHaveTextContent('Software')
  expect(row).toHaveTextContent('$120.00')
  expect(row).toHaveTextContent(/2026/)
  expect(row).toHaveTextContent(/pending/i)
})

it('05 displays whole-dollar amounts with two decimals', async () => {
  await ready()
  await findMerchant('Figma')
  expect(rowFor('Figma')).toHaveTextContent('$120.00')
})

it('06 displays fractional-dollar amounts with two decimals', async () => {
  await ready()
  expect(rowFor('Uber')).toHaveTextContent('$45.50')
})

it('07 searches by merchant', async () => {
  await ready()
  await findMerchant('Figma')
  await waitFor(() => expect(rows()).toHaveLength(1))
})

it('08 searches by employee', async () => {
  await ready()
  await userEvent.type(search(), 'Maya Chen')
  await waitFor(() => expect(merchants()).toEqual(['Freshii', 'Figma']))
})

it('09 searches without case sensitivity', async () => {
  await ready()
  await userEvent.type(search(), 'fIgMa')
  await waitFor(() => expect(merchants()).toEqual(['Figma']))
})

it('10 All status includes different statuses', async () => {
  await ready()
  await userEvent.selectOptions(status(), 'all')
  expect(rowFor('Freshii')).toHaveTextContent(/approved/i)
  expect(rowFor('Uber')).toHaveTextContent(/pending/i)
})

it('11 Pending status shows pending transactions only', async () => {
  await ready()
  await userEvent.selectOptions(status(), 'pending')
  await waitFor(() => expect(merchants()).toEqual(['Uber', 'Staples', 'Figma']))
})

it('12 Approved status shows approved transactions only', async () => {
  await ready()
  await userEvent.selectOptions(status(), 'approved')
  await waitFor(() => expect(merchants()).toEqual(['Freshii', 'Air Canada', 'GitHub']))
})

it('13 Declined status shows declined transactions only', async () => {
  await ready()
  await userEvent.selectOptions(status(), 'declined')
  await waitFor(() => expect(merchants()).toEqual(['Notion']))
})

it('14 category filter limits visible transactions', async () => {
  await ready()
  await userEvent.selectOptions(category(), 'Travel')
  await waitFor(() => expect(merchants()).toEqual(['Uber', 'Air Canada']))
})

it('15 search, status, and category work together', async () => {
  await ready()
  await userEvent.type(search(), 'Maya')
  await userEvent.selectOptions(status(), 'pending')
  await userEvent.selectOptions(category(), 'Software')
  await waitFor(() => expect(merchants()).toEqual(['Figma']))
})

it('16 sorts newest date first by default', async () => {
  await ready()
  expect(sort()).toHaveValue('date-desc')
  expect(merchants()).toEqual(['Freshii', 'Uber', 'Staples'])
})

it('17 sorts highest amount first', async () => {
  await ready()
  await userEvent.selectOptions(sort(), 'amount-desc')
  await waitFor(() => expect(merchants()).toEqual(['Air Canada', 'GitHub', 'Staples']))
})

it('18 sorts lowest amount first', async () => {
  await ready()
  await userEvent.selectOptions(sort(), 'amount-asc')
  await waitFor(() => expect(merchants()).toEqual(['Freshii', 'Uber', 'Notion']))
})

it('19 sorts merchant names A-Z', async () => {
  await ready()
  await userEvent.selectOptions(sort(), 'merchant-asc')
  await waitFor(() => expect(merchants()).toEqual(['Air Canada', 'Figma', 'Freshii']))
})

it('sort order applies to the filtered result', async () => {
  await ready()
  await userEvent.selectOptions(category(), 'Software')
  await userEvent.selectOptions(sort(), 'amount-desc')
  await waitFor(() => expect(merchants()).toEqual(['GitHub', 'Figma', 'Notion']))
})

it('20 shows exactly three data rows on the first page', async () => {
  await ready()
  expect(rows()).toHaveLength(3)
  expect(merchants()).toEqual(['Freshii', 'Uber', 'Staples'])
  expect(pagination()).toHaveTextContent(/Page\s*1\s*of\s*3/i)
})

it('21 Next moves to page two', async () => {
  await ready()
  await userEvent.click(next())
  await waitFor(() => expect(merchants()).toEqual(['Air Canada', 'Notion', 'Figma']))
  expect(pagination()).toHaveTextContent(/Page\s*2\s*of\s*3/i)
})

it('22 Previous returns to page one and is disabled there', async () => {
  await ready()
  expect(previous()).toBeDisabled()
  await userEvent.click(next())
  await userEvent.click(previous())
  await waitFor(() => expect(merchants()).toEqual(['Freshii', 'Uber', 'Staples']))
  expect(previous()).toBeDisabled()
})

it('23 Next is disabled on the final page', async () => {
  await ready()
  await userEvent.click(next())
  await userEvent.click(next())
  await waitFor(() => expect(merchants()).toEqual(['GitHub']))
  expect(next()).toBeDisabled()
  expect(pagination()).toHaveTextContent(/Page\s*3\s*of\s*3/i)
})

it('24 changing search resets pagination to page one', async () => {
  await ready()
  await userEvent.click(next())
  await userEvent.type(search(), 'Maya')
  await waitFor(() => expect(merchants()).toEqual(['Freshii', 'Figma']))
  expect(pagination()).toHaveTextContent(/Page\s*1\s*of\s*1/i)
})

it('25 changing status resets pagination to page one', async () => {
  await ready()
  await userEvent.click(next())
  await userEvent.selectOptions(status(), 'pending')
  await waitFor(() => expect(merchants()).toEqual(['Uber', 'Staples', 'Figma']))
  expect(pagination()).toHaveTextContent(/Page\s*1\s*of\s*1/i)
})

it('26 changing category resets pagination to page one', async () => {
  await ready()
  await userEvent.click(next())
  await userEvent.selectOptions(category(), 'Travel')
  await waitFor(() => expect(merchants()).toEqual(['Uber', 'Air Canada']))
  expect(pagination()).toHaveTextContent(/Page\s*1\s*of\s*1/i)
})

it('27 pending transactions expose Approve and Decline actions', async () => {
  await ready()
  const row = rowFor('Uber')
  expect(within(row).getByRole('button', { name: 'Approve Uber' })).toBeInTheDocument()
  expect(within(row).getByRole('button', { name: 'Decline Uber' })).toBeInTheDocument()
})

it('28 approved and declined transactions expose no decision actions', async () => {
  await ready()
  expect(within(rowFor('Freshii')).queryByRole('button', { name: /Approve|Decline/i })).not.toBeInTheDocument()
  await findMerchant('Notion')
  expect(within(rowFor('Notion')).queryByRole('button', { name: /Approve|Decline/i })).not.toBeInTheDocument()
})

it('29 approval sends the correct PATCH and updates the visible status', async () => {
  const patch = vi.spyOn(api, 'patchTransaction')
  await ready()
  await findMerchant('Figma')
  await userEvent.click(within(rowFor('Figma')).getByRole('button', { name: 'Approve Figma' }))
  await waitFor(() => expect(patch).toHaveBeenCalledWith('tx-1', { status: 'approved' }))
  await patch.mock.results[0].value
  await waitFor(() => expect(rowFor('Figma')).toHaveTextContent(/approved/i))
})

it('30 decline sends the correct PATCH and updates the visible status', async () => {
  const patch = vi.spyOn(api, 'patchTransaction')
  await ready()
  await userEvent.click(within(rowFor('Uber')).getByRole('button', { name: 'Decline Uber' }))
  await waitFor(() => expect(patch).toHaveBeenCalledWith('tx-3', { status: 'declined' }))
  await patch.mock.results[0].value
  await waitFor(() => expect(rowFor('Uber')).toHaveTextContent(/declined/i))
})

it('31 failed PATCH shows an alert and keeps the pending row visible', async () => {
  api.mockApi.failNextPatch()
  await ready()
  await findMerchant('Figma')
  await userEvent.click(within(rowFor('Figma')).getByRole('button', { name: 'Approve Figma' }))
  expect(await screen.findByRole('alert')).toHaveTextContent(/Unable to update transaction/i)
  expect(rowFor('Figma')).toHaveTextContent(/pending/i)
})

it('32 summary shows initial total and pending counts', async () => {
  await ready()
  expect(summary()).toHaveTextContent(/Total transactions\s*:?[\s\S]*7/i)
  expect(summary()).toHaveTextContent(/Pending transactions\s*:?[\s\S]*3/i)
})

it('33 summary shows initial total and pending spend', async () => {
  await ready()
  expect(summary()).toHaveTextContent(/Total spend\s*:?[\s\S]*\$1,530\.25/i)
  expect(summary()).toHaveTextContent(/Pending spend\s*:?[\s\S]*\$375\.50/i)
})

it('34 summary is unchanged by search, filters, sorting, and page', async () => {
  await ready()
  await userEvent.selectOptions(sort(), 'merchant-asc')
  await userEvent.click(next())
  await userEvent.type(search(), 'Maya')
  await userEvent.selectOptions(status(), 'approved')
  await userEvent.selectOptions(category(), 'Meals')
  expect(summary()).toHaveTextContent(/Total transactions\s*:?[\s\S]*7/i)
  expect(summary()).toHaveTextContent(/Pending transactions\s*:?[\s\S]*3/i)
  expect(summary()).toHaveTextContent(/\$1,530\.25/)
  expect(summary()).toHaveTextContent(/\$375\.50/)
})

it('35 successful approval updates pending summary values', async () => {
  const patch = vi.spyOn(api, 'patchTransaction')
  await ready()
  await findMerchant('Figma')
  await userEvent.click(within(rowFor('Figma')).getByRole('button', { name: 'Approve Figma' }))
  await waitFor(() => expect(patch).toHaveBeenCalledTimes(1))
  await patch.mock.results[0].value
  await waitFor(() => expect(summary()).toHaveTextContent(/Pending transactions\s*:?[\s\S]*2/i))
  await waitFor(() => expect(summary()).toHaveTextContent(/Pending spend\s*:?[\s\S]*\$255\.50/i))
  expect(summary()).toHaveTextContent(/Total transactions\s*:?[\s\S]*7/i)
  expect(summary()).toHaveTextContent(/\$1,530\.25/)
})

it('36 empty successful GET shows No transactions', async () => {
  api.mockApi.setTransactions([])
  render(<App />)
  expect(await screen.findByText('No transactions')).toBeInTheDocument()
  expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/Page\s*1\s*of\s*0/i)).not.toBeInTheDocument()
})

it('37 unmatched search shows No matching transactions safely', async () => {
  await ready()
  await userEvent.type(search(), 'no-such-merchant')
  expect(await screen.findByText('No matching transactions')).toBeInTheDocument()
  expect(screen.queryByText(/Page\s*1\s*of\s*0/i)).not.toBeInTheDocument()
})

it('38 initial GET failure shows its alert and Retry', async () => {
  api.mockApi.failNextGet()
  render(<App />)
  expect(await screen.findByRole('alert')).toHaveTextContent(/Unable to load transactions/i)
  expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
})

it('39 Retry makes another GET and renders transactions', async () => {
  api.mockApi.failNextGet()
  const get = vi.spyOn(api, 'getTransactions')
  render(<App />)
  await screen.findByRole('alert')
  await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
  await screen.findByRole('table', { name: 'Transactions' })
  await waitFor(() => expect(get).toHaveBeenCalledTimes(2))
  await waitFor(() => expect(rowFor('Freshii')).toBeInTheDocument())
})

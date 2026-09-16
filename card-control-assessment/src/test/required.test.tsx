import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import * as api from '../api'

beforeEach(() => api.mockApi.reset())
afterEach(() => { cleanup(); vi.restoreAllMocks() })

const start = () => render(<App />)
const loaded = async () => { start(); await screen.findByText('Marketing') }
const search = () => screen.getByRole('searchbox', { name: /search/i })
const statusFilter = () => screen.getByRole('combobox', { name: /status/i })
const summary = () => screen.getByRole('region', { name: /summary/i })
const card = (name: string) => screen.getByRole('article', { name: new RegExp(name, 'i') })
const currency = (value: number) => new RegExp(`\\$\\s*${value.toLocaleString('en-US')}(?:\\.00)?(?:\\D|$)`)

it('01 shows loading while GET is pending', async () => {
  api.mockApi.setDelay(300)
  start()
  expect(screen.getByText(/loading/i)).toBeInTheDocument()
  await screen.findByText('Marketing')
})

it('02 renders cards after GET succeeds', async () => {
  await loaded()
  for (const name of ['Engineering', 'Travel', 'Recruiting']) expect(screen.getByText(name)).toBeInTheDocument()
})

it('03 exposes the required data for each card', async () => {
  await loaded()
  const expectations = [
    ['Marketing', 'Maya Chen', '4821', 5000, 3250, 1750, 'active'],
    ['Engineering', 'Noah Williams', '1934', 8000, 7900, 100, 'active'],
    ['Travel', 'Ava Patel', '7612', 3000, 1200, 1800, 'frozen'],
    ['Recruiting', 'Liam Garcia', '5508', 4000, 950, 3050, 'active'],
  ] as const
  for (const [name, holder, last4, limit, spent, remaining, status] of expectations) {
    const item = card(name)
    expect(within(item).getByText(name)).toBeInTheDocument()
    expect(within(item).getByText(holder)).toBeInTheDocument()
    expect(item).toHaveTextContent(last4)
    for (const amount of [limit, spent, remaining]) expect(item).toHaveTextContent(currency(amount))
    expect(item).toHaveTextContent(new RegExp(status, 'i'))
  }
})

it('04 presents dollar amounts readably', async () => {
  await loaded()
  expect(card('Marketing')).toHaveTextContent(currency(5000))
  expect(card('Marketing')).toHaveTextContent(currency(3250))
})

it('05 searches by card name', async () => {
  await loaded()
  await userEvent.type(search(), 'Marketing')
  expect(card('Marketing')).toBeInTheDocument()
  expect(screen.queryByRole('article', { name: /Engineering/i })).not.toBeInTheDocument()
})

it('06 searches by holder name', async () => {
  await loaded()
  await userEvent.type(search(), 'Ava Patel')
  expect(card('Travel')).toBeInTheDocument()
  expect(screen.queryByRole('article', { name: /Marketing/i })).not.toBeInTheDocument()
})

it('07 searches by last four digits', async () => {
  await loaded()
  await userEvent.type(search(), '1934')
  expect(card('Engineering')).toBeInTheDocument()
  expect(screen.queryByRole('article', { name: /Travel/i })).not.toBeInTheDocument()
})

it('08 search is case-insensitive', async () => {
  await loaded()
  await userEvent.type(search(), 'mArKeTiNg')
  expect(card('Marketing')).toBeInTheDocument()
})

it('09 All filter includes active and frozen cards', async () => {
  await loaded()
  await userEvent.selectOptions(statusFilter(), 'all')
  expect(card('Marketing')).toBeInTheDocument()
  expect(card('Travel')).toBeInTheDocument()
})

it('10 Active filter shows only active cards', async () => {
  await loaded()
  await userEvent.selectOptions(statusFilter(), 'active')
  expect(card('Marketing')).toBeInTheDocument()
  expect(screen.queryByRole('article', { name: /Travel/i })).not.toBeInTheDocument()
})

it('11 Frozen filter shows only frozen cards', async () => {
  await loaded()
  await userEvent.selectOptions(statusFilter(), 'frozen')
  expect(card('Travel')).toBeInTheDocument()
  expect(screen.queryByRole('article', { name: /Marketing/i })).not.toBeInTheDocument()
})

it('12 search and status filter work together', async () => {
  await loaded()
  await userEvent.type(search(), 'Maya')
  await userEvent.selectOptions(statusFilter(), 'frozen')
  expect(screen.queryByRole('article', { name: /Marketing/i })).not.toBeInTheDocument()
  expect(screen.getByText(/no (matching )?(cards|results)/i)).toBeInTheDocument()
})

it('13 freezes an active card', async () => {
  await loaded()
  await userEvent.click(screen.getByRole('button', { name: /freeze marketing/i }))
  await waitFor(() => expect(card('Marketing')).toHaveTextContent(/frozen/i))
})

it('14 unfreezes a frozen card', async () => {
  await loaded()
  await userEvent.click(screen.getByRole('button', { name: /unfreeze travel/i }))
  await waitFor(() => expect(card('Travel')).toHaveTextContent(/active/i))
})

it('15 PATCH receives the selected card id and status', async () => {
  const patch = vi.spyOn(api, 'patchCard')
  await loaded()
  await userEvent.click(screen.getByRole('button', { name: /freeze marketing/i }))
  await waitFor(() => expect(patch).toHaveBeenCalledWith('card-1', { status: 'frozen' }))
  await waitFor(() => expect(card('Marketing')).toHaveTextContent(/frozen/i))
})

it('16 failed PATCH leaves the actual status unchanged', async () => {
  api.mockApi.failNextPatch()
  await loaded()
  await userEvent.click(screen.getByRole('button', { name: /freeze marketing/i }))
  await screen.findByRole('alert')
  expect(card('Marketing')).toHaveTextContent(/active/i)
})

it('17 failed PATCH shows an error', async () => {
  api.mockApi.failNextPatch('Unable to update card')
  await loaded()
  await userEvent.click(screen.getByRole('button', { name: /freeze marketing/i }))
  expect(await screen.findByRole('alert')).toHaveTextContent(/unable to update/i)
})

it('18 summary includes correct all-card totals', async () => {
  await loaded()
  expect(summary()).toHaveTextContent(/total cards\s*:?[\s\S]*4/i)
  expect(summary()).toHaveTextContent(/active cards\s*:?[\s\S]*3/i)
  expect(summary()).toHaveTextContent(/total monthly limit\s*:?[\s\S]*\$\s*20,000/i)
  expect(summary()).toHaveTextContent(/total spent\s*:?[\s\S]*\$\s*13,300/i)
})

it('19 summary does not change when search or filter changes', async () => {
  await loaded()
  await userEvent.type(search(), 'Travel')
  await userEvent.selectOptions(statusFilter(), 'frozen')
  expect(summary()).toHaveTextContent(/total cards\s*:?[\s\S]*4/i)
  expect(summary()).toHaveTextContent(/active cards\s*:?[\s\S]*3/i)
  expect(summary()).toHaveTextContent(/\$\s*20,000/)
  expect(summary()).toHaveTextContent(/\$\s*13,300/)
})

it('20 calculates utilization percentage', async () => {
  await loaded()
  expect(card('Marketing')).toHaveTextContent(/65\s*%/)
})

it('21 marks a card at its limit as Limit reached', async () => {
  api.mockApi.setCards([{ id: 'limit', name: 'At Limit', holder: 'Sam Lee', last4: '0001', monthlyLimit: 100, spent: 100, status: 'active' }])
  start()
  expect(await screen.findByRole('article', { name: /At Limit/i })).toHaveTextContent('Limit reached')
})

it('22 zero monthly limit avoids NaN and Infinity', async () => {
  api.mockApi.setCards([{ id: 'zero', name: 'Zero Limit', holder: 'Sam Lee', last4: '0002', monthlyLimit: 0, spent: 0, status: 'active' }])
  start()
  await screen.findByRole('article', { name: /Zero Limit/i })
  expect(document.body).not.toHaveTextContent(/NaN|Infinity/)
})

it('23 empty GET response shows an empty state', async () => {
  api.mockApi.setCards([])
  start()
  expect(await screen.findByText(/no cards/i)).toBeInTheDocument()
})

it('24 no matching search results show an empty state', async () => {
  await loaded()
  await userEvent.type(search(), 'no-such-card')
  expect(screen.getByText(/no (matching )?(cards|results)/i)).toBeInTheDocument()
})

it('25 initial GET failure exposes an error', async () => {
  api.mockApi.failNextGet('Unable to load cards')
  start()
  expect(await screen.findByRole('alert')).toHaveTextContent(/unable to load/i)
})

it('26 Retry performs another GET after initial failure', async () => {
  api.mockApi.failNextGet('Unable to load cards')
  const get = vi.spyOn(api, 'getCards')
  start()
  expect(await screen.findByRole('alert')).toHaveTextContent(/unable to load/i)
  await userEvent.click(screen.getByRole('button', { name: /retry/i }))
  await screen.findByText('Marketing')
  expect(get).toHaveBeenCalledTimes(2)
})

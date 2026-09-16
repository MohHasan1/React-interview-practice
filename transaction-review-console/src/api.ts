export type TransactionStatus = 'pending' | 'approved' | 'declined'

export type TransactionCategory = 'Software' | 'Travel' | 'Meals' | 'Office'

export type Transaction = {
  id: string
  merchant: string
  employee: string
  amount: number
  category: TransactionCategory
  status: TransactionStatus
  date: string
}

const initialTransactions: Transaction[] = [
  { id: 'tx-1', merchant: 'Figma', employee: 'Maya Chen', amount: 120, category: 'Software', status: 'pending', date: '2026-09-10' },
  { id: 'tx-2', merchant: 'Air Canada', employee: 'Noah Williams', amount: 780, category: 'Travel', status: 'approved', date: '2026-09-12' },
  { id: 'tx-3', merchant: 'Uber', employee: 'Ava Patel', amount: 45.5, category: 'Travel', status: 'pending', date: '2026-09-14' },
  { id: 'tx-4', merchant: 'Notion', employee: 'Liam Garcia', amount: 96, category: 'Software', status: 'declined', date: '2026-09-11' },
  { id: 'tx-5', merchant: 'Freshii', employee: 'Maya Chen', amount: 28.75, category: 'Meals', status: 'approved', date: '2026-09-15' },
  { id: 'tx-6', merchant: 'Staples', employee: 'Zoe Martin', amount: 210, category: 'Office', status: 'pending', date: '2026-09-13' },
  { id: 'tx-7', merchant: 'GitHub', employee: 'Noah Williams', amount: 250, category: 'Software', status: 'approved', date: '2026-09-09' },
]

const copy = (transaction: Transaction): Transaction => ({ ...transaction })
let transactions = initialTransactions.map(copy)
let delayMs = 50
let nextGetError: Error | null = null
let nextPatchError: Error | null = null
const delay = () => new Promise<void>((resolve) => setTimeout(resolve, delayMs))

// Application API: conceptually GET /api/transactions.
export async function getTransactions(): Promise<Transaction[]> {
  await delay()
  if (nextGetError) {
    const error = nextGetError
    nextGetError = null
    throw error
  }
  return transactions.map(copy)
}

// Application API: conceptually PATCH /api/transactions/:id.
export async function patchTransaction(
  id: string,
  body: { status: 'approved' | 'declined' },
): Promise<Transaction> {
  await delay()
  if (nextPatchError) {
    const error = nextPatchError
    nextPatchError = null
    throw error
  }
  const index = transactions.findIndex((transaction) => transaction.id === id)
  if (index < 0) throw new Error('Transaction not found')
  transactions[index] = { ...transactions[index], status: body.status }
  return copy(transactions[index])
}

// Test controls only. Candidate application code should not use mockApi.
export const mockApi = {
  reset() {
    transactions = initialTransactions.map(copy)
    delayMs = 50
    nextGetError = null
    nextPatchError = null
  },
  setTransactions(value: Transaction[]) { transactions = value.map(copy) },
  setDelay(value: number) { delayMs = value },
  failNextGet(message = 'Unable to load transactions') { nextGetError = new Error(message) },
  failNextPatch(message = 'Unable to update transaction') { nextPatchError = new Error(message) },
}

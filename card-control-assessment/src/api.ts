export type Card = {
  id: string
  name: string
  holder: string
  last4: string
  monthlyLimit: number
  spent: number
  status: 'active' | 'frozen'
}

const initialCards: Card[] = [
  { id: 'card-1', name: 'Marketing', holder: 'Maya Chen', last4: '4821', monthlyLimit: 5000, spent: 3250, status: 'active' },
  { id: 'card-2', name: 'Engineering', holder: 'Noah Williams', last4: '1934', monthlyLimit: 8000, spent: 7900, status: 'active' },
  { id: 'card-3', name: 'Travel', holder: 'Ava Patel', last4: '7612', monthlyLimit: 3000, spent: 1200, status: 'frozen' },
  { id: 'card-4', name: 'Recruiting', holder: 'Liam Garcia', last4: '5508', monthlyLimit: 4000, spent: 950, status: 'active' },
]

let cards = initialCards.map((card) => ({ ...card }))
let delayMs = 50
let nextGetError: Error | null = null
let nextPatchError: Error | null = null

const delay = () => new Promise<void>((resolve) => setTimeout(resolve, delayMs))

// App API: GET /api/cards
export async function getCards(): Promise<Card[]> {
  await delay()
  if (nextGetError) {
    const error = nextGetError
    nextGetError = null
    throw error
  }
  return cards.map((card) => ({ ...card }))
}

// App API: PATCH /api/cards/:id with { status }
export async function patchCard(id: string, body: { status: Card['status'] }): Promise<Card> {
  await delay()
  if (nextPatchError) {
    const error = nextPatchError
    nextPatchError = null
    throw error
  }
  const index = cards.findIndex((card) => card.id === id)
  if (index < 0) throw new Error('Card not found')
  cards[index] = { ...cards[index], status: body.status }
  return { ...cards[index] }
}

// Test controls; the application should use getCards and patchCard only.
export const mockApi = {
  reset() {
    cards = initialCards.map((card) => ({ ...card }))
    delayMs = 50
    nextGetError = null
    nextPatchError = null
  },
  setCards(value: Card[]) { cards = value.map((card) => ({ ...card })) },
  setDelay(value: number) { delayMs = value },
  failNextGet(message = 'Unable to load cards') { nextGetError = new Error(message) },
  failNextPatch(message = 'Unable to update card') { nextPatchError = new Error(message) },
}

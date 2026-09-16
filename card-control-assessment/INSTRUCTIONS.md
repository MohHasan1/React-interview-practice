# Card Control Dashboard

Build a React dashboard for managing company cards. Write your application in `src/App.tsx` and any additional files you choose to create. The checklist at the top of `App.tsx` follows the five tasks below.

## What the app should do

1. Load cards from the asynchronous mock API. Show a loading state while the request is pending and a useful error with a Retry action if it fails.
2. Display each card's name, holder, last four digits, monthly limit, amount spent, amount remaining, status, and utilization percentage. Format money as dollars.
3. Let users search cards by name, holder, or last four digits. Add a status filter with All, Active, and Frozen choices. Search and filtering should work together, with a clear empty state when nothing matches.
4. Let users freeze active cards and unfreeze frozen cards. Send changes through the mock API, and show an error if an update fails.
5. Show a dashboard summary with total cards, active cards, total monthly limit, and total spent. The summary represents all cards, even when the visible list is filtered.

## What to show on screen

This is the public UI contract used by the tests. These are **exact words and accessibility roles the tests look for**; you can choose the layout and styling.

| Area | Visible content and accessible name |
| --- | --- |
| Loading | Text containing **Loading** while the first request is pending. |
| Cards | One element with accessible role **`article`** per card; its accessible name must include the card name. The card name and holder name must each appear as their own exact visible text (for example, **Marketing** and **Maya Chen**). Show the last four digits, monthly limit, spent, remaining, status, and utilization percentage inside the article. |
| Search | An input with accessible role **`searchbox`** and accessible name **Search**. Searching by card name, holder, or last four digits is case-insensitive. |
| Status filter | A select with accessible role **`combobox`** and accessible name **Status**. Its option values must be `all`, `active`, and `frozen`. |
| Card actions | A button whose accessible name includes the action and card name, such as **Freeze Marketing** or **Unfreeze Travel**. |
| Summary | An element with accessible role **`region`** and accessible name **Summary**. Inside it, show **Total cards**, **Active cards**, **Total monthly limit**, and **Total spent** with their values. Search and filtering must not change these all-card totals. |
| Errors | Put the visible error message in an element with accessible role **`alert`**. A load error message must include **Unable to load** and provide a button named **Retry**. An update error message must include **Unable to update**. |
| Empty states | Show **No cards** when the API returns an empty list, and **No matching cards** or **No matching results** when search/filtering finds none. |

For example, the Marketing card should show Maya Chen, 4821, $5,000 limit, $3,250 spent, $1,750 remaining, Active, and 65% utilization. Dollar amounts should include commas where needed. With the initial dataset, the summary shows 4 total cards, 3 active cards, $20,000 total monthly limit, and $13,300 total spent.

When a status update fails, show the update alert and leave the card's actual status unchanged. When loading fails, **Retry** must make another load request. Display **Limit reached** for a card at or above its limit. A zero monthly limit must not display `NaN` or `Infinity`.

## Mock API

`src/api.ts` exports the `Card` type and two asynchronous functions:

| Operation | Function |
| --- | --- |
| GET `/api/cards` | `getCards()` |
| PATCH `/api/cards/:id` with `{ status }` | `patchCard(id, { status })` |

No backend server is needed. The file also includes controls used by the tests to simulate different API responses. Your application should use the two functions above.

## Commands

From this project folder:

```bash
npm run dev
npm test
npm run build
npm run lint
```

`npm test` runs once and exits. The required tests will fail until you build the application. Bonus features are optional.

The tests do not require specific component names or CSS classes.

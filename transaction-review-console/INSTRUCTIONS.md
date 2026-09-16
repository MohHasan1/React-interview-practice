# Transaction Review Console

You have **75 minutes** to build a React + TypeScript screen for a financial operations team. Employees use it to review company transactions, find specific purchases, and approve or decline pending items. You own the application behavior and styling. The project supplies the mock API and tests; `src/App.tsx` is intentionally a placeholder.

## Data and API

The exported type is:

```ts
type TransactionStatus = 'pending' | 'approved' | 'declined'
type TransactionCategory = 'Software' | 'Travel' | 'Meals' | 'Office'
type Transaction = {
  id: string
  merchant: string
  employee: string
  amount: number
  category: TransactionCategory
  status: TransactionStatus
  date: string
}
```

The seven initial transactions are in `src/api.ts`.

Use **only** these two asynchronous application-facing functions from `src/api.ts`:

| Function | Meaning |
| --- | --- |
| `getTransactions(): Promise<Transaction[]>` | GET `/api/transactions` |
| `patchTransaction(id, { status }): Promise<Transaction>` | PATCH `/api/transactions/:id`; status is `approved` or `declined` |

The API returns copies of its data. `mockApi` is for tests only; **do not use it in your application**. No backend server is needed.

The initial data contains seven transactions. The starting summary is **7 total transactions**, **3 pending transactions**, **$1,530.25 total spend**, and **$375.50 pending spend**.

## Tasks

1. **Load:** Request transactions when the screen opens. Show visible text containing **Loading** while the initial request is pending. If it fails, show an accessible alert containing **Unable to load transactions** and a **Retry** button. Retry must make another GET request.
2. **Table:** Show a semantic table named **Transactions**, with one row per visible transaction. Each row must show merchant, employee, category, amount, date, and status. Display dollars with two decimal places and separators where needed, such as **$120.00**, **$45.50**, and **$1,530.25**. Dates may be shown as the supplied ISO date or a readable equivalent.
3. **Search and filter:** Search merchant and employee names without case sensitivity. Provide status and category filters. All three controls work together. When there are no matches, show **No matching transactions**. Changing search or either filter returns pagination to page 1.
4. **Sort and paginate:** Support the four sort choices below; start with newest date first. Show **3 transactions per page** in a navigation landmark named **Pagination**, with **Previous** and **Next** buttons and text such as **Page 1 of 3**. Disable Previous on the first page and Next on the last page. Apply search, then filters, then sort, then pagination before rendering. Do not mutate the loaded transaction array when sorting.
5. **Approve or decline:** Only pending rows show actions named **Approve <merchant>** and **Decline <merchant>**. Send the chosen status to `patchTransaction` using that row's id. On success, show the new status. You may use the API response or refetch; either is valid. On failure, keep that transaction visible with its original status and show a separate accessible alert containing **Unable to update transaction**. An update error must not replace the entire table with the load-error screen.
6. **Summary:** Show an accessible region named **Summary** containing **Total transactions**, **Pending transactions**, **Total spend**, and **Pending spend**. Use all loaded transactions, so search, filters, sorting, and page changes do not alter these totals. Successful status changes should update the pending count and pending spend.
7. **Empty states:** If a successful GET returns an empty array, show **No transactions**. If the loaded data exists but search/filtering finds nothing, show **No matching transactions**. Do not show either message during initial loading. An empty result must not make pagination crash or show **Page 1 of 0**; **Page 1 of 1** is acceptable.
8. **Finish:** Make the screen readable and responsive, then run the required tests, build, and lint checks.

## Exact public UI and accessibility contract

| Area | Required public UI contract |
| --- | --- |
| Loading | Visible text containing `Loading` |
| Main table | Semantic table with accessible name `Transactions` |
| Search | `searchbox` with accessible name `Search transactions` |
| Status | select/combobox with accessible name `Status` |
| Category | select/combobox with accessible name `Category` |
| Sort | select/combobox with accessible name `Sort` |
| Approval | button named `Approve <merchant>` |
| Decline | button named `Decline <merchant>` |
| Summary | region with accessible name `Summary` |
| Pagination | navigation landmark with accessible name `Pagination` |
| Load error | alert containing `Unable to load transactions` |
| Update error | alert containing `Unable to update transaction` |
| Empty API | text `No transactions` |
| Empty search/filter | text `No matching transactions` |

The tests use these accessible names and visible messages. They do not require CSS classes, `data-testid`, or particular component names.

**Accessibility terms:** An *accessible name* is the label assistive technology announces for an element. It is separate from the HTML `name` attribute, `id`, and placeholder text. A *role* is the kind of element exposed to assistive technology. Giving a generic container an accessible name does not by itself make it a navigation landmark or a region; both the role and name in the table above matter.

## Control values

| Control | Exact option values |
| --- | --- |
| Status | `all`, `pending`, `approved`, `declined` |
| Category | `all`, `Software`, `Travel`, `Meals`, `Office` |
| Sort | `date-desc`, `amount-desc`, `amount-asc`, `merchant-asc` |

The sort values mean newest date first, highest amount first, lowest amount first, and merchant A–Z, respectively. Default sort is `date-desc`.

## Edge cases and behavior checks

- Search must work for both merchant and employee. For example, searching `maya` finds Maya Chen's transactions.
- Search, status, and category selections must work together. Searching Maya while selecting pending and Software leaves Figma visible.
- The first page initially shows three rows. Page changes and control changes must reflect the final searched, filtered, and sorted result.
- Approved and declined rows have no approval actions.
- A successful change from pending to approved or declined changes the pending summary values, not total transaction count or total spend.
- GET failure, Retry, PATCH failure, empty API data, empty filtered results, multiple pages, and decimal dollar amounts are part of the required assessment.

## Optional bonus work

Bonus checks run separately and do not affect required test results. Optional features are: search that updates results after roughly 300 ms of inactivity; an immediate approve/decline display that rolls back on PATCH failure; a visible `Showing X of Y transactions` count (Y is the filtered result before pagination); and extra mobile layout polish. No pixel-perfect visual test is required.

## Commands

```bash
npm run dev
npm test
npm run test:bonus
npm run build
npm run lint
```

`npm test` runs the required suite once and exits. `npm run test:bonus` runs a separate optional suite; bonus failures do not affect the required result. The starter application's behavior tests are expected to fail until you implement the application. The untouched starter must build and lint successfully.

## Submission checklist

- Required tasks and the public UI contract are complete.
- `npm test`, `npm run build`, and `npm run lint` have been run.
- Any remaining failures are reported honestly. Bonus work is optional.

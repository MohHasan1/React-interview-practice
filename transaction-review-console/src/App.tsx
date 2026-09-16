// Transaction Review Console
//
// Complete the tasks in INSTRUCTIONS.md.
//
// TODO 1: Load transactions; handle Loading, load errors, and Retry. - d
// TODO 2: Render the transaction table with all required fields and dollar formatting. - d
// TODO 3: Add search, Status filter, Category filter, and empty-result behavior.
// TODO 4: Add sorting and 3-row pagination with Previous/Next.
// TODO 5: Approve or decline pending transactions through the mock API; handle update errors.
// TODO 6: Add the all-transaction Summary and ensure it is unaffected by search/filter/page.
// TODO 7: Make the UI reasonably readable and responsive.
// TODO 8: Run test, build, and lint checks before submission.

import "./App.css";

import { useEffect, useState } from "react";
import {
  getTransactions,
  patchTransaction,
  type Transaction,
  type TransactionCategory,
  type TransactionStatus,
} from "./api";

type SortValue = "date-desc" | "amount-desc" | "amount-asc" | "merchant-asc";

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string>("");
  const [updateError, setUpdateError] = useState<string>("");

  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<TransactionCategory | "all">("all");
  const [status, setStatus] = useState<TransactionStatus | "all">("all");

  const [sortValue, setSortValue] = useState<SortValue>("date-desc");

  const [page, setPage] = useState<number>(1);

  // fetch
  async function fetchTransactions() {
    try {
      setIsLoading(true);
      setFetchError("");

      const res = await getTransactions();
      setTransactions(res);
      setHasLoaded(true);
    } catch (error) {
      setFetchError("Unable to load transactions");
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    fetchTransactions();
  }, []);

  // filter and search
  const filteredTransactions = transactions.filter((tran) => {
    // search
    const searchTersm = tran.merchant + tran.employee;
    const isSearch = searchTersm.toLowerCase().includes(search.toLowerCase());

    // category
    let isCategory = tran.category === category || category === "all";

    // status
    let isStatus = tran.status === status || status === "all";

    return isSearch && isCategory && isStatus;
  });

  // sort
  const sortedTrans = [...filteredTransactions].sort((a, b) => {
    switch (sortValue) {
      case "amount-desc":
        return b.amount - a.amount;
      case "amount-asc":
        return a.amount - b.amount;
      case "merchant-asc":
        return a.merchant.localeCompare(b.merchant);
      case "date-desc":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  // pagination
  const pageSize = 3;
  const totalPages = Math.max(1, Math.ceil(sortedTrans.length / pageSize));
  const pageIndex = (page - 1) * pageSize;
  const paginatedTransactions = sortedTrans.slice(
    pageIndex,
    pageIndex + pageSize,
  );

  const displayTransactions = paginatedTransactions;

  // Toggle status
  async function handleStatus(id: string, status: "approved" | "declined") {
    try {
      setIsLoading(true);
      setUpdateError("");

      await patchTransaction(id, { status });
      await fetchTransactions();
    } catch (error) {
      setUpdateError("Unable to update transaction");
    } finally {
      setIsLoading(false);
    }
  }

  // utils
  function formatCurrency(amount: number) {
    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
      }}
    >
      {/* nav */}
      <nav style={{ width: "50%", paddingTop: "10px" }}>
        <input
          type="text"
          name="Search"
          role="searchbox"
          aria-label="Search transactions"
          value={search}
          placeholder="Search"
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          name="Status filter"
          id="Status filter"
          aria-label="Status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as any);
            setPage(1);
          }}
        >
          {TransactionStatus.map((status) => (
            <option value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
        <select
          name="Category filter"
          id="Category filter"
          aria-label="Category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as any);
            setPage(1);
          }}
        >
          {TransactionCategory.map((status) => (
            <option value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
        <select
          aria-label="Sort"
          value={sortValue}
          onChange={(e) => setSortValue(e.target.value as SortValue)}
        >
          <option value="date-desc">Newest first</option>
          <option value="amount-desc">Highest amount first</option>
          <option value="amount-asc">Lowest amount first</option>
          <option value="merchant-asc">Merchant A–Z</option>
        </select>
      </nav>

      {/* summary */}
      <section aria-label="Summary">
        <table aria-label="Summary">
          <caption>Summary</caption>
          <tr>
            <th>Total transactions</th>
            <th>Pending transactions</th>
            <th>Total spend</th>
            <th>Pending spend</th>
          </tr>
          <tr>
            <TableCell data={transactions.length} />
            <TableCell
              data={transactions.filter((t) => t.status === "pending").length}
            />
            <TableCell
              data={formatCurrency(
                transactions.reduce((total, tran) => total + tran.amount, 0),
              )}
            />
            <TableCell
              data={formatCurrency(
                transactions.reduce(
                  (total, tran) =>
                    tran.status === "pending" ? (total += tran.amount) : total,
                  0,
                ),
              )}
            />
          </tr>
        </table>
      </section>

      {/* transactions */}
      <div style={{ height: "100%" }}>
        {isLoading && <div>Loading</div>}
        {fetchError && (
          <div role="alert" aria-label="alert">
            <h1>{fetchError}</h1>
            <button onClick={fetchTransactions}>Retry</button>
          </div>
        )}
        {transactions && (
          <div>
            <h2>Transactions</h2>
            <nav
              aria-label="Pagination"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <div>
                <button
                  disabled={page === 1}
                  onClick={() => setPage(Math.max(1, page - 1))}
                >
                  Previous
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                >
                  Next
                </button>
              </div>
              <div>
                Page {page} of {totalPages}
              </div>
            </nav>
            <table
              aria-label="Transactions"
              style={{ border: "1px solid white" }}
            >
              <caption>Transactions</caption>
              <tr
                style={{
                  textTransform: "uppercase",
                  border: "1px solid white",
                }}
              >
                <th>merchant</th>
                <th>employee</th>
                <th>category</th>
                <th>amount</th>
                <th>date</th>
                <th>status</th>
                <th>Actions</th>
              </tr>
              {displayTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  style={{ padding: "4px", border: "1px solid white" }}
                >
                  <TableCell data={transaction.merchant} />
                  <TableCell data={transaction.employee} />
                  <TableCell data={transaction.category} />
                  <TableCell data={formatCurrency(transaction.amount)} />
                  <TableCell data={transaction.date} />
                  <TableCell data={transaction.status} />

                  <td style={{ border: "1px solid white", padding: "4px" }}>
                    {transaction.status === "pending" && (
                      <button
                        aria-label={`Approve ${transaction.merchant}`}
                        onClick={() => handleStatus(transaction.id, "approved")}
                      >
                        Approve
                      </button>
                    )}
                  </td>
                  <td style={{ border: "1px solid white", padding: "4px" }}>
                    {transaction.status === "pending" && (
                      <button
                        aria-label={`Decline ${transaction.merchant}`}
                        onClick={() => handleStatus(transaction.id, "declined")}
                      >
                        Decline
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </table>
            <div>
              {transactions.length === 0 ? (
                hasLoaded && !isLoading && (
                  <h2 style={{ textAlign: "center" }}>No transactions</h2>
                )
              ) : (
                displayTransactions.length === 0 && (
                  <h2 style={{ textAlign: "center" }}>
                    No matching transactions
                  </h2>
                )
              )}
            </div>
            <div>
              {updateError && (
                <h2 role="alert" style={{ textAlign: "center" }}>
                  {updateError}
                </h2>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default App;

function TableCell({ data }: { data: string | number }) {
  return <td style={{ border: "1px solid white", padding: "4px" }}>{data}</td>;
}

const TransactionStatus = ["all", "pending", "approved", "declined"];
const TransactionCategory = ["all", "Software", "Travel", "Meals", "Office"];

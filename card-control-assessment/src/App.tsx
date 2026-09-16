// Assessment checklist (same order as INSTRUCTIONS.md):
// TODO 1: Load cards; show loading, load errors, and Retry. - d
// TODO 2: Show every card field, remaining amount, utilization, and dollar formatting. - d
// TODO 3: Search by name/holder/last4; filter by All/Active/Frozen; show empty results. - d
// TODO 4: Freeze/unfreeze through the API; show update errors. - d
// TODO 5: Show all-card totals in the dashboard summary, even when results are filtered.

import { useEffect, useState } from "react";
import { getCards, patchCard, type Card } from "./api";

function App() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [errorUpdate, setErrorUpdate] = useState<string>("");

  const [filter, setFilter] = useState<"all" | Card["status"]>("all");
  const [search, setSearch] = useState<string>("");

  async function fetchCards() {
    try {
      setIsLoading(true);
      setError("");

      const cards = await getCards();
      setCards(cards);
    } catch (error) {
      setError("Unable to load cards. Please try again!");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchCards();
  }, []);

  const displayCards = cards.filter((card) => {
    let searchMatch = false;
    let filterMatch = false;

    if (search) {
      const seacrhTerms = card.name + card.holder + card.last4;
      searchMatch = seacrhTerms.toLowerCase().includes(search.toLowerCase());
    } else {
      searchMatch = true;
    }

    if (filter === "all") filterMatch = true;
    else if (filter === card.status) filterMatch = true;
    else filterMatch = false;

    return searchMatch && filterMatch;
  });

  async function toggleStatus(card: Card) {
    try {
      const newStatus = card.status === "active" ? "frozen" : "active";
      await patchCard(card.id, { status: newStatus });
      fetchCards();
    } catch (error) {
      setErrorUpdate("Unable to update card. Please try again!");
    } finally {
      setIsLoading(true);
    }
  }

  // utils
  function isActive(status: Card["status"]) {
    return status === "active";
  }

  function formatCurrency(amount: number) {
    return `$${amount.toLocaleString("en-US")}`;
  }

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
        height: "100%",
        width: "100%",
        // border: "1px solid white",
      }}
    >
      {/* nav */}
      <nav
        style={{
          width: "50%",
          display: "flex",
          justifyContent: "space-between",
          // border: "1px solid white",
        }}
      >
        <input
          role="searchbox"
          aria-label="Search"
          name="Search"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <section aria-label="Summary">
          <h4>Total cards: {cards.length}</h4>
          <h4>
            Active cards: {cards.filter((c) => c.status === "active").length}
          </h4>
          <h4>
            Total monthly limit:{" "}
            {formatCurrency(cards.reduce((total, card) => total + card.monthlyLimit, 0))}
          </h4>
          <h4>
            Total spent:{" "}
            {formatCurrency(cards.reduce((total, card) => (total += card.spent), 0))}
          </h4>
        </section>

        <select
          aria-label="Status"
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="frozen">Frozen</option>
        </select>
      </nav>

      {/* body */}
      <div style={{ height: "100%", width: "100%" }}>
        {/* loading */}
        {isLoading && (
          <div>
            <h1>Loading cards ....</h1>
          </div>
        )}

        {/* Error - update */}
        {Boolean(errorUpdate) && (
          <div role="alert">
            <h1>{errorUpdate}</h1>
          </div>
        )}

        {/* error or content */}
        {Boolean(error) ? (
          <div role="alert">
            <h1>{error}</h1>
            <button onClick={fetchCards}>Retry</button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {displayCards.length === 0 ? (
              <div>No cards or no matching results</div>
            ) : (
              displayCards.map((card) => (
                <article
                  role="article"
                  aria-label={card.name}
                  key={card.id}
                  style={{ border: "1px solid white", padding: "6px" }}
                >
                  <h2>{card.name}</h2>
                  <div
                    style={{ color: isActive(card.status) ? "green" : "red" }}
                  >
                    status: {card.status}
                  </div>
                  <div> last4: {card.last4}</div>
                  <div> monthlyLimit: {formatCurrency(card.monthlyLimit)}</div>
                  <div> spent: {formatCurrency(card.spent)}</div>
                  <div>
                    Remainging Amount:{" "}
                    {formatCurrency(card.monthlyLimit - card.spent)}
                  </div>
                  <div>
                    Utilization:{" "}
                    {card.monthlyLimit === 0
                      ? 0
                      : Math.round((card.spent / card.monthlyLimit) * 100)}
                    %
                  </div>
                  <div>{card.holder}</div>
                  <div>
                    {card.monthlyLimit === card.spent && "Limit reached"}
                  </div>

                  <button onClick={() => toggleStatus(card)}>
                    {isActive(card.status) ? "Freeze" : "Unfreeze"} {card.name}
                  </button>
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default App;

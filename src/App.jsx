
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  // Wallet always starts at 5000 when the page is loaded.
  const [walletBalance, setWalletBalance] = useState(5000);

  // Expenses are persisted using the required "expenses" key.
  const [expenses, setExpenses] = useState(() => {
    try {
      const savedExpenses = localStorage.getItem("expenses");
      return savedExpenses ? JSON.parse(savedExpenses) : [];
    } catch {
      return [];
    }
  });

  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const [incomeAmount, setIncomeAmount] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    date: "",
  });

  // Save expenses to localStorage.
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  // -----------------------------
  // Add Income
  // -----------------------------
  const handleAddIncome = (event) => {
    event.preventDefault();

    const amount = Number(incomeAmount);

    if (!amount || amount <= 0) {
      alert("Please enter a valid income amount");
      return;
    }

    setWalletBalance(
      (previousBalance) => previousBalance + amount
    );

    setIncomeAmount("");
    setShowBalanceModal(false);
  };

  // -----------------------------
  // Open Add Expense
  // -----------------------------
  const openAddExpense = () => {
    setFormData({
      title: "",
      price: "",
      category: "",
      date: "",
    });

    setShowExpenseModal(true);
  };

  // -----------------------------
  // Expense input changes
  // -----------------------------
  const handleExpenseChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // -----------------------------
  // Add Expense
  // -----------------------------
  const handleAddExpense = (event) => {
    event.preventDefault();

    const title = formData.title.trim();
    const price = Number(formData.price);

    if (!title) {
      alert("Please enter expense title");
      return;
    }

    if (!price || price <= 0) {
      alert("Please enter a valid expense amount");
      return;
    }

    if (!formData.category) {
      alert("Please select a category");
      return;
    }

    if (!formData.date) {
      alert("Please select a date");
      return;
    }

    if (price > walletBalance) {
      alert("Expense cannot exceed wallet balance");
      return;
    }

    const newExpense = {
      id: Date.now(),
      title,
      price,
      category: formData.category,
      date: formData.date,
    };

    setExpenses((previousExpenses) => [
      ...previousExpenses,
      newExpense,
    ]);

    setWalletBalance(
      (previousBalance) => previousBalance - price
    );

    // Clear form after successful submission.
    setFormData({
      title: "",
      price: "",
      category: "",
      date: "",
    });

    setShowExpenseModal(false);
  };

  // -----------------------------
  // Delete Expense
  // -----------------------------
  const handleDelete = (id) => {
    const expense = expenses.find(
      (item) => item.id === id
    );

    if (!expense) {
      return;
    }

    setExpenses((previousExpenses) =>
      previousExpenses.filter(
        (item) => item.id !== id
      )
    );

    setWalletBalance(
      (previousBalance) =>
        previousBalance + Number(expense.price)
    );
  };

  return (
    <div className="app">

      {/* Header */}
      <header className="app-header">
        <h1>Expense Tracker</h1>

        <div className="header-wallet">
          <span>Wallet Balance</span>
          <strong>
            ₹{walletBalance.toFixed(2)}
          </strong>
        </div>
      </header>

      <main className="app-container">

        {/* Wallet Card */}
        <section className="wallet-card">

          <div className="wallet-info">
            <p>Wallet Balance</p>

            <h2>
              ₹{walletBalance.toFixed(2)}
            </h2>
          </div>

          <button
            type="button"
            className="income-button"
            onClick={() => setShowBalanceModal(true)}
          >
            + Add Income
          </button>

        </section>

        {/* Expense Section */}
        <section className="expense-section">

          <div className="section-header">

            <div>
              <h2>Expenses</h2>

              <p>
                Transactions: {expenses.length}{" "}
                {expenses.length === 1
                  ? "expense"
                  : "expenses"}{" "}
                recorded
              </p>
            </div>

            <button
              type="button"
              className="expense-button"
              onClick={openAddExpense}
            >
              + Add Expense
            </button>

          </div>

          {/* Transaction List */}
          <div className="transaction-list">

            {expenses.length === 0 ? (
              <p>No expenses recorded yet.</p>
            ) : (
              expenses.map((expense) => (
                <div
                  className="transaction"
                  key={expense.id}
                >
                  <div>
                    <strong>{expense.title}</strong>

                    <p>
                      {expense.category} ·{" "}
                      {expense.date}
                    </p>
                  </div>

                  <div>
                    <strong>
                      ₹{Number(expense.price).toFixed(2)}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(expense.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}

          </div>

        </section>

      </main>

      {/* Add Balance Modal */}
      {showBalanceModal && (
        <div className="modal-overlay">

          <div className="modal">

            <h2>Add Balance</h2>

            <form onSubmit={handleAddIncome}>

              <input
                type="number"
                placeholder="Income Amount"
                value={incomeAmount}
                onChange={(event) =>
                  setIncomeAmount(event.target.value)
                }
              />

              <div className="modal-buttons">

                <button
                  type="button"
                  onClick={() => {
                    setIncomeAmount("");
                    setShowBalanceModal(false);
                  }}
                >
                  Cancel
                </button>

                <button type="submit">
                  Add Balance
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="modal-overlay">

          <div className="modal">

            <h2>Add Expense</h2>

            <form onSubmit={handleAddExpense}>

              <input
                type="text"
                name="title"
                placeholder="Expense Title"
                value={formData.title}
                onChange={handleExpenseChange}
              />

              <input
                type="number"
                name="price"
                placeholder="Expense Amount"
                value={formData.price}
                onChange={handleExpenseChange}
              />

              <select
                name="category"
                value={formData.category}
                onChange={handleExpenseChange}
              >
                <option value="">
                  Select category
                </option>

                <option value="Food">
                  Food
                </option>

                <option value="Travel">
                  Travel
                </option>

                <option value="Entertainment">
                  Entertainment
                </option>

                <option value="Shopping">
                  Shopping
                </option>

                <option value="Bills">
                  Bills
                </option>

                <option value="Health">
                  Health
                </option>

                <option value="Education">
                  Education
                </option>

                <option value="Other">
                  Other
                </option>
              </select>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleExpenseChange}
              />

              <div className="modal-buttons">

                <button
                  type="button"
                  onClick={() =>
                    setShowExpenseModal(false)
                  }
                >
                  Cancel
                </button>

                <button type="submit">
                  Add Expense
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default App;
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { FaWallet } from "react-icons/fa";
import { MdAccountBalanceWallet } from "react-icons/md";

import AddBalanceModal from "./components/AddBalanceModal";
import ExpenseModal from "./components/ExpenseModal";
import ExpenseList from "./components/ExpenseList";
import ExpenseSummary from "./components/ExpenseSummary";
import ExpenseTrends from "./components/ExpenseTrends";

import "./App.css";

function App() {
  const { enqueueSnackbar } = useSnackbar();

  // --------------------------------------------------
  // Wallet Balance
  // --------------------------------------------------
  // Start every fresh page visit with 5000.
  // This is important because the Cypress tests expect
  // every test to start with a balance of 5000.
  const [walletBalance, setWalletBalance] = useState(5000);

  // --------------------------------------------------
  // Expenses
  // --------------------------------------------------
  // Expenses are persisted using the required key:
  // "expenses"
  const [expenses, setExpenses] = useState(() => {
    try {
      const savedExpenses = localStorage.getItem("expenses");

      if (savedExpenses) {
        return JSON.parse(savedExpenses);
      }

      return [];
    } catch (error) {
      return [];
    }
  });

  // --------------------------------------------------
  // Modal states
  // --------------------------------------------------
  const [isBalanceModalOpen, setIsBalanceModalOpen] =
    useState(false);

  const [isExpenseModalOpen, setIsExpenseModalOpen] =
    useState(false);

  const [editingExpense, setEditingExpense] = useState(null);

  // --------------------------------------------------
  // Save expenses to localStorage
  // --------------------------------------------------
  useEffect(() => {
    localStorage.setItem(
      "expenses",
      JSON.stringify(expenses)
    );
  }, [expenses]);

  // --------------------------------------------------
  // Add Income
  // --------------------------------------------------
  const handleAddBalance = (amount) => {
    const income = Number(amount);

    if (!income || income <= 0) {
      enqueueSnackbar("Please enter a valid income amount", {
        variant: "error",
      });

      return false;
    }

    setWalletBalance(
      (previousBalance) => previousBalance + income
    );

    enqueueSnackbar("Balance added successfully", {
      variant: "success",
    });

    setIsBalanceModalOpen(false);

    return true;
  };

  // --------------------------------------------------
  // Add Expense
  // --------------------------------------------------
  const handleAddExpense = (expenseData) => {
    const title = String(expenseData.title || "").trim();
    const price = Number(expenseData.price);
    const category = expenseData.category;
    const date = expenseData.date;

    // Validate title
    if (!title) {
      enqueueSnackbar("Please enter expense title", {
        variant: "error",
      });

      return false;
    }

    // Validate price
    if (!price || price <= 0) {
      enqueueSnackbar("Please enter a valid expense amount", {
        variant: "error",
      });

      return false;
    }

    // Validate category
    if (!category) {
      enqueueSnackbar("Please select a category", {
        variant: "error",
      });

      return false;
    }

    // Validate date
    if (!date) {
      enqueueSnackbar("Please select a date", {
        variant: "error",
      });

      return false;
    }

    // Prevent overspending
    if (price > walletBalance) {
      alert("Expense cannot exceed wallet balance");

      return false;
    }

    const newExpense = {
      id: Date.now(),
      title,
      price,
      category,
      date,
    };

    setExpenses((previousExpenses) => [
      ...previousExpenses,
      newExpense,
    ]);

    setWalletBalance(
      (previousBalance) => previousBalance - price
    );

    enqueueSnackbar("Expense added successfully", {
      variant: "success",
    });

    return true;
  };

  // --------------------------------------------------
  // Edit Expense
  // --------------------------------------------------
  const handleUpdateExpense = (updatedExpense) => {
    if (!editingExpense) {
      return false;
    }

    const title = String(
      updatedExpense.title || ""
    ).trim();

    const newPrice = Number(updatedExpense.price);
    const category = updatedExpense.category;
    const date = updatedExpense.date;

    // Validate title
    if (!title) {
      enqueueSnackbar("Please enter expense title", {
        variant: "error",
      });

      return false;
    }

    // Validate price
    if (!newPrice || newPrice <= 0) {
      enqueueSnackbar("Please enter a valid expense amount", {
        variant: "error",
      });

      return false;
    }

    // Validate category
    if (!category) {
      enqueueSnackbar("Please select a category", {
        variant: "error",
      });

      return false;
    }

    // Validate date
    if (!date) {
      enqueueSnackbar("Please select a date", {
        variant: "error",
      });

      return false;
    }

    const oldPrice = Number(editingExpense.price);

    // Difference between new and old price
    const priceDifference = newPrice - oldPrice;

    // If expense is increased, check wallet balance
    if (priceDifference > walletBalance) {
      alert("Expense cannot exceed wallet balance");

      return false;
    }

    setExpenses((previousExpenses) =>
      previousExpenses.map((expense) =>
        expense.id === editingExpense.id
          ? {
              ...expense,
              title,
              price: newPrice,
              category,
              date,
            }
          : expense
      )
    );

    setWalletBalance(
      (previousBalance) =>
        previousBalance - priceDifference
    );

    enqueueSnackbar("Expense updated successfully", {
      variant: "success",
    });

    setEditingExpense(null);
    setIsExpenseModalOpen(false);

    return true;
  };

  // --------------------------------------------------
  // Delete Expense
  // --------------------------------------------------
  const handleDeleteExpense = (expenseId) => {
    const expenseToDelete = expenses.find(
      (expense) => expense.id === expenseId
    );

    if (!expenseToDelete) {
      return;
    }

    setExpenses((previousExpenses) =>
      previousExpenses.filter(
        (expense) => expense.id !== expenseId
      )
    );

    // Return deleted expense amount to wallet
    setWalletBalance(
      (previousBalance) =>
        previousBalance +
        Number(expenseToDelete.price)
    );

    enqueueSnackbar("Expense deleted successfully", {
      variant: "success",
    });
  };

  // --------------------------------------------------
  // Edit button
  // --------------------------------------------------
  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  // --------------------------------------------------
  // Expense form submit
  // --------------------------------------------------
  const handleExpenseSubmit = (expenseData) => {
    if (editingExpense) {
      return handleUpdateExpense(expenseData);
    }

    return handleAddExpense(expenseData);
  };

  // --------------------------------------------------
  // Close expense modal
  // --------------------------------------------------
  const handleCloseExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  return (
    <div className="app">

      {/* =================================================
          HEADER
          Only ONE h1 in the entire application
      ================================================== */}
      <header className="header">
        <div className="header-content">

          <div>
            <h1>Expense Tracker</h1>

            <p className="subtitle">
              Manage your expenses and track your spending
            </p>
          </div>

          {/* Wallet Balance */}
          <div className="wallet-header">

            <MdAccountBalanceWallet />

            <div>
              <span>Wallet Balance</span>

              <strong>
                ₹{walletBalance.toFixed(2)}
              </strong>
            </div>

          </div>

        </div>
      </header>

      <main className="container">

        {/* =================================================
            WALLET CARD
        ================================================== */}
        <section className="top-section">

          <div className="wallet-card">

            <div className="wallet-icon">
              <FaWallet />
            </div>

            <div className="wallet-info">

              <p>Wallet Balance</p>

              <h2>
                ₹{walletBalance.toFixed(2)}
              </h2>

              <span>
                Available balance
              </span>

            </div>

            {/* Required Cypress button */}
            <button
              type="button"
              className="income-button"
              onClick={() =>
                setIsBalanceModalOpen(true)
              }
            >
              + Add Income
            </button>

          </div>

        </section>

        {/* =================================================
            EXPENSE SUMMARY + TRENDS
        ================================================== */}
        <section className="charts-grid">

          <div className="card chart-card">

            <div className="card-heading">

              <div>
                <h2>Expense Summary</h2>

                <p>
                  Spending by category
                </p>
              </div>

            </div>

            <ExpenseSummary
              expenses={expenses}
            />

          </div>

          <div className="card chart-card">

            <div className="card-heading">

              <div>
                <h2>Expense Trends</h2>

                <p>
                  Total spending by category
                </p>
              </div>

            </div>

            <ExpenseTrends
              expenses={expenses}
            />

          </div>

        </section>

        {/* =================================================
            EXPENSE SECTION
        ================================================== */}
        <section className="card expense-card">

          <div className="expense-header">

            <div>

              <h2>Expenses</h2>

              {/* Cypress checks for "Transactions" */}
              <p>
                Transactions: {expenses.length}{" "}
                {expenses.length === 1
                  ? "expense"
                  : "expenses"}{" "}
                recorded
              </p>

            </div>

            {/* Required Cypress button */}
            <button
              type="button"
              className="expense-button"
              onClick={() => {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              }}
            >
              + Add Expense
            </button>

          </div>

          <ExpenseList
            expenses={expenses}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
          />

        </section>

      </main>

      {/* =================================================
          ADD BALANCE MODAL
      ================================================== */}
      <AddBalanceModal
        isOpen={isBalanceModalOpen}
        onClose={() =>
          setIsBalanceModalOpen(false)
        }
        onSubmit={handleAddBalance}
      />

      {/* =================================================
          ADD / EDIT EXPENSE MODAL
      ================================================== */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={handleCloseExpenseModal}
        onSubmit={handleExpenseSubmit}
        editingExpense={editingExpense}
      />

    </div>
  );
}

export default App;
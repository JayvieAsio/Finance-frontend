import { useEffect, useState } from "react";
import axios from "axios";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

function App() {
  const [transactions, setTransactions] = useState([]);

  const BUDGET = 50000;

  useEffect(() => {
    fetchTransactions();
  }, []);

  // FETCH
  const fetchTransactions = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/transactions/");
      setTransactions(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 DELETE FUNCTION
  const deleteTransaction = async (id) => {
    const confirmDelete = window.confirm("Delete this transaction?");
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/transactions/${id}/`
      );

      fetchTransactions(); // refresh list
    } catch (err) {
      console.log(err.response?.data);
      alert("Failed to delete transaction");
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // TOTAL
  const totalExpenses = transactions.reduce(
    (total, item) => total + Number(item.amount),
    0
  );

  const remainingBudget = BUDGET - totalExpenses;
  const isOverBudget = remainingBudget <= 0;

  // PIE DATA
  const summary = [
    {
      name: "Income",
      value: transactions
        .filter((t) => t.type?.toLowerCase() === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0),
    },
    {
      name: "Expense",
      value: transactions
        .filter((t) => t.type?.toLowerCase() === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-5">

      {/* ADD TRANSACTION */}
      <div className="bg-white p-5 rounded-xl shadow mb-5">
        <h2 className="text-xl font-bold mb-3">Add Transaction</h2>

        <form
          onSubmit={async (e) => {
            e.preventDefault();

            const title = e.target.title.value.trim();
            const type = e.target.type.value;
            const amount = Number(e.target.amount.value);

            if (!title || !type || !amount) {
              alert("Please fill in all fields!");
              return;
            }

            // BLOCK IF OVER BUDGET
            if (totalExpenses + amount > BUDGET) {
              alert("Budget exceeded! Cannot add transaction.");
              return;
            }

            try {
              await axios.post(
                "http://127.0.0.1:8000/api/transactions/",
                {
                  title,
                  amount,
                  type,
                }
              );

              fetchTransactions();
              e.target.reset();
            } catch (err) {
              console.log(err.response?.data);
              alert("Error saving transaction");
            }
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            name="title"
            placeholder="Title"
            className="border p-2 rounded w-full"
          />

          <select name="type" className="border p-2 rounded w-full">
            <option value="">Select Type</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            className="border p-2 rounded w-full"
          />

          <button className="bg-blue-500 text-white px-4 rounded">
            Add
          </button>
        </form>
      </div>

      {/* TITLE */}
      <h1 className="text-3xl font-bold mb-5">
        Expense Tracker Dashboard
      </h1>

      {/* CARDS */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-gray-500">Total Expenses</h2>
          <p className="text-2xl font-bold">₱ {totalExpenses}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-gray-500">Transactions</h2>
          <p className="text-2xl font-bold">{transactions.length}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-gray-500">Budget Remaining</h2>

          <p className="text-2xl font-bold">₱ {remainingBudget}</p>

          <p className="text-sm text-gray-400">
            Total Budget: ₱ {BUDGET}
          </p>

          <p className={isOverBudget ? "text-red-500 font-bold" : "text-green-500"}>
            {isOverBudget ? "Over Budget!" : "Within Budget"}
          </p>
        </div>

      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-5 mb-6">

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-3">
            Income vs Expense
          </h2>

          <PieChart width={400} height={300}>
            <Pie
              data={summary}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {summary.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-3">
            Expenses by Type
          </h2>

          <BarChart width={500} height={300} data={transactions}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" fill="#8884d8" />
          </BarChart>
        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-3">
          Recent Transactions
        </h2>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Title</th>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Amount</th>
              <th className="text-left p-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-2">{item.title}</td>
                <td className="p-2">{item.type}</td>
                <td className="p-2">₱ {item.amount}</td>

                {/* DELETE BUTTON */}
                <td className="p-2">
                  <button
                    onClick={() => deleteTransaction(item.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default App;
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
  ResponsiveContainer,
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

  // DELETE
  const deleteTransaction = async (id) => {
    const confirmDelete = window.confirm("Delete this transaction?");
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/transactions/${id}/`
      );

      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.log(err.response?.data);
      alert("Failed to delete transaction");
    }
  };

  const COLORS = ["#8B5CF6", "#06B6D4", "#F59E0B", "#EF4444"];

  // TOTAL EXPENSES
  const totalExpenses = transactions
    .filter((item) => item.type?.toLowerCase() === "expense")
    .reduce((total, item) => total + Number(item.amount), 0);

  const totalIncome = transactions
    .filter((item) => item.type?.toLowerCase() === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const remainingBudget = BUDGET - totalExpenses;
  const isOverBudget = remainingBudget <= 0;

  // PIE DATA
  const summary = [
    {
      name: "Income",
      value: totalIncome,
    },
    {
      name: "Expense",
      value: totalExpenses,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-wide">
            Expense Tracker
          </h1>
          <p className="text-gray-400 mt-1">
            Monitor your finances beautifully
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/10 px-6 py-3 rounded-2xl shadow-xl">
          <p className="text-gray-300 text-sm">Total Budget</p>
          <h2 className="text-2xl font-bold text-cyan-400">
            ₱ {BUDGET}
          </h2>
        </div>
      </div>

      {/* ADD TRANSACTION */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-3xl shadow-2xl mb-8">

        <h2 className="text-2xl font-bold mb-5 text-cyan-400">
          Add Transaction
        </h2>

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
            if (type === "expense" && totalExpenses + amount > BUDGET) {
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
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >

          <input
            type="text"
            name="title"
            placeholder="Transaction Title"
            className="bg-[#1e293b] border border-gray-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-400"
          />

          <select
            name="type"
            className="bg-[#1e293b] border border-gray-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="">Select Type</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            className="bg-[#1e293b] border border-gray-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-400"
          />

          <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-all duration-300 text-white font-bold rounded-xl shadow-lg">
            Add Transaction
          </button>

        </form>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* EXPENSE */}
        <div className="bg-gradient-to-br from-red-500/20 to-red-700/20 border border-red-500/20 p-6 rounded-3xl shadow-xl backdrop-blur-lg">
          <p className="text-gray-300">Total Expenses</p>

          <h2 className="text-4xl font-extrabold text-red-400 mt-2">
            ₱ {totalExpenses}
          </h2>
        </div>

        {/* INCOME */}
        <div className="bg-gradient-to-br from-green-500/20 to-green-700/20 border border-green-500/20 p-6 rounded-3xl shadow-xl backdrop-blur-lg">
          <p className="text-gray-300">Total Income</p>

          <h2 className="text-4xl font-extrabold text-green-400 mt-2">
            ₱ {totalIncome}
          </h2>
        </div>

        {/* BUDGET */}
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-700/20 border border-cyan-500/20 p-6 rounded-3xl shadow-xl backdrop-blur-lg">
          <p className="text-gray-300">Remaining Budget</p>

          <h2 className="text-4xl font-extrabold text-cyan-400 mt-2">
            ₱ {remainingBudget}
          </h2>

          <p
            className={`mt-3 font-semibold ${
              isOverBudget ? "text-red-400" : "text-green-400"
            }`}
          >
            {isOverBudget ? "Over Budget!" : "Within Budget"}
          </p>
        </div>

      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* PIE CHART */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-3xl shadow-2xl">

          <h2 className="text-2xl font-bold mb-5 text-cyan-400">
            Income vs Expense
          </h2>

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={summary}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
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
          </ResponsiveContainer>
        </div>

        {/* BAR CHART */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-3xl shadow-2xl">

          <h2 className="text-2xl font-bold mb-5 text-cyan-400">
            Transaction Analytics
          </h2>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={transactions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

              <XAxis dataKey="type" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />

              <Tooltip />
              <Legend />

              <Bar
                dataKey="amount"
                fill="#06B6D4"
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-3xl shadow-2xl">

        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-cyan-400">
            Recent Transactions
          </h2>

          <div className="bg-cyan-500/20 px-4 py-2 rounded-xl text-cyan-300">
            {transactions.length} Records
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-3">

            <thead>
              <tr className="text-gray-400">
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Amount</th>
                <th className="text-left p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((item) => (
                <tr
                  key={item.id}
                  className="bg-[#1e293b]/70 hover:bg-[#334155] transition-all rounded-2xl"
                >

                  <td className="p-4 rounded-l-2xl font-semibold">
                    {item.title}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        item.type === "income"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>

                  <td className="p-4 font-bold text-cyan-300">
                    ₱ {item.amount}
                  </td>

                  <td className="p-4 rounded-r-2xl">
                    <button
                      onClick={() => deleteTransaction(item.id)}
                      className="bg-gradient-to-r from-red-500 to-pink-600 hover:scale-105 transition-all duration-300 px-4 py-2 rounded-xl font-bold shadow-lg"
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

    </div>
  );
}

export default App;
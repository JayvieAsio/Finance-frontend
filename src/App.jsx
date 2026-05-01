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
    axios
      .get("http://127.0.0.1:8000/api/transactions/")
      .then((res) => {
        setTransactions(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // 💸 TOTAL EXPENSES
  const totalExpenses = transactions.reduce(
    (total, item) => total + Number(item.amount),
    0
  );

  // 💰 REMAINING BUDGET (THIS IS WHAT YOU WANTED)
  const remainingBudget = BUDGET - totalExpenses;

  const isOverBudget = remainingBudget <= 0;

  return (
    <div className="min-h-screen bg-gray-100 p-5">

      {/* ADD TRANSACTION */}
      <div className="bg-white p-5 rounded-xl shadow mb-5">
        <h2 className="text-xl font-bold mb-3">Add Transaction</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            const amount = Number(e.target.amount.value);


            if (totalExpenses + amount > BUDGET) {
              alert("Your Budget is Limit, Youre Not Enough");
              return;
            }

            const newTransaction = {
              id: transactions.length + 1,
              title: e.target.title.value,
              category: e.target.category.value,
              amount,
            };

            setTransactions([...transactions, newTransaction]);
            e.target.reset();
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            name="title"
            placeholder="Title"
            className="border p-2 rounded w-full"
          />

          <input
            type="text"
            name="category"
            placeholder="Category"
            className="border p-2 rounded w-full"
          />

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

        {/* TOTAL EXPENSES */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-gray-500">Total Expenses</h2>
          <p className="text-2xl font-bold">₱ {totalExpenses}</p>
        </div>

        {/* TRANSACTIONS */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-gray-500">Transactions</h2>
          <p className="text-2xl font-bold">{transactions.length}</p>
        </div>

        {/* 💰 BUDGET (NOW DYNAMIC) */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-gray-500">Budget Remaining</h2>

          <p className="text-2xl font-bold">
            ₱ {remainingBudget}
          </p>

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

        {/* PIE CHART */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-3">
            Expenses Pie Chart
          </h2>

          <PieChart width={400} height={300}>
            <Pie
              data={transactions}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {transactions.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </div>

        {/* BAR CHART */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-3">
            Monthly Expenses
          </h2>

          <BarChart width={500} height={300} data={transactions}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
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
              <th className="text-left p-2">Category</th>
              <th className="text-left p-2">Amount</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-2">{item.title}</td>
                <td className="p-2">{item.category}</td>
                <td className="p-2">₱ {item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default App;

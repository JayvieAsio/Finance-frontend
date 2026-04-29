import { useEffect, useState } from "react";
import axios from "axios";
import "./index.css";

function App() {
  const [data, setData] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");

  const API = "http://localhost:8000/api/transactions/";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios
      .get(API)
      .then(res => setData(res.data))
      .catch(err => console.log("GET ERROR:", err.response?.data));
  };

  const addTransaction = () => {
    axios
      .post(API, {
        title: title.trim(),
        amount: Number(amount), // important: convert to number
        type
      })
      .then(() => {
        fetchData();
        setTitle("");
        setAmount("");
        setType("expense");
      })
      .catch(err => {
        console.log("POST ERROR DETAILS:", err.response?.data);
      });
  };

  return (
    <div style={{ padding: 50 }}>
      <h1>Expense Tracker</h1>

      <input
        value={title}
        placeholder="Title"
        onChange={e => setTitle(e.target.value)}
      />

      <input
        value={amount}
        placeholder="Amount"
        onChange={e => setAmount(e.target.value)}
      />

      <select value={type} onChange={e => setType(e.target.value)}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

     <button
  onClick={addTransaction}
  className="bg-blue-500 hover:bg-blue-600 text-blue-700 px-4 py-2 rounded"
>
  Add
</button>

      <h2>Transactions</h2>

      {data.map(item => (
        <div key={item.id}>
          {item.title} - {item.amount} - {item.type}
        </div>
      ))}
    </div>
  );
}

export default App;
"use client";

import { useState } from "react";

export default function MerchantPage() {
  const [formData, setFormData] = useState({
    amount: "",
    transaction_type: "expense",
    category: "supplies",
    payment_method: "cash",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<null | string>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
      setStatus("User not authenticated.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/add-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, user_id }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("✅ Transaction added!");
        setFormData({
          amount: "",
          transaction_type: "expense",
          category: "supplies",
          payment_method: "cash",
          description: "",
        });
      } else {
        setStatus(`❌ ${data.error || "Failed to add transaction"}`);
      }
    } catch (err) {
      setStatus("❌ Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Add Transaction</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="amount"
          type="number"
          step="0.01"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <select
          name="transaction_type"
          value={formData.transaction_type}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="sales">Sales</option>
          <option value="supplies">Supplies</option>
          <option value="rent">Rent</option>
          <option value="wages">Wages</option>
        </select>

        <select
          name="payment_method"
          value={formData.payment_method}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="cash">Cash</option>
          <option value="e-wallet">E-wallet</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="qr">QR</option>
          <option value="others">Others</option>
        </select>

        <input
          name="description"
          type="text"
          placeholder="Optional Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white py-2 px-4 rounded hover:bg-opacity-90"
        >
          {loading ? "Saving..." : "Add Transaction"}
        </button>
      </form>

      {status && <p className="mt-4 text-sm text-center">{status}</p>}
    </main>
  );
}

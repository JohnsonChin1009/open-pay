"use client";

import { useState } from "react";
import Container from "@/components/custom/Container";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen w-full bg-gradient-to-br from-yellow-100 via-yellow-200 to-white">
      <div className="relative min-h-screen w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent backdrop-blur-sm" />

        <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
          <div className="bg-white/60 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-xl p-8 w-full max-w-md space-y-6">
            <h1 className="font-headline text-2xl sm:text-3xl text-black-900 text-center">Add Transaction</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="amount"
                type="number"
                step="0.01"
                placeholder="Amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full border border-zinc-800 p-2 rounded-lg focus:outline-yellow-400 bg-white/80"
                required
              />

              <select
                name="transaction_type"
                value={formData.transaction_type}
                onChange={handleChange}
                className="w-full border border-zinc-800 p-2 rounded-lg focus:outline-yellow-400 bg-white/80"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-zinc-800 p-2 rounded-lg focus:outline-yellow-400 bg-white/80"
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
                className="w-full border border-zinc-800 p-2 rounded-lg focus:outline-yellow-400 bg-white/80"
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
                className="w-full border border-zinc-800 p-2 rounded-lg focus:outline-yellow-400 bg-white/80"
              />

              <Button 
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 rounded-lg hover:bg-yellow-600 transition duration-200"
              >
                {loading ? "Saving..." : "Add Transaction"}
              </Button>
            </form>

            {status && <p className="text-sm text-center text-green-600">{status}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
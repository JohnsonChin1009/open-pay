"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Transaction = {
  id: string;
  user_id: string;
  transaction_type: string;
  amount: number;
  currency: string;
  category: string;
  description?: string;
  payment_method: string;
  timestamp: string;
  source?: string;
  is_recurring: boolean;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user?.id) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      try {
        const res = await fetch(
          `/api/get-transaction-by-user?user_id=${userId}`,
        );
        const result = await res.json();

        if (!res.ok) {
          setError(result.error || "Failed to fetch transactions");
        } else {
          setTransactions(result.data);
        }
      } catch (err) {
        console.error("Unexpected error fetching transactions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Your Transactions</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm whitespace-pre-wrap">
        {JSON.stringify(transactions, null, 2)}
      </pre>
    </div>
  );
}

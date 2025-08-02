"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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

  const fetchTransactions = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) return;

    const res = await fetch(`/api/get-transaction-by-user?user_id=${session.user.id}`);
    const result = await res.json();
    setTransactions(result.data || []);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleExportPDF = () => {
    const income = transactions.filter((t) => t.transaction_type === "income");
    const expenses = transactions.filter((t) => t.transaction_type === "expense");
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const netIncome = totalIncome - totalExpenses;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Profit & Loss Statement", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 28);

    const tableData = transactions.map((t) => [
      t.transaction_type,
      `RM ${t.amount.toFixed(2)}`,
      t.category,
      t.description || "-",
      t.payment_method,
    ]);

    autoTable(doc, {
      head: [["Type", "Amount", "Category", "Description", "Method"]],
      body: tableData,
      startY: 35,
    });

    const finalY = (doc as any).lastAutoTable.finalY || 50;
    doc.setFontSize(12);
    doc.text(`Total Income: RM ${totalIncome.toFixed(2)}`, 14, finalY + 10);
    doc.text(`Total Expenses: RM ${totalExpenses.toFixed(2)}`, 14, finalY + 18);
    doc.text(`Net Income: RM ${netIncome.toFixed(2)}`, 14, finalY + 26);

    doc.save("pnl_statement.pdf");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Your Transactions</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm whitespace-pre-wrap">
        {JSON.stringify(transactions, null, 2)}
      </pre>

      <button
        onClick={handleExportPDF}
        className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500 mt-4"
      >
        Export P&L Statement (PDF)
      </button>
    </div>
  );
}

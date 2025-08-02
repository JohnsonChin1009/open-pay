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

type PnLReport = {
  _id: string;
  filename: string;
  generated_at: string;
  total_income: number;
  total_expenses: number;
  net_income: number;
  transaction_count: number;
  period: {
    start_date: string;
    end_date: string;
  };
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reports, setReports] = useState<PnLReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [financialAdvice, setFinancialAdvice] = useState<string>("");
  const [isGettingAdvice, setIsGettingAdvice] = useState(false);

  const fetchTransactions = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) return;

    setUserId(session.user.id);
    const res = await fetch(`/api/get-transaction-by-user?user_id=${session.user.id}`);
    const result = await res.json();
    setTransactions(result.data || []);
  };

  const fetchReports = async () => {
    if (!userId) return;
    
    const res = await fetch(`/api/generate-pnl?user_id=${userId}`);
    const result = await res.json();
    if (result.success) {
      setReports(result.data || []);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleGeneratePNL = async () => {
    if (!userId) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-pnl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
        }),
      });

      const result = await res.json();
      if (result.success) {
        alert('P&L Statement generated successfully!');
        fetchReports(); // Refresh the reports list
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error generating P&L:', error);
      alert('Failed to generate P&L statement');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = async (reportId: string, filename: string) => {
    if (!userId) return;

    try {
      const res = await fetch(`/api/download-pnl?user_id=${userId}&report_id=${reportId}`);
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download report');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report');
    }
  };

  const handleGetFinancialAdvice = async () => {
    if (!userId) return;

    setIsGettingAdvice(true);
    try {
      const res = await fetch('/api/financial-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: "Based on my financial data, what loans or financial products would you recommend for me? What should I consider for my financial health?",
          user_id: userId,
          include_pnl: true
        }),
      });

      const result = await res.json();
      if (result.success) {
        setFinancialAdvice(result.answer);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error getting financial advice:', error);
      alert('Failed to get financial advice');
    } finally {
      setIsGettingAdvice(false);
    }
  };

  const handleGenerateEmbeddings = async () => {
    if (!userId) return;

    try {
      const res = await fetch('/api/generate-pnl-embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
        }),
      });

      const result = await res.json();
      if (result.success) {
        alert(`Successfully generated embeddings for ${result.processed_count} reports`);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error generating embeddings:', error);
      alert('Failed to generate embeddings');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Your Transactions</h1>
      
      <div className="mb-6">
        <button
          onClick={handleGeneratePNL}
          disabled={isGenerating || transactions.length === 0}
          className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed mr-3"
        >
          {isGenerating ? 'Generating...' : 'Generate P&L Statement'}
        </button>
        
        <button
          onClick={handleGetFinancialAdvice}
          disabled={isGettingAdvice || !userId}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed mr-3"
        >
          {isGettingAdvice ? 'Getting Advice...' : 'Get Financial Advice'}
        </button>

        <button
          onClick={handleGenerateEmbeddings}
          disabled={!userId || reports.length === 0}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate Embeddings
        </button>
      </div>

      {reports.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Previous P&L Reports</h2>
          <div className="space-y-2">
            {reports.map((report) => (
              <div key={report._id} className="bg-gray-50 p-3 rounded border">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{report.filename}</p>
                    <p className="text-sm text-gray-600">
                      Generated: {new Date(report.generated_at).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Transactions: {report.transaction_count} | 
                      Net Income: RM {report.net_income.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadReport(report._id, report.filename)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {financialAdvice && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Financial Advice</h2>
          <div className="bg-blue-50 p-4 rounded border border-blue-200">
            <div className="whitespace-pre-wrap text-sm">
              {financialAdvice}
            </div>
          </div>
        </div>
      )}

      <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm whitespace-pre-wrap">
        {JSON.stringify(transactions, null, 2)}
      </pre>
    </div>
  );
}

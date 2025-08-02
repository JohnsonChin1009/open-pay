import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.query.user_id as string;

  if (!userId) {
    return res.status(400).json({ error: "Missing user_id" });
  }

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const income = transactions.filter(t => t.transaction_type === "income");
  const expenses = transactions.filter(t => t.transaction_type === "expense");
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const netIncome = totalIncome - totalExpenses;

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Profit & Loss Statement", 14, 20);

  doc.setFontSize(10);
  doc.text(`Generated on ${new Date().toISOString().slice(0, 19).replace("T", " ")}`, 14, 28);

  // Table of transactions
  const tableData = transactions.map((t) => [
    t.transaction_type,
    `RM ${t.amount.toFixed(2)}`,
    t.category,
    t.description || "-",
    t.payment_method
  ]);

  autoTable(doc, {
    head: [["Type", "Amount", "Category", "Description", "Method"]],
    body: tableData,
    startY: 35,
  });

  const finalY = (doc as any).lastAutoTable.finalY || 50;

  // Summary Section
  doc.setFontSize(12);
  doc.text(`Total Income: RM ${totalIncome.toFixed(2)}`, 14, finalY + 10);
  doc.text(`Total Expenses: RM ${totalExpenses.toFixed(2)}`, 14, finalY + 18);
  doc.text(`Net Income: RM ${netIncome.toFixed(2)}`, 14, finalY + 26);

  const pdfOutput = doc.output("blob");
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=pnl_statement.pdf");
  res.status(200).send(pdfOutput);
}

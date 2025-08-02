import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { supabase } from "@/lib/supabase";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { GoogleGenerativeAI } from "@google/generative-ai";

const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri);

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

type PnLDocument = {
  user_id: string;
  filename: string;
  generated_at: Date;
  total_income: number;
  total_expenses: number;
  net_income: number;
  pdf_buffer: Buffer;
  transaction_count: number;
  period: {
    start_date: string;
    end_date: string;
  };
};

// Function to generate embeddings from P&L data
async function generatePnLEmbedding(pnlData: {
  user_id: string;
  total_income: number;
  total_expenses: number;
  net_income: number;
  transaction_count: number;
  period: { start_date: string; end_date: string };
}): Promise<number[]> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

    const textRepresentation = `
    Financial Profile Summary:
    User ID: ${pnlData.user_id}
    Analysis Period: ${pnlData.period.start_date} to ${pnlData.period.end_date}
    
    Financial Performance:
    - Total Income: ${pnlData.total_income.toFixed(2)}
    - Total Expenses: ${pnlData.total_expenses.toFixed(2)}
    - Net Income: ${pnlData.net_income.toFixed(2)}
    - Profit Margin: ${((pnlData.net_income / pnlData.total_income) * 100).toFixed(2)}%
    - Transaction Volume: ${pnlData.transaction_count} transactions
    
    Financial Health Indicators:
    - Expense-to-Income Ratio: ${((pnlData.total_expenses / pnlData.total_income) * 100).toFixed(2)}%
    - Financial Status: ${pnlData.net_income > 0 ? 'Profitable' : 'Operating at Loss'}
    `;

    const embeddingResp = await embeddingModel.embedContent({
      content: {
        parts: [{ text: textRepresentation }],
        role: "user",
      },
    });

    return embeddingResp.embedding.values;
  } catch (error) {
    console.error("Error generating P&L embedding:", error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const { user_id, period_start, period_end } = await req.json();

    if (!user_id) {
      return NextResponse.json(
        { error: "Missing user_id in request body" },
        { status: 400 }
      );
    }

    // Fetch transactions from Supabase
    let query = supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user_id)
      .order("timestamp", { ascending: false });

    // Apply date filters if provided
    if (period_start) {
      query = query.gte("timestamp", period_start);
    }
    if (period_end) {
      query = query.lte("timestamp", period_end);
    }

    const { data: transactions, error } = await query;

    console.log(`🔍 P&L Generation for user ${user_id}:`);
    console.log(`   📊 Found ${transactions?.length || 0} transactions`);
    console.log(`   🗓️ Period: ${period_start || 'All time'} to ${period_end || 'Present'}`);

    if (error) {
      console.error("Supabase Fetch Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!transactions || transactions.length === 0) {
      return NextResponse.json(
        { error: "No transactions found for the specified period" },
        { status: 404 }
      );
    }

    // Calculate P&L metrics
    const income = transactions.filter((t: Transaction) => t.transaction_type === "income");
    const expenses = transactions.filter((t: Transaction) => t.transaction_type === "expense");
    const totalIncome = income.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    const netIncome = totalIncome - totalExpenses;

    // Generate PDF
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.text("Profit & Loss Statement", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 28);
    
    if (period_start || period_end) {
      const periodText = `Period: ${period_start || 'All time'} to ${period_end || 'Present'}`;
      doc.text(periodText, 14, 35);
    }

    // Transaction table
    const tableData = transactions.map((t: Transaction) => [
      t.transaction_type,
      `${t.currency} ${t.amount.toFixed(2)}`,
      t.category,
      t.description || "-",
      t.payment_method,
      new Date(t.timestamp).toLocaleDateString()
    ]);

    autoTable(doc, {
      head: [["Type", "Amount", "Category", "Description", "Method", "Date"]],
      body: tableData,
      startY: period_start || period_end ? 42 : 35,
    });

    // Summary
    const finalY = (doc as any).lastAutoTable?.finalY || 50;
    doc.setFontSize(12);
    doc.text(`Total Income: ${transactions[0]?.currency || 'RM'} ${totalIncome.toFixed(2)}`, 14, finalY + 10);
    doc.text(`Total Expenses: ${transactions[0]?.currency || 'RM'} ${totalExpenses.toFixed(2)}`, 14, finalY + 18);
    doc.text(`Net Income: ${transactions[0]?.currency || 'RM'} ${netIncome.toFixed(2)}`, 14, finalY + 26);

    // Convert PDF to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `pnl_${user_id}_${timestamp}.pdf`;

    // Store in MongoDB
    await client.connect();
    const database = client.db("openpay");
    const collection = database.collection("pnl_reports");

    const pnlDocument: PnLDocument = {
      user_id,
      filename,
      generated_at: new Date(),
      total_income: totalIncome,
      total_expenses: totalExpenses,
      net_income: netIncome,
      pdf_buffer: pdfBuffer,
      transaction_count: transactions.length,
      period: {
        start_date: period_start || transactions[transactions.length - 1]?.timestamp || '',
        end_date: period_end || transactions[0]?.timestamp || ''
      }
    };

    const result = await collection.insertOne(pnlDocument);

    // Generate and store embedding for RAG system
    try {
      const embedding = await generatePnLEmbedding({
        user_id,
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_income: netIncome,
        transaction_count: transactions.length,
        period: {
          start_date: period_start || transactions[transactions.length - 1]?.timestamp || '',
          end_date: period_end || transactions[0]?.timestamp || ''
        }
      });

      // Store in embeddings collection for RAG
      const embeddingsCollection = database.collection("embeddings");
      await embeddingsCollection.insertOne({
        text_chunk: `P&L Report for User ${user_id}`,
        text: `Financial report generated on ${new Date().toISOString()}`,
        embedding,
        metadata: {
          type: "pnl_report",
          user_id,
          report_id: result.insertedId,
          total_income: totalIncome,
          total_expenses: totalExpenses,
          net_income: netIncome,
          transaction_count: transactions.length,
          generated_at: new Date(),
          period: {
            start_date: period_start || transactions[transactions.length - 1]?.timestamp || '',
            end_date: period_end || transactions[0]?.timestamp || ''
          }
        }
      });

      console.log("✅ P&L embedding generated and stored for RAG system");
    } catch (embeddingError) {
      console.error("❌ Error generating embedding (P&L report still saved):", embeddingError);
      // Don't fail the entire request if embedding fails
    }

    return NextResponse.json({
      success: true,
      data: {
        report_id: result.insertedId,
        filename,
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_income: netIncome,
        transaction_count: transactions.length,
        generated_at: pnlDocument.generated_at
      }
    });

  } catch (error) {
    console.error("❌ Error generating P&L report:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

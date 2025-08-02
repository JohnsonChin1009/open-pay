import { NextRequest, NextResponse } from "next/server";
import { searchRelevantChunks, SearchResult } from "@/lib/vectorSearch";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MongoClient } from "mongodb";
import { supabase } from "@/lib/supabase";

const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri);

// Helper function to get user's P&L data from MongoDB
async function getUserPnLData(userId: string) {
  try {
    await client.connect();
    const database = client.db("openpay");
    const embeddingsCollection = database.collection("embeddings");
    
    const userPnLData = await embeddingsCollection
      .find({ 
        "metadata.user_id": userId,
        "metadata.type": "pnl_report"
      })
      .sort({ "metadata.generated_at": -1 })
      .limit(2)
      .toArray();

    return userPnLData;
  } catch (error) {
    console.error("Error fetching user P&L data:", error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, user_id } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: "Question is required and must be a string" },
        { status: 400 }
      );
    }

    // Check if user is asking to generate P&L
    const pnlKeywords = ['generate p&l', 'create p&l', 'generate pnl', 'create pnl', 'p&l statement', 'pnl statement', 'profit and loss', 'generate my p&l', 'create my p&l'];
    const isRequestingPnL = pnlKeywords.some(keyword => 
      question.toLowerCase().includes(keyword.toLowerCase())
    );

    // Get user ID from session if not provided
    let actualUserId = user_id;
    if (!actualUserId) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        actualUserId = session?.user?.id;
      } catch {
        console.log("No active session found");
      }
    }

    // If user is requesting P&L generation, handle the complete workflow
    if (isRequestingPnL && actualUserId) {
      try {
        // First check if user has transactions using get-transaction-by-user API
        const transactionsResponse = await fetch(`${request.nextUrl.origin}/api/get-transaction-by-user?user_id=${actualUserId}`);
        const transactionsResult = await transactionsResponse.json();
        
        if (!transactionsResult.success || !transactionsResult.data || transactionsResult.data.length === 0) {
          return NextResponse.json({
            success: true,
            question,
            answer: `❌ **No Financial Data Available**\n\nI couldn't find any transaction data for your account. To generate a P&L statement and provide personalized financial advice, you'll need to:\n\n1. **Add some transactions** to your account first\n2. **Then ask me to generate your P&L** again\n\nOnce you have transaction data, I'll be able to create detailed financial reports and provide tailored loan recommendations!`
          });
        }

        // User has transactions, always generate fresh P&L with latest data
        console.log(`🔄 Generating fresh P&L for user ${actualUserId} with ${transactionsResult.data.length} transactions`);
        
        const pnlResponse = await fetch(`${request.nextUrl.origin}/api/generate-pnl`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: actualUserId })
        });

        const pnlResult = await pnlResponse.json();

        if (pnlResult.success) {
          const answer = `✅ **P&L Statement Generated Successfully!**

📊 **Your Financial Summary:**
- **Total Income:** RM ${pnlResult.data.total_income.toFixed(2)}
- **Total Expenses:** RM ${pnlResult.data.total_expenses.toFixed(2)}
- **Net Income:** RM ${pnlResult.data.net_income.toFixed(2)}
- **Transactions Analyzed:** ${pnlResult.data.transaction_count}

📄 **Report Details:**
- **Status:** Freshly Generated with Latest Data
- **Generated:** ${new Date(pnlResult.data.generated_at).toLocaleString()}

💡 **What's Next?**
Your P&L data has been automatically added to my knowledge base. You can now ask me questions like:
- "What loans am I qualified for based on my financial situation?"
- "Should I apply for a business loan?"
- "How can I improve my financial health?"

I'll provide personalized recommendations based on your actual financial data!`;

          return NextResponse.json({
            success: true,
            question,
            answer
          });
        } else {
          return NextResponse.json({
            success: true,
            question,
            answer: `❌ **Unable to generate P&L statement**\n\nError: ${pnlResult.error}\n\nPlease make sure you have transaction data available and try again.`
          });
        }
      } catch (error) {
        console.error("Error in P&L generation workflow:", error);
        return NextResponse.json({
          success: true,
          question,
          answer: `❌ **Error processing P&L request**\n\nI encountered an issue while processing your P&L request. Please try again later.`
        });
      }
    }

    // Step 1: Get relevant chunks from vector search (general knowledge)
    const relevantChunks: SearchResult[] = await searchRelevantChunks(question, 5);
    
    // Step 2: Get user's financial context if user_id is provided
    let userFinancialContext = "";
    
    if (actualUserId) {
      try {
        await client.connect();
        const database = client.db("openpay");
        const embeddingsCollection = database.collection("embeddings");
        
        // Find P&L embeddings for this user
        const userPnLData = await embeddingsCollection
          .find({ 
            "metadata.user_id": actualUserId,
            "metadata.type": "pnl_report"
          })
          .sort({ "metadata.generated_at": -1 })
          .limit(2) // Get the 2 most recent P&L reports
          .toArray();

        if (userPnLData.length > 0) {
          const latestReport = userPnLData[0].metadata;
          
          userFinancialContext = `

USER'S FINANCIAL PROFILE:
Latest P&L Report (${new Date(latestReport.generated_at).toLocaleDateString()}):
- Net Income: RM ${latestReport.net_income.toFixed(2)}
- Total Income: RM ${latestReport.total_income.toFixed(2)}
- Total Expenses: RM ${latestReport.total_expenses.toFixed(2)}
- Transaction Count: ${latestReport.transaction_count}
- Financial Status: ${latestReport.net_income > 0 ? 'PROFITABLE' : 'OPERATING AT LOSS'}

`;
        }
      } catch (error) {
        console.error("Error fetching user P&L data:", error);
      }
    }

    // Step 3: Combine general context with user's financial data
    const generalContext = relevantChunks.length > 0 
      ? relevantChunks
          .map((chunk, index) => {
            const text = chunk.text_chunk || chunk.text || '';
            return `[${index + 1}] ${text}`;
          })
          .join('\n\n')
      : "";

    // Step 4: Create enhanced prompt for financial advice
    const prompt = `You are a professional financial advisor specializing in Malaysian financial products and loans. Provide helpful, personalized advice based on the context provided.

${generalContext ? `GENERAL KNOWLEDGE:\n${generalContext}\n` : ''}
${userFinancialContext}

INSTRUCTIONS:
- If user has financial data, provide personalized recommendations based on their actual situation
- Focus on Malaysian financial products and loan options
- Be specific about loan eligibility and requirements
- Provide actionable advice

USER QUESTION: ${question}

RESPONSE:`;

    // Step 5: Generate answer using Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        maxOutputTokens: 1500,
        temperature: 0.7,
      },
    });

    const response = result.response;
    const answer = response.text();

    return NextResponse.json({
      success: true,
      question,
      answer
    });

  } catch (error) {
    console.error("Error in /api/ask:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to generate answer",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

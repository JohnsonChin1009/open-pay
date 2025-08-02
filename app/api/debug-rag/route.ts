// Create this as: app/api/debug-rag/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MongoClient } from "mongodb";

const mongoUri = process.env.MONGODB_URI!;
const dbName = "openpay";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  console.log("🔍 Debug RAG request:", prompt);

  try {
    // Step 1: Try basic Gemini response first
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not set" },
        { status: 500 },
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Step 2: Try to generate embedding
    console.log("📝 Generating embedding...");
    let embedding: number[];

    try {
      const embeddingModel = genAI.getGenerativeModel({
        model: "embedding-001",
      });
      const embeddingResult = await embeddingModel.embedContent(prompt);
      embedding = embeddingResult.embedding.values;
      console.log(`✅ Embedding generated: ${embedding.length} dimensions`);
    } catch (embError) {
      console.error("❌ Embedding generation failed:", embError);
      return await fallbackResponse(genAI, prompt);
    }

    // Step 3: Try vector search
    console.log("🔍 Attempting vector search...");
    let chunks: any[] = [];

    try {
      chunks = await performVectorSearch(embedding);
      console.log(`✅ Vector search completed: ${chunks.length} chunks found`);
    } catch (searchError) {
      console.error("❌ Vector search failed:", searchError);
      console.log("🔄 Falling back to basic response...");
      return await fallbackResponse(genAI, prompt);
    }

    // Step 4: Generate response
    if (chunks.length > 0) {
      console.log("📚 Generating RAG response...");
      const response = await generateRAGResponse(genAI, prompt, chunks);

      return NextResponse.json({
        success: true,
        type: "rag_response",
        text: response,
        chunksFound: chunks.length,
        debug: {
          embeddingDimensions: embedding.length,
          searchSuccess: true,
        },
      });
    } else {
      console.log("📝 No relevant chunks found, using fallback...");
      const response = await fallbackResponse(genAI, prompt);
      return response;
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 },
    );
  }
}

async function performVectorSearch(queryVector: number[]): Promise<any[]> {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("embeddings");

    // First, check if collection has data
    const count = await collection.countDocuments({});
    console.log(`📊 Collection has ${count} documents`);

    if (count === 0) {
      throw new Error("No documents in embeddings collection");
    }

    // Try the vector search
    const results = await collection
      .aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: queryVector,
            numCandidates: 100,
            limit: 5,
          },
        },
        {
          $addFields: {
            score: { $meta: "vectorSearchScore" },
          },
        },
        {
          $project: {
            content: 1,
            metadata: 1,
            score: 1,
          },
        },
      ])
      .toArray();

    return results;
  } finally {
    await client.close();
  }
}

async function generateRAGResponse(
  genAI: GoogleGenerativeAI,
  prompt: string,
  chunks: any[],
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const context = chunks.map((chunk) => chunk.content).join("\n\n");

  const systemPrompt = `You are a helpful assistant. Use the following context to answer the user's question about SME microfinancing and business topics.

Context:
${context}

Please provide a comprehensive answer based on this context. If the context doesn't fully address the question, mention what information is available and suggest what additional details might be helpful.`;

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
    ],
  });

  const result = await chat.sendMessage(prompt);
  return await result.response.text();
}

async function fallbackResponse(
  genAI: GoogleGenerativeAI,
  prompt: string,
): Promise<NextResponse> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const systemPrompt = `You are a helpful assistant specializing in SME (Small and Medium Enterprise) business topics, microfinancing, and business development. Provide helpful information based on your general knowledge.`;

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
    ],
  });

  const result = await chat.sendMessage(prompt);
  const text = await result.response.text();

  return NextResponse.json({
    success: true,
    type: "fallback_response",
    text: text,
    debug: {
      usedRAG: false,
      reason: "Vector search unavailable",
    },
  });
}

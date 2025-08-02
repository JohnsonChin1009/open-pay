// Create this as: app/api/detailed-diagnostics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { GoogleGenerativeAI } from "@google/generative-ai";

const mongoUri = process.env.MONGODB_URI!;
const dbName = "openpay";

export async function POST(req: NextRequest) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    tests: [] as any[],
    summary: {
      mongoConnection: false,
      geminiApi: false,
      embeddingGeneration: false,
      vectorSearchIndex: false,
      actualSearch: false
    }
  };

  // Test 1: MongoDB Connection
  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("embeddings");
    const count = await collection.countDocuments({});
    await client.close();
    
    diagnostics.tests.push({
      test: "MongoDB Connection",
      status: "✅ PASS",
      details: `Connected successfully. Found ${count} documents.`
    });
    diagnostics.summary.mongoConnection = true;
  } catch (error) {
    diagnostics.tests.push({
      test: "MongoDB Connection", 
      status: "❌ FAIL",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }

  // Test 2: Gemini API
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not found");
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Hello");
    const text = await result.response.text();
    
    diagnostics.tests.push({
      test: "Gemini API (Text Generation)",
      status: "✅ PASS", 
      details: `Generated ${text.length} characters`
    });
    diagnostics.summary.geminiApi = true;
  } catch (error) {
    diagnostics.tests.push({
      test: "Gemini API (Text Generation)",
      status: "❌ FAIL",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }

  // Test 3: Embedding Generation
  let queryEmbedding: number[] = [];
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await embeddingModel.embedContent("SME microfinancing test");
    queryEmbedding = result.embedding.values;
    
    diagnostics.tests.push({
      test: "Embedding Generation",
      status: "✅ PASS",
      details: `Generated ${queryEmbedding.length}D embedding`
    });
    diagnostics.summary.embeddingGeneration = true;
  } catch (error) {
    diagnostics.tests.push({
      test: "Embedding Generation",
      status: "❌ FAIL", 
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }

  // Test 4: Check Document Embedding Dimensions
  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("embeddings");
    
    const sampleDoc = await collection.findOne({});
    if (sampleDoc?.embedding) {
      const docEmbeddingLength = sampleDoc.embedding.length;
      const queryEmbeddingLength = queryEmbedding.length;
      const dimensionsMatch = docEmbeddingLength === queryEmbeddingLength;
      
      diagnostics.tests.push({
        test: "Embedding Dimension Compatibility",
        status: dimensionsMatch ? "✅ PASS" : "⚠️ MISMATCH",
        details: `Document: ${docEmbeddingLength}D, Query: ${queryEmbeddingLength}D`,
        recommendation: dimensionsMatch ? 
          "Dimensions match - good!" : 
          `You need to either:
          1. Create Vector Search index with ${docEmbeddingLength} dimensions
          2. Or re-generate document embeddings with current model (${queryEmbeddingLength}D)`
      });
    }
    await client.close();
  } catch (error) {
    diagnostics.tests.push({
      test: "Embedding Dimension Check",
      status: "❌ FAIL",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }

  // Test 5: Vector Search Index Check
  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("embeddings");
    
    // Try to list search indexes (this requires Atlas Search)
    try {
      // This is a workaround to check if vector search works
      const testResult = await collection.aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding", 
            queryVector: Array(3072).fill(0.1), // Use 3072D dummy vector
            numCandidates: 10,
            limit: 1,
          },
        }
      ]).toArray();
      
      diagnostics.tests.push({
        test: "Vector Search Index (vector_index)",
        status: "✅ EXISTS",
        details: `Index is active and searchable`
      });
      diagnostics.summary.vectorSearchIndex = true;
      
    } catch (indexError: any) {
      if (indexError.message?.includes("index") || indexError.code === 6) {
        diagnostics.tests.push({
          test: "Vector Search Index (vector_index)",
          status: "❌ MISSING",
          details: "Vector Search index 'vector_index' does not exist or is not active",
          recommendation: "Create Atlas Vector Search index named 'vector_index' with 3072 dimensions"
        });
      } else {
        diagnostics.tests.push({
          test: "Vector Search Index (vector_index)",
          status: "❌ ERROR",
          error: indexError.message
        });
      }
    }
    
    await client.close();
  } catch (error) {
    diagnostics.tests.push({
      test: "Vector Search Index Check",
      status: "❌ FAIL",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }

  // Test 6: Actual Vector Search (if previous tests pass)
  if (diagnostics.summary.vectorSearchIndex && queryEmbedding.length > 0) {
    try {
      const client = new MongoClient(mongoUri);
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection("embeddings");
      
      // Use the correct dimensions for search
      const searchVector = queryEmbedding.length === 3072 ? 
        queryEmbedding : 
        Array(3072).fill(0.1); // Dummy vector if

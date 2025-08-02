// Create this as a separate file: lib/debugVectorSearch.ts
import { MongoClient } from "mongodb";
import { GoogleGenerativeAI } from "@google/generative-ai";

const mongoUri = process.env.MONGODB_URI!;
const dbName = "openpay";

export async function debugVectorSearch() {
  console.log("🔍 Starting vector search debug...");

  // Step 1: Test MongoDB connection
  console.log("1. Testing MongoDB connection...");
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log("✅ MongoDB connected successfully");

    const db = client.db(dbName);
    const collection = db.collection("embeddings");

    // Check if collection exists and has documents
    const count = await collection.countDocuments({});
    console.log(`✅ Collection 'embeddings' has ${count} documents`);

    if (count === 0) {
      console.log("❌ No documents found in embeddings collection");
      return false;
    }

    // Sample a document to check structure
    const sampleDoc = await collection.findOne({});
    console.log("📄 Sample document structure:", {
      hasContent: !!sampleDoc?.content,
      hasEmbedding: !!sampleDoc?.embedding,
      embeddingLength: sampleDoc?.embedding?.length,
      contentPreview: sampleDoc?.content?.substring(0, 100) + "...",
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    return false;
  } finally {
    await client.close();
  }

  // Step 2: Test Gemini API
  console.log("2. Testing Gemini API...");

  if (!process.env.GEMINI_API_KEY) {
    console.log("❌ GEMINI_API_KEY not found");
    return false;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "embedding-001" });

    const result = await model.embedContent("test embedding");
    console.log(
      `✅ Gemini API working - embedding dimensions: ${result.embedding.values.length}`,
    );
  } catch (error) {
    console.error("❌ Gemini API failed:", error);
    return false;
  }

  // Step 3: Test Vector Search Index
  console.log("3. Testing vector search...");

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("embeddings");

    // Generate test embedding
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const embeddingResult = await model.embedContent(
      "SME microfinancing options",
    );
    const queryVector = embeddingResult.embedding.values;

    // Try simple vector search
    const results = await collection
      .aggregate([
        {
          $vectorSearch: {
            index: "vector_index", // Make sure this matches your index name
            path: "embedding",
            queryVector: queryVector,
            numCandidates: 100,
            limit: 3,
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
            score: 1,
          },
        },
      ])
      .toArray();

    console.log(
      `✅ Vector search successful - found ${results.length} results`,
    );

    if (results.length > 0) {
      console.log("🎯 Best match:", {
        score: results[0].score,
        contentPreview: results[0].content?.substring(0, 100) + "...",
      });
    }

    return true;
  } catch (error) {
    console.error("❌ Vector search failed:", error);

    // Check if it's an index issue
    if (error.message?.includes("index")) {
      console.log(
        "💡 This looks like a vector search index issue. Please check:",
      );
      console.log("   - Is your Atlas Search index created?");
      console.log("   - Is the index name 'vector_index'?");
      console.log("   - Is the index built and active?");
    }

    return false;
  } finally {
    await client.close();
  }
}

// Simple test without vector search
export async function testBasicRAG() {
  console.log("🧪 Testing basic RAG without vector search...");

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const mockContext = `
    SME Microfinancing Options:
    1. Government grants for small businesses
    2. Bank loans for SMEs with collateral
    3. Peer-to-peer lending platforms
    4. Microfinance institutions
    `;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            { text: `You are an assistant. Use this context: ${mockContext}` },
          ],
        },
      ],
    });

    const result = await chat.sendMessage(
      "Can you tell me about SME microfinancing options?",
    );
    const response = await result.response.text();

    console.log("✅ Basic RAG test successful");
    console.log("📝 Response:", response.substring(0, 200) + "...");

    return true;
  } catch (error) {
    console.error("❌ Basic RAG test failed:", error);
    return false;
  }
}

// Export a simple test function
export async function runDiagnostics() {
  console.log("🚀 Running full RAG diagnostics...\n");

  const mongoTest = await debugVectorSearch();
  const basicTest = await testBasicRAG();

  console.log("\n📊 Diagnostic Summary:");
  console.log(`Vector Search: ${mongoTest ? "✅ Working" : "❌ Failed"}`);
  console.log(`Basic RAG: ${basicTest ? "✅ Working" : "❌ Failed"}`);

  if (!mongoTest) {
    console.log("\n💡 Next steps:");
    console.log("1. Check your MongoDB Atlas Vector Search index");
    console.log("2. Verify your embeddings collection has data");
    console.log("3. Ensure index name matches your code");
  }
}

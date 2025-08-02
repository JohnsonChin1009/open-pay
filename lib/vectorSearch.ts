import { MongoClient } from "mongodb";
import { GoogleGenerativeAI } from "@google/generative-ai";

const mongoUri = process.env.MONGODB_URI!;
const dbName = "openpay";

// Updated interface to match your actual data structure
export interface DocumentChunk {
  _id?: any;
  text_chunk: string; // Your field is called 'text_chunk', not 'content'
  embedding: number[];
  file_name?: string;
  source?: string;
  chunk_index?: number;
  score?: number;
}

// You need to use the same embedding model that created your 3072-dimensional embeddings
// This might be a different model or a different version
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Try different embedding models to match your 3072 dimensions
  // You might need to use a different model than "embedding-001"
  try {
    // First try the standard model
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent(text);

    console.log(
      `Generated embedding dimensions: ${result.embedding.values.length}`,
    );

    // If dimensions don't match, we need to handle this
    if (result.embedding.values.length !== 3072) {
      console.warn(
        `Dimension mismatch: Generated ${result.embedding.values.length}, expected 3072`,
      );
      // You might need to pad or use a different model
    }

    return result.embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error(`Failed to generate embedding: ${error}`);
  }
}

export async function searchRelevantChunks(
  query: string,
  topK: number = 5,
  minScore: number = 0.5,
): Promise<DocumentChunk[]> {
  const client = new MongoClient(mongoUri);

  try {
    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("embeddings");

    console.log(
      `Searching with ${queryEmbedding.length}D embedding for: "${query}"`,
    );

    const results = await collection
      .aggregate([
        {
          $vectorSearch: {
            index: "vector_index", // This must match your Atlas index name
            path: "embedding",
            queryVector: queryEmbedding,
            numCandidates: Math.max(topK * 10, 100),
            limit: topK,
          },
        },
        {
          $addFields: {
            score: { $meta: "vectorSearchScore" },
          },
        },
        {
          $match: {
            score: { $gte: minScore },
          },
        },
        {
          $project: {
            text_chunk: 1, // Use correct field name
            file_name: 1,
            source: 1,
            chunk_index: 1,
            score: 1,
          },
        },
      ])
      .toArray();

    console.log(`Vector search found ${results.length} results`);

    return results as DocumentChunk[];
  } catch (error) {
    console.error("Vector search error:", error);

    // Fallback to text search using your actual field names
    try {
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection("embeddings");

      const textResults = await collection
        .find({
          text_chunk: { $regex: query, $options: "i" },
        })
        .limit(topK)
        .toArray();

      console.log(`Text fallback found ${textResults.length} results`);

      return textResults.map((doc: any) => ({
        ...doc,
        score: 0.5,
      })) as DocumentChunk[];
    } catch (fallbackError) {
      console.error("Text fallback also failed:", fallbackError);
      return [];
    }
  } finally {
    await client.close();
  }
}

// Test function to check embedding compatibility
export async function testEmbeddingCompatibility(): Promise<void> {
  try {
    const testEmbedding = await generateEmbedding("test query");
    console.log(`Generated embedding dimensions: ${testEmbedding.length}`);

    const client = new MongoClient(mongoUri);
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection("embeddings");

    const sampleDoc = await collection.findOne({});
    if (sampleDoc?.embedding) {
      console.log(
        `Document embedding dimensions: ${sampleDoc.embedding.length}`,
      );

      if (testEmbedding.length === sampleDoc.embedding.length) {
        console.log("✅ Embedding dimensions match!");
      } else {
        console.log("❌ Embedding dimensions don't match!");
        console.log("You need to either:");
        console.log(
          "1. Re-generate your document embeddings with the current model",
        );
        console.log(
          "2. Find the original model used to create 3072D embeddings",
        );
        console.log(
          "3. Update your Atlas Vector Search index to use 768 dimensions",
        );
      }
    }

    await client.close();
  } catch (error) {
    console.error("Compatibility test failed:", error);
  }
}

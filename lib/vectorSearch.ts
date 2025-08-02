/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoClient } from "mongodb";
import { GoogleGenerativeAI } from "@google/generative-ai";

const mongoUri = process.env.MONGODB_URI!;
const client = new MongoClient(mongoUri);
const dbName = "openpay";

export interface SearchResult {
  text_chunk: string;
  _id: string;
  text: string;
  metadata?: any;
  score: number;
}

export async function searchRelevantChunks(userPrompt: string, topK = 5): Promise<SearchResult[]> {
  try {
    // Step 1: Embed the user prompt using the CORRECT model that matches your data
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    // Use gemini-embedding-001 which produces 3072-dimensional embeddings
    const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    
    const embeddingResp = await embeddingModel.embedContent({
      content: {
        parts: [{ text: userPrompt }],
        role: "user",
      },
    });
    
    const queryEmbedding = embeddingResp.embedding.values;
    console.log(`Query embedding dimension: ${queryEmbedding.length}`); // Should be 3072

    // Step 2: Perform vector search
    await client.connect();
    const db = client.db(dbName);
    const embeddingsCol = db.collection("embeddings");
    
    const results = await embeddingsCol
      .aggregate([
        {
          $vectorSearch: {
            index: "vector_index", // make sure this matches your actual index name
            path: "embedding",
            queryVector: queryEmbedding,
            numCandidates: 100,
            limit: topK,
          },
        },
        {
          $project: {
            _id: 1,
            text_chunk: 1, // Use the correct field name from your schema
            text: "$text_chunk", // Map to consistent field name
            metadata: 1,
            file_name: 1,
            chunk_index: 1,
            score: { $meta: "vectorSearchScore" }
          }
        }
      ])
      .toArray();

    await client.close();
    console.log(`Found ${results.length} relevant chunks`);
    return results as SearchResult[];
  } catch (error) {
    console.error("Error in searchRelevantChunks:", error);
    await client.close();
    throw error;
  }
}
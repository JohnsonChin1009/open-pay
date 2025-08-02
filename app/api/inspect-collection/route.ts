// Create this as: app/api/inspect-collection/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const mongoUri = process.env.MONGODB_URI!;
const dbName = "openpay";

export async function GET(req: NextRequest) {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("embeddings");

    // Get all documents to inspect their structure
    const documents = await collection.find({}).limit(5).toArray();

    const inspection = documents.map((doc, index) => ({
      index,
      id: doc._id,
      hasContent: !!doc.content,
      contentLength: doc.content?.length || 0,
      contentPreview: doc.content?.substring(0, 100) + "...",
      hasEmbedding: !!doc.embedding,
      embeddingType: Array.isArray(doc.embedding)
        ? "array"
        : typeof doc.embedding,
      embeddingLength: doc.embedding?.length || 0,
      embeddingPreview: doc.embedding?.slice(0, 5), // First 5 values
      metadata: doc.metadata,
      allFields: Object.keys(doc),
    }));

    // Also check indexes
    const indexes = await collection.listIndexes().toArray();

    return NextResponse.json({
      success: true,
      collectionName: "embeddings",
      documentCount: documents.length,
      documents: inspection,
      indexes: indexes.map((idx) => ({
        name: idx.name,
        key: idx.key,
        type: idx.type || "regular",
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}

// Test vector search with different parameters
export async function POST(req: NextRequest) {
  const { testQuery = "SME microfinancing" } = await req.json();

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("embeddings");

    // Generate test embedding
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
    const embeddingResult = await embeddingModel.embedContent(testQuery);
    const queryVector = embeddingResult.embedding.values;

    console.log(
      `Generated embedding for "${testQuery}": ${queryVector.length} dimensions`,
    );

    // Test different index names and configurations
    const indexNames = ["vector_index", "default", "embeddings_vector_index"];
    const results = [];

    for (const indexName of indexNames) {
      try {
        console.log(`Testing with index: ${indexName}`);

        const searchResults = await collection
          .aggregate([
            {
              $vectorSearch: {
                index: indexName,
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
                metadata: 1,
              },
            },
          ])
          .toArray();

        results.push({
          indexName,
          success: true,
          resultCount: searchResults.length,
          results: searchResults.map((r) => ({
            score: r.score,
            contentPreview: r.content?.substring(0, 100) + "...",
            metadata: r.metadata,
          })),
        });

        console.log(`✅ Index ${indexName}: ${searchResults.length} results`);
      } catch (error) {
        results.push({
          indexName,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        console.log(`❌ Index ${indexName} failed:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      testQuery,
      embeddingDimensions: queryVector.length,
      indexTests: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}

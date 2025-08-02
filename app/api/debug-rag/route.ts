/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { GoogleGenerativeAI } from "@google/generative-ai";

const mongoUri = process.env.MONGODB_URI!;
const client = new MongoClient(mongoUri);
const dbName = "openpay";

export async function GET() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const embeddingsCol = db.collection("embeddings");
    
    // Get collection stats
    const totalDocs = await embeddingsCol.countDocuments();
    
    // Get sample documents
    const sampleDocs = await embeddingsCol.find({}).limit(3).toArray();
    
    // Check indexes
    const indexes = await embeddingsCol.indexes();
    
    await client.close();
    
    return NextResponse.json({
      success: true,
      stats: {
        totalDocuments: totalDocs,
        sampleDocuments: sampleDocs.map(doc => ({
          _id: doc._id,
          file_name: doc.file_name,
          chunk_index: doc.chunk_index,
          hasTextChunk: !!doc.text_chunk,
          textPreview: doc.text_chunk?.substring(0, 100) + "...",
          hasEmbedding: !!doc.embedding,
          embeddingLength: doc.embedding?.length,
          uploaded_at: doc.uploaded_at
        })),
        indexes: indexes.map(idx => ({
          name: idx.name,
          key: idx.key
        }))
      }
    });
  } catch (error) {
    await client.close();
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query = "Johnson", testEmbedding = true } = body;
    
    const results: any = {
      query,
      steps: []
    };
    
    // Step 1: Test embedding generation
    if (testEmbedding) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        
        const embeddingResp = await embeddingModel.embedContent({
          content: {
            parts: [{ text: query }],
            role: "user",
          },
        });
        
        const queryEmbedding = embeddingResp.embedding.values;
        results.steps.push({
          step: "embedding_generation",
          success: true,
          dimension: queryEmbedding.length,
          sampleValues: queryEmbedding.slice(0, 5)
        });
      } catch (error) {
        results.steps.push({
          step: "embedding_generation",
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        });
        return NextResponse.json(results);
      }
    }
    
    // Step 2: Test MongoDB connection and basic search
    try {
      await client.connect();
      const db = client.db(dbName);
      const embeddingsCol = db.collection("embeddings");
      
      // Text search first
      const textSearchResults = await embeddingsCol.find({
        text_chunk: { $regex: query, $options: "i" }
      }).limit(3).toArray();
      
      results.steps.push({
        step: "text_search",
        success: true,
        resultsCount: textSearchResults.length,
        results: textSearchResults.map(doc => ({
          _id: doc._id,
          file_name: doc.file_name,
          textPreview: doc.text_chunk?.substring(0, 150) + "..."
        }))
      });
      
      // Vector search
      if (testEmbedding) {
        try {
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
          const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
          
          const embeddingResp = await embeddingModel.embedContent({
            content: {
              parts: [{ text: query }],
              role: "user",
            },
          });
          
          const queryEmbedding = embeddingResp.embedding.values;
          
          const vectorResults = await embeddingsCol.aggregate([
            {
              $vectorSearch: {
                index: "default",
                path: "embedding",
                queryVector: queryEmbedding,
                numCandidates: 100,
                limit: 5,
              },
            },
            {
              $project: {
                _id: 1,
                text_chunk: 1,
                file_name: 1,
                chunk_index: 1,
                score: { $meta: "vectorSearchScore" }
              }
            }
          ]).toArray();
          
          results.steps.push({
            step: "vector_search",
            success: true,
            resultsCount: vectorResults.length,
            results: vectorResults.map(doc => ({
              _id: doc._id,
              file_name: doc.file_name,
              score: doc.score,
              textPreview: doc.text_chunk?.substring(0, 150) + "..."
            }))
          });
        } catch (vectorError) {
          results.steps.push({
            step: "vector_search",
            success: false,
            error: vectorError instanceof Error ? vectorError.message : "Unknown vector search error"
          });
        }
      }
      
      await client.close();
    } catch (error) {
      await client.close();
      results.steps.push({
        step: "mongodb_connection",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
    
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
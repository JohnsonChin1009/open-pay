// Create this as: app/api/test-fixed-rag/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  searchRelevantChunks,
  testEmbeddingCompatibility,
} from "@/lib/fixedVectorSearch";
import { generateAnswer } from "@/lib/fixedGenerateAnswer";

export async function GET(req: NextRequest) {
  console.log("🧪 Testing embedding compatibility...");

  try {
    await testEmbeddingCompatibility();

    return NextResponse.json({
      success: true,
      message: "Check console for compatibility results",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const { prompt = "SME microfinancing options" } = await req.json();

  console.log(`🔍 Testing fixed RAG with query: "${prompt}"`);

  try {
    // Test the search
    const chunks = await searchRelevantChunks(prompt, 3, 0.3); // Lower threshold for testing
    console.log(`Found ${chunks.length} chunks`);

    if (chunks.length > 0) {
      console.log("Sample chunk:", {
        text_preview: chunks[0].text_chunk?.substring(0, 100) + "...",
        score: chunks[0].score,
        source: chunks[0].file_name || chunks[0].source,
      });

      // Generate answer
      const answer = await generateAnswer(prompt, chunks);

      return NextResponse.json({
        success: true,
        type: "rag_response",
        prompt,
        chunksFound: chunks.length,
        chunks: chunks.map((chunk) => ({
          preview: chunk.text_chunk?.substring(0, 150) + "...",
          score: chunk.score,
          source: chunk.file_name || chunk.source,
        })),
        answer,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json({
        success: true,
        type: "no_results",
        message:
          "No relevant chunks found. Check if Vector Search index is created and active.",
        chunksFound: 0,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Fixed RAG test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

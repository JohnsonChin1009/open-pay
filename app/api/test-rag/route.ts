// Create this as: app/api/test-rag/route.ts
import { NextRequest, NextResponse } from "next/server";
import { runDiagnostics } from "@/lib/debugVectorSearch";

export async function GET(req: NextRequest) {
  console.log("🧪 Running RAG diagnostics...");

  try {
    // Capture console output
    const logs: string[] = [];
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      logs.push(args.join(" "));
      originalLog(...args);
    };

    console.error = (...args) => {
      logs.push("ERROR: " + args.join(" "));
      originalError(...args);
    };

    // Run diagnostics
    await runDiagnostics();

    // Restore console
    console.log = originalLog;
    console.error = originalError;

    return NextResponse.json({
      success: true,
      logs: logs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
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

export async function POST(req: NextRequest) {
  const { test } = await req.json();

  // Simple test of individual components
  if (test === "embedding") {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "embedding-001" });

      const result = await model.embedContent("test");

      return NextResponse.json({
        success: true,
        dimensions: result.embedding.values.length,
        message: "Embedding generation working",
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

  if (test === "mongodb") {
    try {
      const { MongoClient } = await import("mongodb");
      const client = new MongoClient(process.env.MONGODB_URI!);

      await client.connect();
      const db = client.db("openpay");
      const collection = db.collection("embeddings");
      const count = await collection.countDocuments({});
      await client.close();

      return NextResponse.json({
        success: true,
        documentCount: count,
        message: "MongoDB connection working",
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

  return NextResponse.json(
    {
      success: false,
      error: "Invalid test type. Use 'embedding' or 'mongodb'",
    },
    { status: 400 },
  );
}

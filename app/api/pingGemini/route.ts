/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { generateAnswer } from "@/lib/generateAnswer";

export async function GET() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: "Hello, are you working?" }]
        }
      ]
    });

    const response = result.response.text();
    console.log("Gemini API Response:", response);

    return NextResponse.json({ 
      success: true, 
      message: "Gemini API is working",
      response: response
    });
  } catch (error) {
    console.error("Error pinging Gemini API:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to connect to Gemini API",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, history = [] } = body;

    // If no prompt provided, run the test instead
    if (!prompt) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      
      // Test both text generation and embedding
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });

      // Test text generation
      const textResult = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: "Hello, are you working?" }]
          }
        ]
      });

      // Test embedding
      const embeddingResp = await embeddingModel.embedContent({
        content: {
          parts: [{ text: "test embedding" }],
          role: "user",
        },
      });

      const embedding = embeddingResp.embedding.values;
      const textResponse = textResult.response.text();

      return NextResponse.json({ 
        success: true, 
        message: "Both Gemini APIs are working",
        textGeneration: {
          working: true,
          response: textResponse
        },
        embedding: {
          working: true,
          dimension: embedding.length,
          sampleValues: embedding.slice(0, 5) // Show first 5 values
        }
      });
    }

    // Handle chat conversation with RAG
    try {
      // First try to get answer from RAG system
      const ragAnswer = await generateAnswer(prompt);
      
      // If RAG returns a meaningful answer, use it
      if (ragAnswer && !ragAnswer.includes("couldn't find any relevant information")) {
        return NextResponse.json({
          success: true,
          text: ragAnswer,
          source: "rag"
        });
      }
    } catch (ragError) {
      console.log("RAG failed, falling back to direct Gemini:", ragError);
    }

    // Fallback to direct Gemini conversation
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build conversation history
    const contents: any[] = [];
    
    // Add history if provided
    for (let i = 0; i < history.length; i += 2) {
      if (history[i]) {
        contents.push({
          role: "user",
          parts: [{ text: history[i] }]
        });
      }
      if (history[i + 1]) {
        contents.push({
          role: "model",
          parts: [{ text: history[i + 1] }]
        });
      }
    }

    // Add current prompt
    contents.push({
      role: "user",
      parts: [{ text: prompt }]
    });

    const result = await model.generateContent({
      contents,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    const response = result.response.text();

    return NextResponse.json({
      success: true,
      text: response,
      source: "direct"
    });

  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to generate response",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchRelevantChunks, SearchResult } from "./vectorSearch";

export async function generateAnswer(userQuestion: string): Promise<string> {
  try {
    // Step 1: Get relevant chunks from vector search
    const relevantChunks: SearchResult[] = await searchRelevantChunks(userQuestion, 5);
    
    if (relevantChunks.length === 0) {
      return "I couldn't find any relevant information to answer your question.";
    }

    // Step 2: Combine chunks into context - use the correct field name
    const context = relevantChunks
      .map((chunk, index) => {
        // Use text_chunk if available, otherwise fall back to text
        const text = chunk.text_chunk || chunk.text || '';
        return `[${index + 1}] ${text}`;
      })
      .join('\n\n');

    // Step 3: Create prompt for answer generation
    const prompt = `Based on the following context, please answer the user's question. If the context doesn't contain enough information to answer the question, please say so.

Context:
${context}

Question: ${userQuestion}

Answer:`;

    // Step 4: Generate answer using Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating answer:", error);
    throw new Error("Failed to generate answer");
  }
}
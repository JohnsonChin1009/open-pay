import { GoogleGenerativeAI } from "@google/generative-ai";
import { DocumentChunk } from "./fixedVectorSearch"; // Updated import

export async function generateAnswer(
  prompt: string,
  chunks: DocumentChunk[],
  history: string[] = [],
): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000,
    },
  });

  // Format context using the correct field name
  const contextText =
    chunks.length > 0
      ? chunks
          .map((chunk, index) => {
            const source =
              chunk.file_name || chunk.source || `Document ${index + 1}`;
            return `[Source: ${source}]\n${chunk.text_chunk}`;
          })
          .join("\n\n")
      : "No relevant context found in the knowledge base.";

  const systemPrompt = `You are a helpful assistant specializing in SME (Small and Medium Enterprise) business topics, microfinancing, and business development. Use the context below to answer questions accurately.

Context from knowledge base:
${contextText}

Instructions:
- Answer based primarily on the provided context
- If the context doesn't fully answer the question, mention what information is available
- Be specific and cite sources when possible
- Maintain a professional, helpful tone
- If asked about topics not in the context, acknowledge the limitation

Found ${chunks.length} relevant document(s) to help answer the question.`;

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      ...history.map((text, i) => ({
        role: i % 2 === 0 ? ("user" as const) : ("model" as const),
        parts: [{ text }],
      })),
    ],
  });

  try {
    const result = await chat.sendMessage(prompt);
    const responseText = await result.response.text();

    // Add source information if available
    if (chunks.length > 0) {
      const sources = [
        ...new Set(
          chunks
            .map((chunk) => chunk.file_name || chunk.source)
            .filter(Boolean),
        ),
      ];

      if (sources.length > 0) {
        return responseText + `\n\n*Sources: ${sources.join(", ")}*`;
      }
    }

    return responseText;
  } catch (err) {
    console.error("Gemini response error:", err);
    return "I apologize, but I'm having trouble generating a response right now. Please try again or rephrase your question.";
  }
}

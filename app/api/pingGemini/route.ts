import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { prompt, history } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ error: "Gemini API key is not set." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({model: "gemini-2.0-flash"});

    try {
        const chat = model.startChat({
            history: history.map((text: string, i: number) => ({
                role: i % 2 === 0 ? "user" : "model",
                parts: [{ text }],
            }))
        })

        const result = await chat.sendMessage(prompt);
        const response = result.response;
        const text = response.text();
        
        const summaryPrompt = `Summarize the following response in 3-5 bullet points for a quick chatbot reply:\n\n${text}`;
        const summaryResult = await model.generateContent(summaryPrompt);
        const summarized = summaryResult.response.text();

        return NextResponse.json({ text: summarized });
    } catch (error) {
        console.error("Error in Gemini API:", error);
        return NextResponse.json({ error: "Failed to generate response." }, { status: 500 });
    }
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { prompt, history } = await req.json();

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "Gemini API key is not set." }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Known intents and their required fields
  const requiredFields = {
    transfer_funds: ["amount", "recipient", "bank_name"],
    check_loan_eligibility: ["ssm_number", "monthly_revenue"],
    apply_permit_or_loan: ["business_type", "permit_type", "location"],
  } as const;

  const validIntents = Object.keys(requiredFields) as (keyof typeof requiredFields)[];

  try {
    // Step 1: Start chat for intent detection
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text:
                "You are an intent recognition assistant. Based on the user message, detect their intent (only one of: transfer_funds, check_loan_eligibility, apply_permit_or_loan), and extract any provided fields. If not related to any intent, return:\n{ \"intent\": null, \"fields\": {} }",
            },
          ],
        },
        ...history.map((text: string, i: number) => ({
          role: i % 2 === 0 ? "user" : "model",
          parts: [{ text }],
        })),
      ],
    });

    const intentPrompt = `User message: "${prompt}".\nRespond strictly in this JSON format:\n{\n  "intent": "...",\n  "fields": {\n    "key1": "...",\n    "key2": "..." \n  }\n}`;
    const intentResult = await chat.sendMessage(intentPrompt);
    const intentText = await intentResult.response.text();

    let parsed: any;
    try {
      parsed = JSON.parse(intentText);
    } catch (err) {
      console.log("Failed to parse intent response:", err);
      const fallbackChat = model.startChat({
        history: [
          {
            role: "user",
            parts: [
              {
                text:
                  "You are a helpful and friendly assistant who summarizes answers clearly. Don't over-explain unless it's needed. Keep your responses concise and sound like a helpful friend. Always respond in the same language the user uses.",
              },
            ],
          },
          ...history.map((text: string, i: number) => ({
            role: i % 2 === 0 ? "user" : "model",
            parts: [{ text }],
          })),
        ],
      });

      const result = await fallbackChat.sendMessage(prompt);
      const text = await result.response.text();

      return NextResponse.json({ message: "General response", text });
    }

    const { intent, fields } = parsed;

    if (!intent || !validIntents.includes(intent)) {
      // Not a known intent, fallback to general assistant
      const fallbackChat = model.startChat({
        history: [
          {
            role: "user",
            parts: [
              {
                text:
                  "You are a helpful and friendly assistant who summarizes answers clearly. Don't over-explain unless it's needed. Keep your responses concise and sound like a helpful friend. Always respond in the same language the user uses.",
              },
            ],
          },
          ...history.map((text: string, i: number) => ({
            role: i % 2 === 0 ? "user" : "model",
            parts: [{ text }],
          })),
        ],
      });

      const result = await fallbackChat.sendMessage(prompt);
      const text = await result.response.text();

      return NextResponse.json({ message: "General response", text });
    }

    // Step 2: Check for missing fields
    const narrowedIntent = intent as keyof typeof requiredFields;
    const required = requiredFields[narrowedIntent];
    const providedKeys = Object.keys(fields || {});
    const missing = required.filter((key) => !providedKeys.includes(key));

    if (missing.length > 0) {
      return NextResponse.json({
        intent,
        missingFields: missing,
        message: `You're trying to ${intent.replace(/_/g, " ")}, but you're missing: ${missing.join(", ")}`,
      });
    }

    // Step 3: If all fields present, proceed with normal assistant response
    const finalChat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text:
                "You are a helpful and friendly assistant who summarizes answers clearly. Don't over-explain unless it's needed. Keep your responses concise and sound like a helpful friend. Only respond in the language used by the user, but limit replies strictly to English, Malay, or Chinese. If the user's message is in another language, respond in English instead. Keep your responses concise and friendly.",
            },
          ],
        },
        ...history.map((text: string, i: number) => ({
          role: i % 2 === 0 ? "user" : "model",
          parts: [{ text }],
        })),
      ],
    });

    const result = await finalChat.sendMessage(prompt);
    const text = await result.response.text();

    return NextResponse.json({
      intent,
      fields,
      message: "All required fields provided. Executing response...",
      text,
    });
  } catch (error) {
    console.error("Error in Gemini API:", error);
    return NextResponse.json({ error: "Failed to generate response." }, { status: 500 });
  }
}
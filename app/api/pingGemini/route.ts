/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Define known intents and their required fields
const requiredFields = {
  transfer_funds: ["amount", "recipient", "bank_name"],
  check_loan_eligibility: ["ssm_number", "monthly_revenue"],
  apply_permit_or_loan: ["business_type", "permit_type", "location"],
  register_ssm: ["business_name", "business_type", "owner_ic", "address"],
  open_business_account: ["bank_name", "business_name", "ssm_number", "owner_ic"],
  register_sst: ["business_name", "ssm_number", "industry_type", "revenue"],
  register_tourism_tax: ["business_name", "location", "accommodation_type"],
  apply_grant: ["grant_type", "ssm_number", "business_sector"],
  apply_loan: ["loan_type", "business_age", "monthly_revenue"],
  update_profile: ["field_to_update", "new_value"],
  request_support: ["issue_type", "description"],
  inquire_einvoice: ["question_topic"],
} as const;

const validIntents = Object.keys(requiredFields) as (keyof typeof requiredFields)[];

export async function POST(req: Request) {
  const { prompt, history, conversationState } = await req.json();

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "Gemini API key is not set." }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  let intent = conversationState?.currentIntent || null;
  let fields = conversationState?.collectedFields || {};

  try {
    // Step 1: Detect intent only if not set
    if (!intent) {
      const intentChat = model.startChat({
        history: [
          {
            role: "user",
            parts: [
              {
                text:
                  "You are a context-aware assistant. Based on the user message, detect their intent (one of: " +
                  validIntents.join(", ") +
                  ") and extract any provided fields. Respond only in JSON format: {\"intent\": \"...\", \"fields\": {...}}. If no match, return null intent.",
              },
            ],
          },
          ...history.map((text: string, i: number) => ({
            role: i % 2 === 0 ? "user" : "model",
            parts: [{ text }],
          })),
        ],
      });

      const intentPrompt = `User message: "${prompt}"`;
      const intentResult = await intentChat.sendMessage(intentPrompt);
      const intentText = await intentResult.response.text();

      try {
        const parsed = JSON.parse(intentText);
        intent = parsed.intent;
        fields = parsed.fields || {};
      } catch (err) {
        console.warn("Intent JSON parse failed:", err);
        return await handleFallback(model, prompt, history);
      }
    }

    // If still no intent, fallback
    if (!intent || !validIntents.includes(intent)) {
      return await handleFallback(model, prompt, history);
    }

    // Step 2: Merge any new info from user into fields
    const expected = requiredFields[intent as keyof typeof requiredFields];
    for (const key of expected) {
      if (!fields[key] && prompt.toLowerCase().includes(key.replace(/_/g, " "))) {
        fields[key] = prompt; // simple placeholder mapping
      }
    }

    const missing = expected.filter((key) => !fields[key]);
    if (missing.length > 0) {
      return NextResponse.json({
        intent,
        fields,
        missingFields: missing,
        message: `You're trying to ${intent.replace(/_/g, " ")}, but still missing: ${missing.join(", ")}`,
      });
    }

    // Step 3: Final assistant response
    const finalChat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text:
                `You are helping with: ${intent.replace(/_/g, " ")}. ` +
                `The user has already provided: ${JSON.stringify(fields)}. ` +
                `Continue assisting with any next steps. Reply in a warm, concise tone. Avoid repeating info unless asked.`,
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
      message: "All required fields provided. Proceeding with task...",
      text,
    });
  } catch (error) {
    console.error("Gemini error:", error);
    return NextResponse.json({ error: "Failed to generate response." }, { status: 500 });
  }
}

async function handleFallback(model: any, prompt: string, history: string[]) {
  const fallbackChat = model.startChat({
    history: [
      {
        role: "user",
        parts: [
          {
            text: "You're a friendly assistant who keeps track of prior conversation. Reply naturally and helpfully based on previous topics.",
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
  return NextResponse.json({ message: "General fallback response", text });
}

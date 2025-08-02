import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      user_id,
      transaction_type,
      amount,
      currency = "MYR",
      category,
      description,
      payment_method,
      timestamp = new Date().toISOString(),
      source,
      is_recurring = false,
    } = body;

    // Basic validation
    if (
      !user_id ||
      !transaction_type ||
      !amount ||
      !category ||
      !payment_method
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          user_id,
          transaction_type,
          amount,
          currency,
          category,
          description,
          payment_method,
          timestamp,
          source,
          is_recurring,
        },
      ])
      .select(); // optional: return the inserted row(s)

    if (error) {
      console.error("Supabase Insert Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error("Unexpected Error:", err);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}

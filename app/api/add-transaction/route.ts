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
      source = null,
      is_recurring = false,
    } = body;

    if (!user_id || !["income", "expense"].includes(transaction_type)) {
      return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
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
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, transaction: data });
  } catch (err) {
    console.error("Unhandled error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

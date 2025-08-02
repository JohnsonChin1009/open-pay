import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json(
      { error: "Missing user_id in query parameters" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user_id)
    .order("timestamp", { ascending: false });

  console.log(`🔍 Get Transactions for user ${user_id}:`);
  console.log(`   📊 Found ${data?.length || 0} transactions`);

  if (error) {
    console.error("Supabase Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  console.log("Fetched transactions:", data);
  return NextResponse.json({ success: true, data });
}

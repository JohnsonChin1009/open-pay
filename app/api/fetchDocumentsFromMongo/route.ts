import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri);

export async function GET() {
  try {
    await client.connect();
    const database = client.db("openpay");
    const collection = database.collection("documents");

    const documents = await collection.find({}).toArray();

    return NextResponse.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error("❌ Error fetching documents:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";
import { GoogleGenAI } from "@google/genai";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGODB_URI!;
const dbName = "openpay";
const client = new MongoClient(mongoUri);

function chunkText(text: string, chunkSize = 500, overlap = 50): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    chunks.push(chunk);
    if (i + chunkSize >= words.length) break;
  }
  return chunks;
}

async function getEmbeddingFromGemini(text: string): Promise<number[]> {
  const ai = new GoogleGenAI({});

  try {
    const res = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
    });

    const embeddings = res.embeddings?.[0]?.values;

    if (!embeddings) {
      throw new Error("No embedding returned for the chunk.");
    }

    return embeddings;
  } catch (error) {
    console.error("Embedding API Error", error);
    throw error;
  }
}

async function ingestToEmbeddings() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const docsDir = path.join(__dirname, "docs");
  const files = fs.readdirSync(docsDir).filter((f) => f.endsWith(".txt"));

  await client.connect();
  const db = client.db(dbName);
  const documentsCol = db.collection("documents");
  const embeddingsCol = db.collection("embeddings");

  for (const file of files) {
    const filePath = path.join(docsDir, file);
    const content = fs.readFileSync(filePath, "utf8");

    const doc = {
      file_name: file,
      content,
      uploaded_at: new Date(),
      source: "initial-ingest",
    };

    const insertResult = await documentsCol.insertOne(doc);
    const documentId = insertResult.insertedId;

    console.log(`✅ Ingested: ${file} (ID: ${documentId})`);

    // Chunking and embedding
    const chunks = chunkText(content);
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await getEmbeddingFromGemini(chunk);

      await embeddingsCol.insertOne({
        file_id: documentId,
        file_name: file,
        chunk_index: i,
        text_chunk: chunk,
        embedding,
        uploaded_at: new Date(),
        source: "initial-ingest",
      });

      console.log(`🔹 Embedded chunk ${i + 1}/${chunks.length}`);
    }
  }

  await client.close();
  console.log("🚀 Done ingesting all documents.");
}

ingestToEmbeddings().catch(console.error);

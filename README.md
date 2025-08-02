# 💬 OpenPay — Voice-Based MSME Onboarding with AI + RAG

OpenPay is an AI-first onboarding chat app designed for Malaysian MSMEs. It combines voice input, intelligent context tracking, and Retrieval-Augmented Generation (RAG) to verify user identity, assist business registration, and provide trusted financial guidance.

---

## ✨ Features

- 🎤 **Voice-to-text**: Natural input via Web Speech API
- 🧠 **LLM-powered chat**: Gemini API for intelligent responses
- 📄 **RAG-ready**: Smart document chunking + vector search with MongoDB
- 🧩 **Persistent context**: Messages linked with session-aware context
- 📲 **Mobile-friendly PWA** UI with beautiful chat interface

---

## 🧠 Tech Stack

- **Next.js** (App Router) + **TypeScript**
- **Google Generative AI (Gemini Pro)**
- **MongoDB** (metadata + vector store)
- **Supabase** (backend + authentication)
- **LangChain-style custom RAG pipeline**
- **TailwindCSS** + **ShadCN** + **Lucide Icons**
- **Web Speech API** for voice input

---

## 🗃️ Document Ingestion (RAG)

OpenPay ingests reference documents into MongoDB with the following format:

```json
{
  "user_id": "user123",
  "file_url": "https://example.com/file.pdf",
  "file_name": "bank_loan_guide.pdf",
  "uploaded_at": "2025-08-01T00:00:00Z",
  "text_chunk": "To qualify for this SME loan, applicants must..."
}
```

## Local Development
1. Clone the repo

```bash
Copy
Edit
git clone https://github.com/your-username/openpay.git
cd openpay
```

## Install dependencies

```bash
npm install
```

## Set up environment variables
```bash
cp .env.sample .env
```

## Let's run this
```bash
npm run dev
```

### 💡 Usage
- User enters the chat (or speaks) → Voice is transcribed → Intent is analyzed
- LLM fetches matching chunks from MongoDB (via vector search)
- Gemini answers the user with grounded facts (RAG)

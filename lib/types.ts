/* eslint-disable @typescript-eslint/no-explicit-any */
type Message = {
  role: "user" | "system";
  message: string;
  fileName?: string;
  fileURL?: string;
};

export interface EmbeddingDocument {
  _id?: string;
  text: string;
  embedding: number[];
  metadata?: {
    source?: string;
    page?: number;
    section?: string;
    [key: string]: any;
  };
  createdAt?: Date;
}

export interface SearchResult {
  _id: string;
  text: string;
  metadata?: any;
  score: number;
}

export interface RAGConfig {
  topK?: number;
  temperature?: number;
  maxOutputTokens?: number;
  indexName?: string;
}

export type { Message };


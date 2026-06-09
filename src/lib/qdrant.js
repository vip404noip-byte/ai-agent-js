import { QdrantClient } from "@qdrant/js-client-rest";
import { QDRANT_URL, QDRANT_API_KEY } from "../config.js";
export const qdrant = new QdrantClient({
url: QDRANT_URL,
...(QDRANT_API_KEY && { apiKey: QDRANT_API_KEY }),
});
export const CITY_COLLECTION = "city";
export const EMBEDDING_DIM = 1536;
export const EMBEDDING_MODEL = "text-embedding-3-small";
import OpenAI from "openai";    

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

export async function embed(text) {
  const res = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return res.data[0].embedding;
}

export async function searchCity(query, limit = 5) {
  const vector = await embed(query);

  const results = await qdrant.search(CITY_COLLECTION, {
    vector,
    limit,
    with_payload: true,
  });

  return results.map((r) => ({
    score: r.score,
    name: r.payload.name,        
    content: r.payload.content,  
  }));
}
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 1. Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    // UPDATED: Using 'gemini-2.5-flash' which is the current stable standard
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let attempts = 0;
    const maxRetries = 3;
    let backoff = 2000;

    while (attempts < maxRetries) {
      try {
        const prompt = `Explain ${topic} in simple terms for a student.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ explanation: text });

      } catch (error: any) {
        attempts++;
        
        // Handle Rate Limiting (429)
        if (error.status === 429 && attempts < maxRetries) {
          console.warn(`Rate limit hit. Retrying in ${backoff}ms...`);
          await delay(backoff);
          backoff *= 2; 
          continue;
        }

        // Handle specific 404/Model Errors
        console.error("Gemini API Error details:", error);
        return NextResponse.json(
          { 
            error: `API Error: ${error.message}`,
            status: error.status 
          },
          { status: error.status || 500 }
        );
      }
    }

  } catch (err) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
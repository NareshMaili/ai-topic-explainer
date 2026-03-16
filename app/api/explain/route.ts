import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Using the variable name visible in your Vercel screenshot
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic || topic.trim() === "") {
      return NextResponse.json({ error: "Please enter a topic to continue." }, { status: 400 });
    }

    // Switch to 1.5-flash for better stability on Free Tier
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are a helpful AI assistant that explains study topics in simple, student-friendly terms using analogies."
    });

    let attempts = 0;
    const maxRetries = 2;

    while (attempts <= maxRetries) {
      try {
        const result = await model.generateContent(`Explain the topic '${topic}' in simple terms for a student.`);
        const response = await result.response;
        return NextResponse.json({ explanation: response.text() });
      } catch (error: any) {
        // If we hit a rate limit (429), wait and try again
        if (error.status === 429 && attempts < maxRetries) {
          attempts++;
          await delay(2000 * attempts); 
          continue;
        }
        throw error;
      }
    }
  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json(
      { error: "The AI is currently busy. Please wait 30 seconds and try again." },
      { status: 500 }
    );
  }
}
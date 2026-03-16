import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic || topic.trim() === "") {
      return NextResponse.json({ error: "Please enter a topic to continue." }, { status: 400 });
    }

    // Using Gemini 1.5 Flash (Free Tier) as required [cite: 22]
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are a helpful AI assistant that explains study topics in simple, student-friendly terms. Use analogies and clear formatting."
    });

    let attempts = 0;
    const maxRetries = 2;

    while (attempts <= maxRetries) {
      try {
        const result = await model.generateContent(`Explain the topic '${topic}' in simple terms for a student.`);
        const response = await result.response;
        return NextResponse.json({ explanation: response.text() });
      } catch (error: any) {
        if (error.status === 429 && attempts < maxRetries) {
          attempts++;
          await delay(2000 * attempts);
          continue;
        }
        throw error;
      }
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: "AI is busy. Please wait a moment and try again." },
      { status: 500 }
    );
  }
}
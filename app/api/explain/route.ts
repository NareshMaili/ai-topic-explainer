import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Safety check for the API Key
    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY in environment variables.");
      return NextResponse.json(
        { explanation: "Configuration error: API Key missing." },
        { status: 500 }
      );
    }

    const prompt = `Explain "${topic}" in simple terms for a student. Break it down into 2-3 short paragraphs.`;

    /**
     * FIX: Updated to 'gemini-2.0-flash' for 2026 stability.
     * Use 'v1' for production consistency.
     */
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        // Optional: Adding generation config for better formatting
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    });

    const data = await response.json();

    // 2. Handle API-level errors (404, 400, 429, etc.)
    if (!response.ok) {
      console.error("Gemini API Error Response:", data);
      return NextResponse.json(
        { explanation: `API Error: ${data.error?.message || "Unknown error"}` },
        { status: response.status }
      );
    }

    // 3. Extract the text safely
    const explanation =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "The AI returned an empty response. Please try a different topic.";

    return NextResponse.json({ explanation });

  } catch (error) {
    // 4. Catch network or code crashes
    console.error("Server-side Crash:", error);
    return NextResponse.json(
      { explanation: "Server error generating explanation. Check your network connection." },
      { status: 500 }
    );
  }
}
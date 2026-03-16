"use client";
import { useState } from "react";

export default function StudyExplainer() {
  const [topic, setTopic] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExplain = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic to continue."); // Requirement [cite: 58]
      return;
    }

    setError("");
    setExplanation("");
    setIsLoading(true); // Requirement [cite: 51]

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setExplanation(data.explanation);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
      <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">AI Topic Explainer</h1>
          <p className="text-gray-500 mt-2">Enter any topic and I'll explain it simply!</p>
        </header>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            className="border-2 border-gray-200 p-3 rounded-lg focus:outline-none focus:border-blue-400 text-black"
            placeholder="e.g., Photosynthesis, Binary Search..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <button
            onClick={handleExplain}
            disabled={isLoading}
            className="bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {isLoading ? "Generating explanation..." : "Explain Topic"} 
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {explanation && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-100 animate-fade-in">
            <h2 className="text-xl font-bold text-blue-800 mb-3">Topic: {topic}</h2>
            <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-wrap">
              {explanation}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
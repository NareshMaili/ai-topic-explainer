"use client";

import { useState } from "react";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const explainTopic = async () => {

  setLoading(true);

  const res = await fetch("/api/explain", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic: topic,
    }),
  });

  const data = await res.json();

  setResult(data.explanation);
  setLoading(false);
};

  return (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100">
    
    <div className="bg-white shadow-xl rounded-xl p-8 w-[420px] text-center">
      
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        AI Topic Explainer
      </h1>

      <input
        type="text"
        placeholder="Enter a topic..."
        className="border p-3 w-full rounded mb-4 text-black"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      <button
        onClick={explainTopic}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded w-full transition"
      >
        {loading ? "Explaining..." : "Explain"}
      </button>

      {result && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg text-left">
          <h2 className="font-semibold mb-2 text-gray-700">Explanation</h2>
          <p className="text-gray-600">{result}</p>
        </div>
      )}

    </div>

  </div>
);
}
'use client';
import React, { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  return (
    <div style={{ padding: 40 }}>
      <h1>Multi-Agent Reasoning Demo</h1>
      <form onSubmit={e => e.preventDefault()}>
        <label htmlFor="prompt">Your Question:</label>
        <input
          id="prompt"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          style={{ marginLeft: 8 }}
        />
      </form>
    </div>
  );
}

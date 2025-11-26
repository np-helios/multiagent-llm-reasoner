'use client';
import React, { useState } from 'react';
import axios from "axios";

const AGENTS = [
  { key: "fast", label: "Fast", color: "bg-blue-100 text-blue-700 border-blue-200", icon: "⚡" },
  { key: "careful", label: "Careful", color: "bg-green-100 text-green-700 border-green-200", icon: "🔎" },
  { key: "creative", label: "Creative", color: "bg-purple-100 text-purple-700 border-purple-200", icon: "🎨" },
  { key: "critical", label: "Critical", color: "bg-pink-100 text-pink-700 border-pink-200", icon: "🧐" }
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>(AGENTS.map(a => a.key));
  const [effort, setEffort] = useState(0.6);
  const [randomness, setRandomness] = useState(0.45);
  const [loading, setLoading] = useState(false);

  const [results, setResults] = useState<any[] | null>(null);
  const [log, setLog] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleAgentToggle(agentKey: string) {
    setSelectedAgents(
      selectedAgents.includes(agentKey)
        ? selectedAgents.filter(k => k !== agentKey)
        : [...selectedAgents, agentKey]
    );
  }

  // Backend connect logic
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:8000/api/reason', {
        prompt,
        agents: selectedAgents,
        temperature: randomness,
        top_p: 0.9,
        max_tokens: 256
      });
      setResults(response.data.chains);
      setVerifications(response.data.verifier);
      setLog([{ timestamp: new Date(), agents: selectedAgents, prompt, parameters: { randomness, effort }, action: "Compared chains" }, ...log]);
    } catch (err: any) {
      setError(err?.message ?? "API call failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 flex items-stretch">
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-6 hidden md:flex flex-col gap-10 min-h-screen">
        <div>
          <h2 className="text-lg font-bold mb-2">Agents</h2>
          {AGENTS.map(agent => (
            <label key={agent.key} className={`flex items-center gap-2 mb-2 cursor-pointer px-2 py-1 rounded border ${agent.color} ${selectedAgents.includes(agent.key) ? 'opacity-100' : 'opacity-40'}`}>
              <input
                type="checkbox"
                checked={selectedAgents.includes(agent.key)}
                onChange={() => handleAgentToggle(agent.key)}
                className="accent-blue-800"
              />
              <span className="text-xl">{agent.icon}</span>
              <span className="font-semibold">{agent.label}</span>
            </label>
          ))}
        </div>
        <div>
          <h2 className="text-lg font-bold mb-2">Controls</h2>
          <label className="block text-sm font-medium mb-2">
            Randomness
            <input
              type="range"
              min={0} max={1} step={0.05}
              value={randomness}
              onChange={e => setRandomness(Number(e.target.value))}
              className="w-full mt-1"
            />
            <span className="ml-2 text-xs text-gray-600">{randomness}</span>
          </label>
        </div>
      </aside>

      <main className="flex-1 max-w-4xl mx-auto flex flex-col items-center px-3 pb-12">
        <header className="my-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 dark:text-blue-300 mb-3">Multi-Agent Reasoning Orchestrator</h1>
          <p className="text-md text-gray-500 dark:text-blue-200 text-center">Comparing agent chains step-by-step—with full control & transparency.</p>
        </header>

        <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow flex items-center p-6 mb-7 border border-slate-100 dark:border-blue-900">
          <input
            type="text"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-blue-400 dark:bg-gray-800 dark:text-blue-50 text-lg"
            placeholder="Enter your question..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            required
          />
          <button type="submit" disabled={loading} className="ml-5 px-6 py-3 rounded-lg font-bold bg-blue-200 hover:bg-blue-300 text-blue-900 dark:bg-blue-900 dark:text-blue-100 shadow transition disabled:opacity-50">
            {loading ? "Thinking..." : "Compare"}
          </button>
        </form>
        {error && <div className="text-red-600 font-semibold my-3">Error: {error}</div>}

        {results &&
          <section className="w-full px-2 mb-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {results.map((chain: any, idx: number) => (
                <div key={chain.agent.key} className="bg-slate-50 dark:bg-gray-800 rounded-xl shadow p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-lg font-bold ${chain.agent.color}`}>{chain.agent.icon}</span>
                    <span className="font-semibold text-gray-900 dark:text-blue-200">{chain.agent.label}</span>
                  </div>
                  <div>
                    {chain.steps.map((step: any, stepIdx: number) => (
                      <div key={stepIdx} className={`mb-2 p-3 rounded-lg text-sm 
                        ${step.passed_test ? 'bg-white dark:bg-gray-700 border border-blue-100 dark:border-blue-900'
                          : 'bg-pink-50 dark:bg-pink-900 border border-pink-200 dark:border-pink-700'}`}>
                        <span className="font-bold">{stepIdx + 1}. [{step.type}]</span>
                        <span className="ml-2">{step.step}</span>
                        <div className="mt-1 text-gray-700 dark:text-blue-100">{step.result}</div>
                        {!step.passed_test && (
                          <div className="text-pink-700 dark:text-pink-200 font-semibold mt-1">Failed/Disagreed Step!</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        }
        {verifications &&
          <section className="max-w-3xl w-full mt-4 mb-6 p-4 bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-2">Verifier Agent Analysis</h3>
            {verifications.map((v: any, i: number) => (
              <div key={i} className="mb-2">
                <span className="font-semibold">{v.agent}:</span>
                {v.verdict.map((ver: any, j: number) =>
                  <span key={j} className={`ml-3 px-2 rounded-lg border ${ver.verdict === "Valid" ? 'border-green-200 bg-green-50 text-green-700' : 'border-orange-200 bg-orange-50 text-orange-700'} text-xs`}>
                    Step {ver.step}: {ver.verdict} – {ver.explanation}
                  </span>
                )}
              </div>
            ))}
          </section>
        }
        <section className="max-w-3xl w-full mt-6 mb-2">
          <h3 className="text-md font-bold text-blue-700 dark:text-blue-400 mb-1">Agent Decision Log</h3>
          {log.length === 0 ? <div className="text-gray-400">No log entries yet.</div> : (
            <div className="text-sm space-y-2">
              {log.map((entry, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 p-2 rounded shadow border border-blue-100 dark:border-blue-950">
                  <div><strong>{new Date(entry.timestamp).toLocaleTimeString()}</strong>: Compare <span className="font-bold">{entry.agents.join(", ")}</span></div>
                  <div>Prompt: <span className="italic">{entry.prompt}</span></div>
                  <div>Params: {Object.entries(entry.parameters).map(([k, v]) => <span key={k} className="ml-2">{k}: {JSON.stringify(v)}</span>)}</div>
                  <div>Action: <span>{entry.action}</span></div>
                </div>
              ))}
            </div>
          )}
        </section>
        <footer className="mt-10 text-sm text-gray-400 dark:text-blue-800 text-center">
          Full lattice UI by your AI assistant. <br /> Next.js, React, Tailwind.
        </footer>
      </main>
    </div>
  );
}

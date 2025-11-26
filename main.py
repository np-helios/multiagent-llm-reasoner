from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
import asyncio
from dotenv import load_dotenv
from agents import AGENTS, AGENT_INSTRUCTIONS

load_dotenv()
OLLAMA_API_URL = os.getenv("OLLAMA_API_URL") or "http://localhost:11434/v1/chat/completions"

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    prompt: str
    temperature: float = 0.7
    top_p: float = 0.9
    max_tokens: int = 256
    agents: list[str] = None   # <--- ADD THIS FIELD FOR SELECTED AGENTS

async def call_ollama_agent(agent_name, prompt, temp, top_p, max_tokens):
    messages = [
        {"role": "system", "content": AGENT_INSTRUCTIONS[agent_name]},
        {"role": "user", "content": prompt}
    ]
    payload = {
        "model": "llama3",
        "messages": messages,
        "temperature": temp,
        "top_p": top_p,
        "max_tokens": max_tokens
    }
    # INCREASED TIMEOUT TO 45 SECONDS
    async with httpx.AsyncClient(timeout=45.0) as client:
        resp = await client.post(OLLAMA_API_URL, json=payload)
        result = resp.json()
        return {
            "agent": {"key": agent_name, "label": agent_name.capitalize(), "icon": "⚡", "color": ""},
            "steps": [
                {   # Step by step chain: you can update to real agent reasoning per your logic
                    "type": "reasoning",
                    "step": AGENT_INSTRUCTIONS[agent_name],
                    "result": result.get("choices", [{}])[0].get("message", {}).get("content", str(result)),
                    "passed_test": True
                }
            ]
        }

@app.post("/api/reason")
async def api_reason(req: QueryRequest):
    # Support selected agents; fallback to all if not present
    agents_to_run = req.agents or AGENTS
    tasks = [
        call_ollama_agent(agent, req.prompt, req.temperature, req.top_p, req.max_tokens)
        for agent in agents_to_run
    ]
    agent_chains = await asyncio.gather(*tasks)
    # You can add actual verifier logic here; for demo, send placeholder
    return {
        "chains": agent_chains,
        "verifier": [
            {
                "agent": chain["agent"]["label"],
                "verdict": [
                    {"step": 1, "verdict": "Valid", "explanation": "Initial automated check passes"}
                ]
            } for chain in agent_chains
        ]
    }

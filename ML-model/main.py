from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer, util
import pandas as pd
import torch
import asyncpg
from dotenv import load_dotenv
import os

load_dotenv()  # Load variables from .env

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")


app = FastAPI()
model = SentenceTransformer("all-MiniLM-L6-v2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

class ItemQuery(BaseModel):
    description: str

@app.on_event("startup")
async def startup():
    app.state.conn = await asyncpg.connect(
    user=DB_USER,
    password=DB_PASSWORD,
    database=DB_NAME,
    host=DB_HOST,
    port=int(DB_PORT)
)


@app.on_event("shutdown")
async def shutdown():
    await app.state.conn.close()

@app.post("/match")
async def match_item(query: ItemQuery):
    rows = await app.state.conn.fetch("SELECT id, description, location FROM found_items")
    descriptions = [row["description"] for row in rows]
    embeddings = model.encode(descriptions, convert_to_tensor=True)

    query_embedding = model.encode(query.description, convert_to_tensor=True)
    scores = util.cos_sim(query_embedding, embeddings)[0]
    top_results = torch.topk(scores, k=5)

    matches = []
    for score, idx in zip(top_results[0], top_results[1]):
        row = rows[idx.item()]
        matches.append({
            "score": round(score.item(), 4),
            "description": row["description"],
            "location": row["location"]
        })

    return {"matches": matches}
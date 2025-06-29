from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer, util
import pandas as pd
import torch

app = FastAPI()

# Allow CORS (for React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev only; restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("🔄 Loading model and embeddings...")
model = SentenceTransformer('all-MiniLM-L6-v2')
df = pd.read_csv("found_items.csv")
descriptions = df['description'].tolist()
found_embeddings = model.encode(descriptions, convert_to_tensor=True)
print("✅ Model & CSV loaded.")

class ItemQuery(BaseModel):
    description: str

# Match endpoint
@app.post("/match")
def match_item(query: ItemQuery):
    print("📩 Received:", query.description)
    query_embedding = model.encode(query.description, convert_to_tensor=True)
    scores = util.cos_sim(query_embedding, found_embeddings)[0]
    top_results = torch.topk(scores, k=5)

    matches = []
    for score, idx in zip(top_results[0], top_results[1]):
        idx = idx.item()
        matches.append({
            "score": round(score.item(), 4),
            "description": df.iloc[idx]["description"],
            "location": df.iloc[idx].get("location", "unknown")
        })

    return {"matches": matches}

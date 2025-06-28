from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from lost_found_matcher import load_found_items, embed_query, finding_matches

app = FastAPI()

# CORS: allow calls from frontend and Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, restrict to your domain
    allow_methods=["*"],
    allow_headers=["*"],
)

found_df, found_embeddings = load_found_items("./found_items.csv")

class QueryInput(BaseModel):
    description: str

@app.post("/match")
def match_lost_item(data: QueryInput):
    query_embedding = embed_query(data.description)
    results = finding_matches(query_embedding, found_embeddings, found_df)
    return {"matches": results}

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import os, shutil
import psycopg2
from dotenv import load_dotenv
import pandas as pd

from lost_found_matcher import embed_query, finding_matches
from image_matcher import embed_query_image, find_similar_images

import torch
from sentence_transformers import SentenceTransformer
import clip
from PIL import Image

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
    )

nlp_model = SentenceTransformer('all-MiniLM-L6-v2')
clip_model, clip_preprocess = clip.load("ViT-B/32", device="cpu")

def fetch_found_items():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, description, location, image_path FROM found_items WHERE image_path IS NOT NULL")
    rows = cur.fetchall()
    conn.close()
    return [{"id": r[0],"description": r[1], "location": r[2], "image_path": r[3]} for r in rows]

@app.post("/api/match")
async def match_item(
    name: str = Form(...),
    phone: str = Form(...),
    email: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    location: str = Form("Unknown"),
    image: UploadFile = File(None)
):
    # Save uploaded image
    img_filename, img_path = None, None
    if image:
        # 🔁 Use the backend/uploads path (not ML-model/uploads)
        uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend/uploads"))
        os.makedirs(uploads_dir, exist_ok=True)

        # 🔁 Use original filename only
        img_filename = image.filename
        img_path = os.path.join(uploads_dir, img_filename)

        with open(img_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

    # Save lost item to DB
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO lost_items (name, phone, email, title, description, location, image_path) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (name, phone, email, title, description, location, img_filename))
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        return {"error": "DB insert failed", "details": str(e)}

    found_items = fetch_found_items()

    # ===== TEXT MATCHING =====
    text_results = []
    if description:
        descriptions = [item["description"] for item in found_items]
        query_embed = embed_query(description)
        emb_found = nlp_model.encode(descriptions, convert_to_tensor=True)

        matches = finding_matches(query_embed, emb_found, pd.DataFrame(found_items), top_k=5)

        for match in matches:
            key = os.path.basename(match["image_path"]) if match.get("image_path") else match["description"]
            matched_item = next((item for item in found_items if item["description"] == match["description"]), None)
            text_results.append({
                "id": matched_item["id"] if matched_item else None,  # ✅ added
                "imgpath": key,
                "description": match.get("description", key),
                "location": match.get("location", "Unknown"),
                "text_score": round(match.get("score", 0.0), 4)
            })

    # ===== IMAGE MATCHING =====
    image_results = []
    if img_path:
        try:
            query_img_embed = embed_query_image(img_path, clip_model, clip_preprocess)
            found_embeddings, valid_keys, item_lookup = [], [], {}

            uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend/uploads"))

            for item in found_items:
                img_name = os.path.basename(item["image_path"])
                full_path = os.path.join(uploads_dir, img_name)

                if not os.path.exists(full_path):
                    continue

                try:
                    img = Image.open(full_path).convert("RGB")
                    input_tensor = clip_preprocess(img).unsqueeze(0)

                    with torch.no_grad():
                        emb = clip_model.encode_image(input_tensor)
                        emb /= emb.norm(dim=-1, keepdim=True)

                    found_embeddings.append(emb)
                    valid_keys.append(img_name)
                    item_lookup[img_name] = item
                except:
                    continue

            if found_embeddings:
                found_embeddings = torch.vstack(found_embeddings)
                matches = find_similar_images(query_img_embed, found_embeddings, valid_keys, top_k=5)

                for match in matches:
                    fname = os.path.basename(match["path"])
                    item = item_lookup.get(fname)
                    image_results.append({
                        "id": item["id"] if item else None,  # ✅ added
                        "imgpath": fname,
                        "description": item["description"] if item else fname,
                        "location": item["location"] if item else "Unknown",
                        "image_score": round(match["similarity"], 4)
                    })

        except Exception as e:
            print(f"[Image Match Error] {e}")

    # ===== FINAL RESPONSE =====
    return {
        "text_matches": sorted(text_results, key=lambda x: x["text_score"], reverse=True)[:3],
        "image_matches": sorted(image_results, key=lambda x: x["image_score"], reverse=True)[:3]
    }

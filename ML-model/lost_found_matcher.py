from sentence_transformers import SentenceTransformer, util
import pandas as pd 
import torch

#loading model :3
model = SentenceTransformer('all-MiniLM-L6-v2')

#encoding the csv
def load_found_items(csv_path):
    df = pd.read_csv(csv_path)
    descriptions = df['description'].tolist()
    embeddings = model.encode(descriptions, convert_to_tensor= True )
    return df , embeddings

#encoding user
def embed_query(user_query):
    return model.encode(user_query , convert_to_tensor= True )

def finding_matches( query_embedding, found_embeddings, found_df, top_k=5):
    scores = util.cos_sim(query_embedding,found_embeddings)[0]
    top_results = torch.topk(scores, k = top_k )
    matches = []
    
    for score, idx in zip(top_results[0] , top_results[1] ):
        idx = idx.item()
        match = {
            'score' : round(score.item(), 4 ),
            'description' : found_df.iloc[idx]['description'],
            'location' : found_df.iloc[idx].get('location', 'unknown' )
        }
        matches.append(match)

    return matches

# FINALLY MAIN YIPPIE 

if __name__ == "__main__":

    print(">>> Main block running!")


    df , found_embeddings = load_found_items("found_items.csv")

    query = input("Describe your lost item: ")

    query_embedding = embed_query(query)

    results = finding_matches( query_embedding , found_embeddings , df)

    #print matches :3
    print("\n top matches: \n")
    for match in results:
         print(f"- {match['description']} (Location: {match['location']}) | Similarity: {match['score']}")
        

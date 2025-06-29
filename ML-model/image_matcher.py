import os 
from PIL import Image
import torch
import clip
from torchvision.transforms import Compose, Resize, CenterCrop, ToTensor, Normalize

#loading model :3
device = "cuda" if torch.cuda.is_available() else "cpu"
model , preprocess = clip.load("ViT-B/32", device=device)

#loading image 
def load_found_images(folder_path):
    image_embeddings = []
    image_paths = []
    
    for filename in os.listdir(folder_path):
        if filename.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
            image = Image.open(os.path.join(folder_path, filename)).convert("RGB")
            image_input = preprocess(image).unsqueeze(0).to(device)

            with torch.no_grad():
                embedding = model.encode_image(image_input)
                embedding /= embedding.norm(dim=-1, keepdim = True)

            image_embeddings.append(embedding)
            image_paths.append(os.path.join(folder_path, filename))

    return torch.vstack(image_embeddings), image_paths

#user image smh 
def embed_query_image(image_path):
    image = Image.open(image_path).convert("RGB")
    image_input = preprocess(image).unsqueeze(0).to(device)

    with torch.no_grad():
        embedding = model.encode_image(image_input)
        embedding /= embedding.norm(dim=-1, keepdim = True)

    return embedding

#matching them because why not, this shit way too difficult 
def find_similar_images(query_embedding, dataset_embeddings, image_paths, top_k = 5):
    similarity_scores = (query_embedding @ dataset_embeddings.T).squeeze(0)
    top_indices = similarity_scores.topk(top_k).indices
    matches = []
    for idx in top_indices:
        match = {
            "path" : image_paths[idx] ,
            "similarity" : round(similarity_scores[idx].item(), 4)
        }
        matches.append(match)

    return matches

#FINALLY MAIN AA GAYA 
if __name__ == "__main__":
    print("CLIP-based image matcher running")
    
    dataset_folder = os.path.join(os.path.dirname(__file__), "found_images")  
    found_embeddings, found_paths = load_found_images(dataset_folder)

    user_image_path = input("Enter path to your lost item's image: ")

    query_embedding = embed_query_image(user_image_path)

    matches = find_similar_images(query_embedding, found_embeddings, found_paths)

    print("\nTop matching found images: ")
    for match in matches:
        print(f"{match['path']} | Similarity: {match['similarity']}")






 



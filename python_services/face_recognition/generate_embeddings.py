import os
import pickle
from deepface import DeepFace

def extract_face_embedding(img_path):
    try:
        representation = DeepFace.represent(img_path=img_path, model_name='Facenet',enforce_detection=False)
        return representation[0]['embedding']
    except Exception as e:
        print(f"Error in extracting face embedding: {e}")
        return None

def save_face_embeddings(database_folder):
    for filename in os.listdir(database_folder):
        if filename.endswith((".jpg", ".jpeg", ".png")):
            img_path = os.path.join(database_folder, filename)
            embedding = extract_face_embedding(img_path)
            if embedding is not None:
                # Lưu embedding vào file pickle
                embedding_path = img_path + '.pkl'
                with open(embedding_path, 'wb') as f:
                    pickle.dump(embedding, f)
                print(f"Saved embedding for {filename}")

if __name__ == '__main__':
    database_folder = 'face_databases'
    if not os.path.exists(database_folder):
        os.makedirs(database_folder)

    save_face_embeddings(database_folder)
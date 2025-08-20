# pinecone_client.py
import sys
import json
from pinecone import Pinecone

# Initialize Pinecone
pc = Pinecone(
    api_key="pcsk_5m9oVz_RwWBpcm6M743Z26r2E7warcjuqgBxZaG7FYTNwL4TgJSSMEyDs7RgWS5spVLu9m")
index = pc.Index("quickstart")

def query_pinecone(query_vector):
    """Queries the Pinecone index."""
    try:
        results = index.query(vector=query_vector, top_k=5, include_metadata=True)
        return results
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # The query vector is expected as a JSON string from the command line
        try:
            query_vector_json = sys.argv[1]
            query_vector = json.loads(query_vector_json)
            # Basic validation for the query vector
            if isinstance(query_vector, list) and all(isinstance(x, (int, float)) for x in query_vector):
                search_results = query_pinecone(query_vector)
                print(json.dumps(search_results))
            else:
                print(json.dumps({"error": "Invalid query vector format."}))
        except json.JSONDecodeError:
            print(json.dumps({"error": "Failed to decode query vector."}))
    else:
        # Placeholder for a default or test query if no argument is provided
        # This is just for testing purposes
        # You should replace this with a proper vector
        test_vector = [0.1] * 1536 # Assuming the vector dimension is 1536
        search_results = query_pinecone(test_vector)
        print(json.dumps(search_results, indent=2))
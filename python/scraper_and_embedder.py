import os
import requests
from bs4 import BeautifulSoup
import openai
import pinecone
from dotenv import load_dotenv

# === Setup ===
load_dotenv()

openai.api_key = os.getenv('OPENAI_API_KEY')
pinecone_api_key = os.getenv('PINECONE_API_KEY')
pinecone_env = os.getenv('PINECONE_ENVIRONMENT')

if not all([openai.api_key, pinecone_api_key, pinecone_env]):
    raise ValueError("API keys not found. Please set them in a .env file.")

pinecone.init(api_key=pinecone_api_key, environment=pinecone_env)

# Ensure the index exists. Create it if it doesn't.
index_name = "pestpro-index"
if index_name not in pinecone.list_indexes():
    print(f"Creating index: {index_name}")
    pinecone.create_index(name=index_name, dimension=1536, metric='cosine')

index = pinecone.Index(index_name)

def get_page_text(url):
    try:
        res = requests.get(url)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, 'html.parser')
        title = soup.title.string if soup.title else "No Title"
        paragraphs = soup.find_all('p')
        content = "\n".join(p.get_text().strip() for p in paragraphs if p.get_text().strip())
        return f"Title: {title}\n\n{content}"
    except requests.exceptions.RequestException as e:
        print(f"Error fetching {url}: {e}")
        return None

def embed_and_upsert(text, doc_id):
    try:
        embedding = openai.Embedding.create(input=[text], model="text-embedding-3-small")["data"][0]["embedding"]
        index.upsert(vectors=[
            {
                "id": doc_id,
                "values": embedding,
                "metadata": {"text": text}
            }
        ])
        print(f"Successfully embedded and upserted {doc_id}")
    except Exception as e:
        print(f"Error embedding/upserting {doc_id}: {e}")

# === URLs to scrape ===
urls = {
    "cockroach": "https://pestpro.in/residential/cockroach.html",
    "bed-bug": "https://pestpro.in/residential/bed-bug.html",
    "mosquito": "https://pestpro.in/residential/mosquito.html",
    "lizard-spider": "https://pestpro.in/residential/lizard-and-spider-treatment.html",
    "rodent": "https://pestpro.in/residential/rodent-control.html",
    "termite": "https://pestpro.in/residential/termite-treatment.html",
    "wood-borer": "https://pestpro.in/residential/wood-borer.html"
}

# === Run Script ===
def main():
    for key, url in urls.items():
        print(f"Scraping {key} from {url}")
        content = get_page_text(url)
        if content:
            embed_and_upsert(content, key)
    print("\nScraping and embedding complete.")
    print(f"Index stats: {index.describe_index_stats()}")

if __name__ == "__main__":
    main()
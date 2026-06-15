from dotenv import load_dotenv
from huggingface_hub import HfApi
import os

# Load .env file
load_dotenv()

TOKEN = os.getenv("HF_TOKEN")
REPO_ID = os.getenv("REPO_ID")

LOCAL_FOLDER = "./backend"

api = HfApi()

print("Uploading backend to Hugging Face...")
api.upload_folder(
    folder_path=LOCAL_FOLDER,
    repo_id=REPO_ID,
    repo_type="space",
    token=TOKEN
)
print("Upload complete!")
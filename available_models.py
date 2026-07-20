import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise ValueError("OPENAI_API_KEY is not set")

client = OpenAI(api_key=api_key)

try:
    models = client.models.list()

    print(f"Found {len(models.data)} models:\n")

    for model in sorted(models.data, key=lambda m: m.id):
        print(model.id)

except Exception as e:
    print("Error:", e)
# main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import openai
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# CORS middleware (adjust origin to match your frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set OpenAI key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Yelp key (used in headers)
YELP_API_KEY = os.getenv("YELP_API_KEY")
YELP_API_URL = "https://api.yelp.com/v3/businesses/search"

@app.post("/api/plan-date")
async def plan_date(request: Request):
    body = await request.json()
    user_question = body.get("question", "")

    # Step 1: Extract term + location via OpenAI
    extraction_prompt = f"""
You are an assistant that extracts search terms and locations from date planning questions.

Only respond in this format:
term=<search term>, location=<location>

Examples:
"Can you find a romantic sushi place in LA?" → term=romantic sushi, location=LA
"I want a quiet cafe in San Francisco" → term=quiet cafe, location=San Francisco
"Show me rooftop bars near New York" → term=rooftop bars, location=New York

Now extract from this request:
\"{user_question}\"
"""

    extraction_response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You extract Yelp search parameters from user requests."},
            {"role": "user", "content": extraction_prompt}
        ]
    )

    extracted = extraction_response['choices'][0]['message']['content']
    term, location = "", ""
    if "term=" in extracted and "location=" in extracted:
        parts = extracted.split(", ")
        for part in parts:
            if part.startswith("term="):
                term = part.replace("term=", "").strip()
            elif part.startswith("location="):
                location = part.replace("location=", "").strip()

    if not term or not location:
        return {"error": "Could not extract term or location."}

    # Step 2: Query Yelp API
    yelp_headers = {"Authorization": f"Bearer {YELP_API_KEY}"}
    yelp_params = {"term": term, "location": location, "limit": 3}
    yelp_response = requests.get(YELP_API_URL, headers=yelp_headers, params=yelp_params)
    yelp_data = yelp_response.json()

    # Step 3: Summarize with OpenAI (optional)
    summary_prompt = f"Summarize the following Yelp business listings as date ideas:\n{yelp_data}"

    summary_response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You summarize date ideas using Yelp data."},
            {"role": "user", "content": summary_prompt}
        ]
    )

    summary = summary_response['choices'][0]['message']['content']

    return {
        "summary": summary,
        "raw_results": yelp_data  # optional: helpful for debugging
    }

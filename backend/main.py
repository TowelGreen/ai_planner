from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import requests
from openai import OpenAI
from dotenv import load_dotenv


load_dotenv() 

# Initialize OpenAI client
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

# Yelp API info
YELP_API_KEY = os.environ["YELP_API_KEY"]
YELP_ENDPOINT = "https://api.yelp.com/v3/businesses/search"

# FastAPI setup
app = FastAPI()

# CORS (allow frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    message: str

@app.post("/api/plan-date")
def plan_date(query: Query):
    user_message = query.message

    # 1️⃣ Generate extraction or follow-up question
    prompt = f"""
You are an intelligent AI Date Planner.

Your job is to suggest creative, enjoyable, and thoughtful date experiences—not just restaurants.

If the user's request is too vague, ask **one friendly follow-up question** (like "What vibe are you going for—romantic, adventurous, or chill?").

When there is enough info, extract:

term=<search term>, location=<location>

**Terms can be any experience**: parks, museums, arcades, seasonal events, food, cafés, outdoor activities.

User: "{user_message}"

Reply with either:
- a follow-up question
OR
- the exact format: term=..., location=...
"""

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You help plan great date ideas using Yelp."},
            {"role": "user", "content": prompt}
        ]
    )

    reply = response.choices[0].message.content.strip()

    # 2️⃣ If follow-up, return it
    if not reply.startswith("term="):
        return {"followUp": reply}

    # 3️⃣ Parse term and location
    term, location = "", ""
    parts = reply.split(",")
    for part in parts:
        if part.startswith("term="):
            term = part.replace("term=", "").strip()
        elif part.startswith("location="):
            location = part.replace("location=", "").strip()

    # 4️⃣ Query Yelp
    headers = {"Authorization": f"Bearer {YELP_API_KEY}"}
    params = {
        "term": term,
        "location": location,
        "sort_by": "best_match",
        "limit": 5
    }
    yelp_response = requests.get(YELP_ENDPOINT, headers=headers, params=params)
    yelp_data = yelp_response.json()

    # Format Yelp results for summarization
    business_info = []
    for biz in yelp_data.get("businesses", []):
        business_info.append(f"{biz['name']} ({biz['categories'][0]['title']}, {biz['location']['address1']})")

    yelp_text = "\n".join(business_info)

    # 5️⃣ Generate summary
    summary_prompt = f"""
You are an AI Date Planner.

Here are some places:

{yelp_text}

Write a friendly, engaging summary suggesting these as date ideas.
Be creative—mix different experiences (food, parks, games, etc.).
"""

    summary_response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You help plan fun, thoughtful dates."},
            {"role": "user", "content": summary_prompt}
        ]
    )

    summary = summary_response.choices[0].message.content.strip()

    return {"summary": summary}

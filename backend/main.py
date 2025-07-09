from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import requests
from openai import OpenAI
from dotenv import load_dotenv
import logging
import json

# --- Setup ---
logging.basicConfig(level=logging.INFO)
dotenv_path = os.path.join(os.path.dirname(os.path.realpath(__file__)), ".env")
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path, override=True)
else:
    logging.warning(".env file not found.")

try:
    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    YELP_API_KEY = os.environ["YELP_API_KEY"]
except KeyError as e:
    logging.error(f"Environment variable not set: {e}. The application will not work.")
    exit()

YELP_ENDPOINT = "https://api.yelp.com/v3/businesses/search"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class Query(BaseModel):
    message: str
    known_term: str = ""
    known_location: str = ""
    last_results: list = []

# --- API Endpoint ---
@app.post("/api/plan-date")
def plan_date(query: Query):
    user_message = query.message
    known_terms_raw = query.known_term or ""
    known_location = query.known_location
    last_results = query.last_results

    # --- A new, more robust single-prompt strategy ---
    prompt = f"""
You are an AI Date Planner. Your goal is to help users find places on Yelp. You must decide between three modes: RECOMMEND, SEARCH, or CLARIFY.

# Context
- Last Search Results: {json.dumps(last_results, indent=2) if last_results else "None"}
- Current Search Terms: "{known_terms_raw}"
- Current Location: "{known_location}"
- User's latest message: "{user_message}"

# Instructions
1. Analyze the user's latest message in the context of the conversation so far.
2. Follow the "Mode Selection Logic" below to choose your mode.
3. Format your response as a single, minified line of valid JSON. **You must choose one of the three modes.**

# Mode Selection Logic (Follow these steps PRECISELY)

**STEP 1: Is this a recommendation request?**
- Check if the user's message contains words like: "recommend", "favorite", "best", "suggest", "opinion", "decide", "which should I pick", "which would you recommend", "which is better", "which one do you like", "which should I choose", "what's the top one", "top pick".
- If ANY of these words are present AND "Last Search Results" contains any results, you MUST choose `RECOMMEND` mode.
- Do NOT ask to search again. You already have results to choose from.
- Use them. Select one or two with the best qualities (rating, uniqueness, view, peacefulness, etc.).
- Explain your pick in a warm, conversational tone. Mention why you chose them: “beautiful view”, “popular with locals”, “great for sunset walks”, etc.
- Do NOT repeat the full list of results. This is a recommendation, not a summary.

**STEP 2: Is this a search request?**
- If you did not choose `RECOMMEND` in Step 1, now check if you can perform a search.
- A search is possible if, after reading the user's message, you will have **BOTH** search terms **AND** a location.
- IMPORTANT: When the user adds a new criterion (e.g., "free", "with a view", "art"), you MUST add it to the existing "Current Search Terms". Do NOT replace them.
- If a search is possible, choose `SEARCH` mode.

**STEP 3: If all else fails, clarify.**
- If you could not choose `RECOMMEND` or `SEARCH`, you are missing information.
- Choose `CLARIFY` mode.

# Modes of Operation & JSON Format

## 1. RECOMMEND Mode
- Action: Analyze the "Last Search Results" list. Pick one or two favorites and write a warm, conversational explanation for your choice.
- JSON Format: {{"mode": "recommend", "response": "Your conversational recommendation text..."}}

## 2. SEARCH Mode
- Action: Update the terms and location based on the user's message. Combine all relevant terms.
- JSON Format: {{"mode": "search", "terms": "updated,comma,separated,list", "location": "updated_location"}}

## 3. CLARIFY Mode
- Action: Ask a short, friendly question to get the missing information.
- JSON Format: {{"mode": "clarify", "response": "Your clarifying question...", "terms": "updated,comma,separated,list", "location": "updated_location"}}

# Example Response for RECOMMEND Mode
{{"mode": "recommend", "response": "I'd suggest Murphy Ranch Park — it's a beautiful trail with great views and one of the highest ratings at 4.5 stars. If you prefer something more relaxing, Penn Park has a calm vibe with plenty of trees and shaded paths."}}

Choose your mode and respond with a single line of valid JSON.
"""


    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful AI assistant that responds in a single line of valid JSON based on the user's request."},
                {"role": "user", "content": prompt}
            ]
        )
        
        reply_content = response.choices[0].message.content
        if not reply_content:
            raise ValueError("OpenAI response content is empty.")
        
        logging.info(f"OpenAI raw JSON response: {reply_content}")
        
        # Parse the JSON response from the AI
        parsed_response = json.loads(reply_content)
        mode = parsed_response.get("mode")

        if mode == "recommend":
            logging.info("Handling 'recommend' mode.")
            return {
                "followUp": parsed_response.get("response", "I'd recommend taking a look at the ones with the highest ratings!"),
                "knownTerm": known_terms_raw,
                "knownLocation": known_location
            }

        elif mode == "clarify":
            logging.info("Handling 'clarify' mode.")
            return {
                "followUp": parsed_response.get("response", "Could you tell me a bit more?"),
                "knownTerm": parsed_response.get("terms", known_terms_raw),
                "knownLocation": parsed_response.get("location", known_location)
            }

        elif mode == "search":
            logging.info("Handling 'search' mode.")
            updated_terms = parsed_response.get("terms")
            updated_location = parsed_response.get("location")

            if not (updated_terms and updated_location):
                raise ValueError("Search mode selected but terms or location are missing.")

            headers = {"Authorization": f"Bearer {YELP_API_KEY}"}
            params = {"term": updated_terms, "location": updated_location, "limit": 9}
            yelp_response = requests.get(YELP_ENDPOINT, headers=headers, params=params)
            yelp_response.raise_for_status()
            yelp_data = yelp_response.json()

            results = [{
                "name": biz.get("name", "N/A"),
                "category": biz.get("categories", [{}])[0].get("title", "Unknown"),
                "address": ", ".join(biz.get("location", {}).get("display_address", [])),
                "rating": biz.get("rating", "N/A"),
                "image_url": biz.get("image_url", ""),
                "url": biz.get("url", "")
            } for biz in yelp_data.get("businesses", [])]

            return {"businesses": results, "knownTerm": updated_terms, "knownLocation": updated_location}

        else:
            raise ValueError(f"Unknown mode received from AI: {mode}")

    except (json.JSONDecodeError, ValueError, Exception) as e:
        logging.error(f"Processing failed: {e}")
        return {
            "followUp": "I'm sorry, an error occurred while processing your request. Please try rephrasing.",
            "knownTerm": known_terms_raw,
            "knownLocation": known_location
        }

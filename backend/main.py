from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class RequestData(BaseModel):
    user_input: str

@app.post("/api/plan")
def generate_plan(data: RequestData):
    # Placeholder logic, replace with AI call later
    return {"response": f"AI suggestion based on: {data.user_input}"}

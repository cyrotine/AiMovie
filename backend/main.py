
import os
import json
from fastapi import FastAPI
from pydantic import BaseModel
import requests
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

try:
    from recommender import recommend_from_quiz, recommend_from_query
except Exception:
    from .recommender import recommend_from_quiz, recommend_from_query

GROK_API_KEY = "AIzaSyC4VjSWM-ZOu6VrHp2cfSRYphZXB1IHJCI"

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load movie database as a list of dicts (from CSV or JSON)
MOVIES = None
if os.path.isfile("backend/mymoviedb.csv"):
    try:
        from recommender import safe_read_csv
    except ImportError:
        from .recommender import safe_read_csv
    try:
        df = safe_read_csv("backend/mymoviedb.csv")
        MOVIES = df.to_dict(orient="records")
    except Exception as e:
        print(f"Error loading CSV: {e}")
        MOVIES = []
elif os.path.isfile("backend/movies.json"):
    MOVIES = json.load(open("backend/movies.json"))
else:
    MOVIES = []

def chunk_list(data, size=300):
    for i in range(0, len(data), size):
        yield data[i:i+size]

class QuizRequest(BaseModel):
    genres: str = ""
    average_rating: float = 0.0
    popularity: float = 0.0
    yearStart: str = ""
    yearEnd: str = ""
    language: str = ""

@app.post("/api/recommend/quiz")
def quiz_recommend(req: QuizRequest):
    movies = recommend_from_quiz(req.dict())
    return {"movies": movies}

class ChatQuery(BaseModel):
    message: str

@app.post("/api/recommend/chat")
def chat_ai(req: ChatQuery):
    # Directly use the local recommender function for all queries
    movies = recommend_from_query(req.message)
    if movies:
        return {
            "aiMessage": f"Here are results for your query: '{req.message}'",
            "movies": movies
        }
    else:
        return {
            "aiMessage": f"No movies found for: '{req.message}'",
            "movies": []
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

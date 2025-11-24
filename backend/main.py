
import os
import json
from fastapi import FastAPI # Removed APIRouter
from pydantic import BaseModel
import requests
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from fastapi import Request # Moved import to top
from fastapi.responses import JSONResponse # Moved import to top

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
if os.path.isfile("backend/cleaned_movies.csv"):
    try:
        from recommender import safe_read_csv
    except ImportError:
        from .recommender import safe_read_csv
    try:
        df = safe_read_csv("backend/cleaned_movies.csv")
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

class GenreSelectionRequest(BaseModel):
    genres: list[str]

# In a real application, you would associate these genres with a user ID
# For demonstration, we'll store them in a simple dictionary or just process them.
# A more robust solution would involve user authentication and a database.
_user_selected_genres = {} # Temporary storage

@app.post("/api/genres")
async def select_genres(req: GenreSelectionRequest):
    # In a real app, 'user_id' would come from authentication
    user_id = "temp_user" # Placeholder for a logged-in user
    _user_selected_genres[user_id] = req.genres
    print(f"Received genres for user {user_id}: {req.genres}")
    return {"message": "Genres saved successfully", "selected_genres": req.genres}

@app.get("/api/recommend/genres")
async def get_genre_recommendations():
    user_id = "temp_user" # Placeholder for a logged-in user
    genres_to_recommend = _user_selected_genres.get(user_id, [])
    
    if not genres_to_recommend:
        return {"movies": []}

    # Prepare a QuizRequest-like dictionary for recommend_from_quiz
    quiz_params = {
        "genres": ", ".join(genres_to_recommend), # Join genres with comma for existing function
        "average_rating": 0.0,
        "popularity": 0.0,
        "yearStart": "",
        "yearEnd": "",
        "language": ""
    }
    
    # Assuming recommend_from_quiz can handle multiple genres separated by commas
    movies = recommend_from_quiz(quiz_params)
    return {"movies": movies}

# @app.post("/api/recommend/quiz")
# def quiz_recommend(req: QuizRequest):
#     movies = recommend_from_quiz(req.dict())
#     return {"movies": movies}


# Accept both {name, genre} and {message} for compatibility
@app.post("/api/recommend/chat")
async def chat_ai(request: Request):
    data = await request.json()

    if 'movie_name' in data or 'genre' in data:
        name = data.get('movie_name', '')
        genre = data.get('genre', '')
        from .recommender import recommend_from_name_and_genre
        movies = recommend_from_name_and_genre(name, genre)
        return {"movies": movies}

    elif 'message' in data:
        movies = recommend_from_query(data['message'])
        return {"movies": movies}

    return JSONResponse({"movies": []}, status_code=400)



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

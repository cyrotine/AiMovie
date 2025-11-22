# movie-recommender-ai

A small full-stack example: FastAPI backend that recommends movies from a CSV and a Vite + React frontend.

## Structure

movie-recommender-ai/
  - backend/ (FastAPI)
  - frontend/ (Vite + React)

## Backend (Python)

1. Create and activate a virtualenv (recommended):

    python3 -m venv .venv
    source .venv/bin/activate

2. Install requirements:

    pip install -r backend/requirements.txt

3. Run the API:

    uvicorn backend.main:app --reload --port 8000 --host 0.0.0.0

Notes:
- The backend expects `mymoviedb.csv` in `backend/` or (as a convenience) in a sibling `MovieMate/` folder. If you already have the CSV in your existing project it should be discovered automatically.
- To enable the Grok AI rewriting, set `GROK_API_KEY` in a `.env` file.

## Frontend (React)

1. From `frontend/` install deps:

    npm install

2. Start dev server:

    npm run dev

Open http://localhost:5173

## Workflow

- The quiz page POSTs to `/api/recommend/quiz` to get recommendations.
- The chat page POSTs to `/api/recommend/chat` and displays results.

## Next steps / improvements
- Add better schema mapping for the CSV columns.
- Add images and richer cards on the frontend.
- Add unit tests for recommender logic.

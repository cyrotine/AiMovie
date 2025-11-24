# backend/recommender.py
import os
import json
import time
import numpy as np
import pandas as pd
import requests
import re
from io import StringIO
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ---------- CONFIG ----------
# Absolute CSV path you provided (Example A)
CSV_PATH = os.getenv("MOVIE_CSV_PATH",
     os.path.join(os.path.dirname(__file__), "cleaned_movies.csv")
)



# Cache files (stored next to CSV)
CACHE_DIR = os.path.dirname(CSV_PATH) or "."
EMBED_FILE = os.path.join(CACHE_DIR, "movie_embeddings.npy")
META_FILE = os.path.join(CACHE_DIR, "movie_meta.json")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")  # set this in env or .env
EMBED_MODEL = "gemini-embedding-1"  # update if Gemini has a specific model name

# TF-IDF fallback config
TFIDF_VECTORIZER_FILE = os.path.join(CACHE_DIR, "tfidf_vectorizer.pkl")
TFIDF_MATRIX_FILE = os.path.join(CACHE_DIR, "tfidf_matrix.npz")

# ---------- UTIL: robust CSV loader ----------
def safe_read_csv(path):
    """Robust CSV reader with fallbacks."""
    last_exc = None
    try:
        return pd.read_csv(path)
    except Exception as e:
        last_exc = e

    for enc in ("utf-8", "latin1", "cp1252"):
        try:
            return pd.read_csv(path, engine="python", encoding=enc, on_bad_lines="skip")
        except TypeError:
            # older pandas
            try:
                return pd.read_csv(path, engine="python", encoding=enc, error_bad_lines=False)
            except Exception as e:
                last_exc = e
        except Exception as e:
            last_exc = e

    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            txt = f.read()
        return pd.read_csv(StringIO(txt))
    except Exception as e:
        last_exc = e

    raise last_exc

if not os.path.isfile(CSV_PATH):
    raise FileNotFoundError(f"CSV not found at: {CSV_PATH}")

df = safe_read_csv(CSV_PATH)
df = df.reset_index(drop=True)

# ---------- column heuristics ----------
cols = {c.lower(): c for c in df.columns}
name_col=cols.get("name", df.columns[0])
title_col = cols.get("title", df.columns[0])
genre_col = cols.get("genre", cols.get("genres", None))
overview_col = cols.get("overview", None)

# poster / rating columns best-effort
poster_col = None
rating_col = None
for lower, orig in cols.items():
    if "poster" in lower or "image" in lower:
        poster_col = orig
    if "vote" in lower or "rating" in lower:
        rating_col = orig

# combined text for each movie
def make_combined(row):
    parts = []
    parts.append(str(row.get(title_col, "")))
    if genre_col:
        parts.append(str(row.get(genre_col, "")))
    if overview_col:
        parts.append(str(row.get(overview_col, "")))
    # include year and any other short text columns
    for c in ["tags", "keywords", "cast", "actors"]:
        if c in row.index:
            parts.append(str(row[c]))
    return " ".join([p for p in parts if p and p != "nan"])

df["combined"] = df.apply(make_combined, axis=1)

# derive year if available
if "year" not in df.columns:
    # Try to find Release_Date or release_date (case-insensitive)
    release_date_col = None
    for k in cols:
        if k.lower() == "release_date":
            release_date_col = cols[k]
            break
    if release_date_col:
        print(f"[MOVIEMATE] Found release_date column: {release_date_col}")
        try:
            df["year"] = pd.to_datetime(df[release_date_col], errors="coerce").dt.year
        except Exception:
            print(f"[MOVIEMATE] Failed to extract year from {release_date_col}")
            df["year"] = None
    else:
        print("[MOVIEMATE] No release_date column found for year extraction")

# ---------- EMBEDDING HELPERS ----------
def call_gemini_embeddings(texts):
    """
    Call Gemini embeddings endpoint.
    Accepts single string or list of strings.
    Returns list of embedding vectors.
    """
    assert GEMINI_API_KEY, "GEMINI_API_KEY not set"
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:embedContent"  # update to correct Gemini endpoint
    headers = {"Authorization": f"Bearer {GEMINI_API_KEY}"}
    payload = {"model": EMBED_MODEL, "input": texts}
    resp = requests.post(url, json=payload, headers=headers, timeout=30)
    resp.raise_for_status()
    j = resp.json()
    # expected structure: {"data": [{"embedding": [...]}, ...]}
    embeddings = [item["embedding"] for item in j.get("data", [])]
    return embeddings

movie_embeddings = None
use_embeddings = False

# Try to load cached embeddings
if os.path.exists(EMBED_FILE):
    try:
        movie_embeddings = np.load(EMBED_FILE)
        use_embeddings = True
        print(f"[recommender] Loaded embeddings from {EMBED_FILE}")
    except Exception:
        movie_embeddings = None
        use_embeddings = False

# If cache missing and API key available, generate embeddings (in batches)
if movie_embeddings is None and GEMINI_API_KEY:
    try:
        print("[recommender] Generating embeddings for all movies (this may take a while)...")
        batch = []
        batch_idx = []
        embs = []
        BATCH_SIZE = 64
        for i, text in enumerate(df["combined"].fillna("")):
            batch.append(text)
            batch_idx.append(i)
            if len(batch) >= BATCH_SIZE or i == len(df) - 1:
                out = call_gemini_embeddings(batch)
                embs.extend(out)
                batch = []
                batch_idx = []

        movie_embeddings = np.array(embs, dtype=np.float32)
        np.save(EMBED_FILE, movie_embeddings)
        use_embeddings = True
        print(f"[recommender] Saved embeddings to {EMBED_FILE}")
    except Exception as e:
        print("[recommender] Failed to generate embeddings (will fallback to TF-IDF):", e)
        movie_embeddings = None
        use_embeddings = False

# ---------- TF-IDF fallback ----------
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
from nltk.stem import PorterStemmer
import nltk
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

tfidf = None
tfidf_matrix = None
def custom_tokenizer(text):
    stemmer = PorterStemmer()
    tokens = nltk.word_tokenize(text.lower())
    return [stemmer.stem(t) for t in tokens if t.isalpha() and t not in ENGLISH_STOP_WORDS]

if not use_embeddings:
    try:
        print("[recommender] Building improved TF-IDF matrix as fallback...")
        tfidf = TfidfVectorizer(
            stop_words="english",
            max_features=50000,
            tokenizer=custom_tokenizer,
            ngram_range=(1,2),
            min_df=2,
            max_df=0.95
        )
        tfidf_matrix = tfidf.fit_transform(df["combined"].fillna("").astype(str))
        print(f"[recommender] TF-IDF matrix built: shape={tfidf_matrix.shape}")
    except Exception as e:
        print("[recommender] TF-IDF build failed:", e)
        tfidf = None
        tfidf_matrix = None

# ---------- helper: build result object ----------
def row_to_movie(idx, row):
    return {
        "id": int(idx) if not pd.isna(idx) else None,
        "title": str(row.get(title_col, "") if title_col in row.index else ""),
        "poster": str(row.get(poster_col, None)) if poster_col and poster_col in row.index else None,
        "overview": str(row.get(overview_col, "")) if overview_col and overview_col in row.index else "",
        "rating": float(row.get(rating_col)) if rating_col and rating_col in row.index and not pd.isna(row.get(rating_col)) else None,
        "year": int(row.get("year")) if "year" in row.index and not pd.isna(row.get("year")) else None,
    }

# ---------- MAIN: recommend_from_query ----------
def recommend_from_query(query, top_k=12):
    """
    Returns top_k films as semantic matches to the free-text query.
    Uses Gemini embeddings if available, else TF-IDF as fallback.
    """
    if use_embeddings and movie_embeddings is not None:
        try:
            q_emb = np.array(call_gemini_embeddings([query]))  # shape (1, dim)
            sims = cosine_similarity(q_emb, movie_embeddings)[0]
            idxs = sims.argsort()[-top_k:][::-1]
        except Exception as e:
            print("[recommender] Embedding query failed, falling back to TF-IDF:", e)
            idxs = _tfidf_search_idxs(query, top_k)
    else:
        idxs = _tfidf_search_idxs(query, top_k)

    results = []
    for i in idxs:
        r = df.iloc[i]
        results.append(row_to_movie(i, r))
    return results

def _tfidf_search_idxs(query, top_k):
    # Enhanced TF-IDF search: filter by language, year, rating, popularity, genre tokens
    # Parse query for tokens (genres), language, year, rating, popularity
    import re
    tokens = [t.strip().lower() for t in re.split(r"[ ,\n]", query) if t.strip()]
    filtered = df.copy()

    # Try to filter by language
    lang = None
    for candidate in ["original_language", "Original_Language"]:
        if candidate in filtered.columns:
            lang = candidate
            break
    # If a language token is present, filter
    if lang:
        # Use first token that matches a language code
        for t in tokens:
            if len(t) == 2 and filtered[lang].str.contains(t, case=False, na=False).any():
                filtered[lang] = filtered[lang].astype(str).str.lower()
                filtered = filtered[filtered[lang].str.contains(t, na=False)]
                break

    # Filter by year if tokens look like years
    year_tokens = [int(t) for t in tokens if t.isdigit() and 1900 <= int(t) <= 2100]
    if "year" in filtered.columns and year_tokens:
        filtered["year"] = pd.to_numeric(filtered["year"], errors='coerce')
        filtered = filtered.dropna(subset=["year"])
        filtered = filtered[filtered["year"].isin(year_tokens)]

    # Filter by rating if tokens look like floats between 0 and 10
    rating_tokens = [float(t) for t in tokens if re.match(r"^\d+(\.\d+)?$", t) and 0 <= float(t) <= 10]
    if rating_col and rating_col in filtered.columns and rating_tokens:
        filtered[rating_col] = pd.to_numeric(filtered[rating_col], errors='coerce')
        filtered = filtered.dropna(subset=[rating_col])
        filtered = filtered[filtered[rating_col] >= min(rating_tokens)]

    # Filter by popularity if tokens look like ints between 0 and 10000
    pop_col = None
    for candidate in ("popularity", "Popularity"):
        if candidate in filtered.columns:
            pop_col = candidate
            break
    pop_tokens = [float(t) for t in tokens if t.isdigit() and 0 <= float(t) <= 10000]
    if pop_col and pop_tokens:
        filtered[pop_col] = pd.to_numeric(filtered[pop_col], errors='coerce')
        filtered = filtered.dropna(subset=[pop_col])
        filtered = filtered[filtered[pop_col] >= min(pop_tokens)]

    # Filter by genre tokens
    if genre_col and genre_col in filtered.columns:
        filtered[genre_col] = filtered[genre_col].astype(str).str.lower()
        for token in tokens:
            mask = (
                filtered[genre_col].str.contains(rf"\b{re.escape(token)}\b", na=False) |
                filtered[genre_col].str.contains(token, na=False)
            )
            filtered = filtered[mask]

    # If no matches, fallback to TF-IDF on all
    if filtered.empty:
        if tfidf_matrix is None:
            scores = df["combined"].fillna("").astype(str).str.lower().apply(lambda s: sum(1 for w in query.lower().split() if w in s))
            idxs = scores.sort_values().index[-top_k:][::-1]
            return list(idxs)
        qvec = tfidf.transform([query])
        scores = cosine_similarity(qvec, tfidf_matrix).flatten()
        return list(scores.argsort()[-top_k:][::-1])
    # Otherwise, rank filtered by TF-IDF
    if tfidf_matrix is not None:
        idxs = filtered.index.tolist()
        sub_matrix = tfidf_matrix[idxs]
        qvec = tfidf.transform([query])
        scores = cosine_similarity(qvec, sub_matrix).flatten()
        sorted_idxs = [idxs[i] for i in scores.argsort()[-top_k:][::-1]]
        return sorted_idxs
    else:
        scores = filtered["combined"].fillna("").astype(str).str.lower().apply(lambda s: sum(1 for w in query.lower().split() if w in s))
        idxs = scores.sort_values().index[-top_k:][::-1]
    return list(idxs)

# ---------- QUIZ-based recommendations (filters + semantic rerank) ----------
def recommend_from_quiz(filters, top_k=12):
    filtered = df.copy()

    # ---------------------------------------
    # LANGUAGE FILTER
    # ---------------------------------------
    lang = (filters.get("original_language") or "").strip().lower()
    language_col = None
    for candidate in ["original_language", "Original_Language"]:
        if candidate in filtered.columns:
            language_col = candidate
            print(f"[MOVIEMATE] Found language column: {candidate}")
            break
    if not language_col:
        print("[MOVIEMATE] No language column found for filtering")
    if lang and language_col:
        filtered[language_col] = filtered[language_col].astype(str).str.lower()
        filtered = filtered[filtered[language_col].str.contains(lang, na=False)]

    # ---------------------------------------
    # GENRE FILTER (STRONG + SMART)
    # ---------------------------------------
    raw_genres = (filters.get("genres") or "").strip()

    if raw_genres:
        tokens = [
            t.strip().lower() 
            for t in re.split(r"[,\n]", raw_genres) 
            if t.strip()
        ]

        if genre_col and genre_col in filtered.columns:
            # normalize genres
            filtered[genre_col] = filtered[genre_col].astype(str).str.lower()

            for token in tokens:
                mask = (
                    filtered[genre_col].str.contains(rf"\b{re.escape(token)}\b", na=False) |
                    filtered[genre_col].str.contains(token, na=False)
                )
                filtered = filtered[mask]

        # fallback to combined search if no match or no genre column
        if filtered.empty:
            base = df.copy()
            base["combined"] = base["combined"].astype(str).str.lower()
            for token in tokens:
                mask = base["combined"].str.contains(token, na=False)
                base = base[mask]
            filtered = base.copy()

    # ---------------------------------------
    # ACTORS FILTER
    # ---------------------------------------
    actor_in = (filters.get("actors") or "").strip()
    if actor_in:
        actors_col = None
        for c in ["actors", "cast", "starring"]:
            if c in filtered.columns:
                actors_col = c
                break

        if actors_col:
            filtered[actors_col] = filtered[actors_col].astype(str).str.lower()
            for a in actor_in.split(","):
                tok = a.strip().lower()
                if tok:
                    filtered = filtered[actors_col].str.contains(tok, na=False)

    # ---------------------------------------
    # RATING FILTER
    # ---------------------------------------
    if filters.get("average_rating") and rating_col and rating_col in filtered.columns:
        try:
            rating_val = float(filters["average_rating"])
            filtered[rating_col] = pd.to_numeric(filtered[rating_col], errors="coerce")
            filtered = filtered[filtered[rating_col] >= rating_val]
        except:
            pass

    # ---------------------------------------
    # POPULARITY FILTER
    # ---------------------------------------
    pop_col = None
    for candidate in ("popularity", "Popularity"):
        if candidate in filtered.columns:
            pop_col = candidate
            break

    if filters.get("popularity") and pop_col:
        try:
            pop_val = float(filters["popularity"])
            filtered[pop_col] = pd.to_numeric(filtered[pop_col], errors="coerce")
            filtered = filtered[filtered[pop_col] >= pop_val]
        except:
            pass

    # ---------------------------------------
    # YEAR RANGE FILTER
    # ---------------------------------------
    try:
        ys = int(filters.get("yearStart")) if filters.get("yearStart") else None
        ye = int(filters.get("yearEnd")) if filters.get("yearEnd") else None

        if "year" in filtered.columns:
            filtered["year"] = pd.to_numeric(filtered["year"], errors="coerce")
            filtered = filtered.dropna(subset=["year"])

            if ys and ye:
                filtered = filtered[(filtered["year"] >= ys) & (filtered["year"] <= ye)]
            elif ys:
                filtered = filtered[filtered["year"] >= ys]
            elif ye:
                filtered = filtered[filtered["year"] <= ye]
    except:
        pass

    # ---------------------------------------
    # NO RESULTS? Return empty
    # ---------------------------------------
    if filtered.empty:
        return []

    # ---------------------------------------
    # SEMANTIC RE-RANK (Gemini)
    # ---------------------------------------
    if use_embeddings and movie_embeddings is not None:
        idxs = filtered.index.to_list()
        query = " ".join([
            filters.get("genres",""),
            filters.get("mood",""),
            filters.get("actors","")
        ]).strip()

        try:
            q_emb = np.array(call_gemini_embeddings([query]))
            sims = cosine_similarity(q_emb, movie_embeddings[idxs])[0]
            order = np.array(idxs)[sims.argsort()[-top_k:][::-1]]
        except:
            order = filtered.head(top_k).index.to_list()

    else:
        # Enhanced TF-IDF fallback: build query from all filter fields
        query_parts = []
        for key in ["genres", "original_language", "yearStart", "yearEnd", "average_rating", "popularity", "actors"]:
            val = filters.get(key)
            if val:
                query_parts.append(str(val))
        query = " ".join(query_parts).strip()
        candidates = _tfidf_search_idxs(query, top_k)
        order = [i for i in candidates if i in filtered.index][:top_k]

    # ---------------------------------------
    # BUILD RESULTS
    # ---------------------------------------
    results = []
    for i in order[:top_k]:
        row = df.iloc[i]
        results.append(row_to_movie(i, row))

    return results




from .gemini_query_expander import expand_query_with_gemini

def recommend_from_name_and_genre(movie_name: str, genre: str):
    """
    Filter by movie name + genre.
    If <10 results, call Gemini 2.5 Flash to EXPAND the query,
    then feed the expanded query into TF-IDF search.
    """

    # Normalize
    movie_name_raw = movie_name or ""
    genre_raw = genre or ""

    name_clean = movie_name_raw.lower().strip()
    genre_clean = genre_raw.lower().strip()

    # -------------------- BASIC FILTERING --------------------
    filtered = df.copy()

    if name_clean:
        filtered = filtered[
            filtered[name_col]
            .astype(str)
            .str.lower()
            .str.contains(name_clean)
        ]

    if genre_clean:
        filtered = filtered[
            filtered[genre_col]
            .astype(str)
            .str.lower()
            .str.contains(genre_clean)
        ]

    # Convert to results list
    results = [
        row_to_movie(idx, row)
        for idx, row in filtered.head(10).iterrows()
    ]

    # If enough, return
    if len(results) >= 10:
        return results[:10]

    # -------------------- GEMINI QUERY EXPANSION --------------------
    needed = 10 - len(results)
    raw_query = f"{movie_name_raw} {genre_raw}".strip()

    expanded_query = expand_query_with_gemini(raw_query)

    # -------------------- TF-IDF FALLBACK --------------------
    tfidf_idxs = _tfidf_search_idxs(expanded_query, top_k=needed + 10)

    for i in tfidf_idxs:
        row = df.iloc[i]
        movie_obj = row_to_movie(i, row)

        if movie_obj not in results:
            results.append(movie_obj)

        if len(results) >= 10:
            break

    return results[:10]






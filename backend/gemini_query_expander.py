import google.generativeai as genai

genai.configure(api_key="AIzaSyBM7u_0_YfSe4rTAV3ubcy9dZT1aD8YBJk")
MODEL = "gemini-2.5-flash"


def expand_query_with_gemini(query: str) -> str:
    """
    Use Gemini 2.5 Flash to generate a richer semantic search query.
    Returns a single expanded string.
    """

    prompt = f"""
You are a movie genre classifier.

Allowed genre buckets:
1. Action, Adventure, Fantasy
2. Drama, Romance
3. Animation, Family, Comedy

Given this user query:
"{query}"

Your task:
- Select the ONE bucket that best matches the movie.
- Return ONLY the exact bucket string.
- No explanation, no extra text.

Output format example:
"Action, Adventure, Fantasy"
"""


    try:
        model = genai.GenerativeModel(MODEL)
        resp = model.generate_content(prompt)
        expanded = resp.text.strip().replace("\n", " ")
        return expanded
    except Exception as e:
        print("Gemini Query Expansion Error:", e)
        return query

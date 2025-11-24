import { useState } from "react";
// Removed useNavigate import as it's no longer needed for like functionality redirection
import MovieCard from "../components/MovieCard";
import Loader from "../components/Loader";
import { backendApi } from "../api"; // Removed likeMovie import

function Recommendations() {
  const [movieName, setMovieName] = useState("");
  const [genre, setGenre] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  // Removed useNavigate initialization

  const handleChatRecommendSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      movie_name: movieName,
      genre: genre,
    };

    try {
      const res = await backendApi.post("/recommend/chat", payload);
      setMovies(res.data.movies || []);
    } catch (error) {
      console.error("Failed to fetch chat recommendations:", error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Page Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[#22c1c3] to-[#fdbb2d] bg-clip-text text-transparent">
            Movie Search
          </h1>
          <p className="text-[#9AA7B3] text-lg">
            Enter a movie or genre to find recommendations.
          </p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleChatRecommendSubmit}
          className="bg-[#111418] rounded-lg p-6 sm:p-8 shadow-xl space-y-6 mb-12"
        >
          <h2 className="text-2xl font-bold text-center text-[#E6EEF3] mb-6">Search for movies</h2>
          {/* Movie Name */}
          <div>
            <label className="block text-[#E6EEF3] font-semibold mb-2">
              Movie Name
            </label>
            <input
              type="text"
              value={movieName}
              onChange={(e) => setMovieName(e.target.value)}
              placeholder="e.g., Inception"
              className="w-full px-4 py-3 bg-[#0b0f14] border border-gray-700 rounded-lg text-[#E6EEF3] placeholder-[#9AA7B3] focus:outline-none focus:border-[#22c1c3] transition-colors"
            />
          </div>

          {/* Genre */}
          <div>
            <label className="block text-[#E6EEF3] font-semibold mb-2">
              Genre
            </label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g., Action"
              className="w-full px-4 py-3 bg-[#0b0f14] border border-gray-700 rounded-lg text-[#E6EEF3] placeholder-[#9AA7B3] focus:outline-none focus:border-[#22c1c3] transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 py-4 bg-gradient-to-r from-[#22c1c3] to-[#fdbb2d] rounded-lg font-semibold text-lg text-[#0b0f14] hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <span>Get Recommendations</span>
          </button>
        </form>

        {/* Results */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <Loader />
          </div>
        ) : movies.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                title={movie.title}
                poster={movie.poster}
                overview={movie.overview}
                rating={movie.rating}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-[#9AA7B3] text-lg mt-10">
            No recommendations yet — search something!
          </div>
        )}
      </div>
    </div>
  );
}

export default Recommendations;

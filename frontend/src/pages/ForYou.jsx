import React, { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import Loader from "../components/Loader";
import { backendApi } from "../api";

function ForYou() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenreRecommendations = async () => {
      const hasSelectedGenres = sessionStorage.getItem("hasSelectedGenres") === "true";
      if (hasSelectedGenres) {
        setLoading(true);
        try {
          const res = await backendApi.get("/recommend/genres");
          setMovies(res.data.movies || []);
        } catch (error) {
          console.error("Failed to fetch genre recommendations:", error);
          setMovies([]);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false); // No genres selected, so no initial loading
      }
    };

    fetchGenreRecommendations();
  }, []); // Run only once on component mount

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Page Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[#22c1c3] to-[#fdbb2d] bg-clip-text text-transparent">
            For You
          </h1>
          <p className="text-[#9AA7B3] text-lg">
            Personalized movie recommendations based on your selected genres.
          </p>
        </div>

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
            No recommendations found for your selected genres.
          </div>
        )}
      </div>
    </div>
  );
}

export default ForYou;

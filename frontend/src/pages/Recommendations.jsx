import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import Loader from '../components/Loader';
import { getRecommendations } from '../api';

function Recommendations() {
  const location = useLocation();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      const preferences = location.state?.preferences || JSON.parse(localStorage.getItem('moviePreferences') || '{}');

      const results = await getRecommendations(preferences);
      setMovies(results);
      setLoading(false);
    };

    fetchRecommendations();
  }, [location.state]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[#22c1c3] to-[#fdbb2d] bg-clip-text text-transparent">
            Your Movie Recommendations
          </h1>
          <p className="text-[#9AA7B3] text-lg">
            Based on your preferences, here are some movies you might love
          </p>
        </div>

        {movies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#9AA7B3] text-xl">No recommendations found. Try adjusting your preferences!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        )}
      </div>
    </div>
  );
}

export default Recommendations;

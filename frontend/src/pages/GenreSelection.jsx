import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { genres } from '../utils/genres'; // Assuming a genres list
import { backendApi } from '../api'; // Assuming an API utility

const GenreSelection = ({ onGenreSelectionComplete }) => {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenreToggle = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSubmit = async () => {
    if (selectedGenres.length === 0) {
      alert('Please select at least one genre.');
      return;
    }
    setLoading(true);
    try {
      // Send selected genres to backend
      await backendApi.post('/genres', { genres: selectedGenres });
      sessionStorage.setItem('hasSelectedGenres', 'true'); // Mark as genres selected in session storage
      if (onGenreSelectionComplete) {
        onGenreSelectionComplete();
      }
      navigate('/for-you'); // Redirect to the new For You page
    } catch (error) {
      console.error('Failed to save genres:', error);
      alert('Failed to save genres. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Select Your Favorite Genres</h1>
      <p className="text-lg text-gray-400 mb-8 text-center">
        Choose at least one genre to get personalized movie recommendations.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8 max-w-4xl w-full">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => handleGenreToggle(genre)}
            className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-200
              ${selectedGenres.includes(genre)
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-700 hover:bg-gray-600'}
            `}
          >
            {genre}
          </button>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving...' : 'Get Recommendations'}
      </button>
    </div>
  );
};

export default GenreSelection;

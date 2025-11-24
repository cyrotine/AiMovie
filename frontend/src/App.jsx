import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import ChatbotButton from "./components/ChatbotButton";
import Home from "./pages/Home";
import Results from "./pages/Results";
import Recommendations from "./pages/Recommendations";
import Chatbot from "./pages/Chatbot";
import Login from "./pages/Login";
import GenreSelection from "./pages/GenreSelection";
import ForYou from "./pages/ForYou"; // Import the new ForYou page

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem("isLoggedIn") === "true";
  });
  const [hasSelectedGenres, setHasSelectedGenres] = useState(() => {
    // Use sessionStorage for genre selection, it clears on tab/window close
    return sessionStorage.getItem("hasSelectedGenres") === "true";
  });

  const handleLogin = () => {
    setIsLoggedIn(true);
    sessionStorage.setItem("isLoggedIn", "true");
    // When a user logs in, reset the genre selection flag for the new session
    sessionStorage.removeItem("hasSelectedGenres");
    setHasSelectedGenres(false);
  };

  const handleGenreSelectionComplete = () => {
    setHasSelectedGenres(true);
    sessionStorage.setItem("hasSelectedGenres", "true");
  };

  useEffect(() => {
    if (isLoggedIn) {
      sessionStorage.setItem("isLoggedIn", "true");
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // Redirect after login if genres haven't been selected yet
  if (isLoggedIn && !hasSelectedGenres) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/select-genres" element={<GenreSelection onGenreSelectionComplete={handleGenreSelectionComplete} />} />
          {/* Redirect all other paths to select-genres if not already there */}
          <Route path="*" element={<GenreSelection onGenreSelectionComplete={handleGenreSelectionComplete} />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/results" element={<Results />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/for-you" element={<ForYou />} /> {/* New route for ForYou page */}
        <Route path="/chat" element={<Chatbot />} />
        {/* After genre selection, redirect to For You page */}
        <Route path="/select-genres" element={<ForYou />} />
      </Routes>
      <ChatbotButton />
    </BrowserRouter>
  );
}

export default App;

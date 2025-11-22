import { useState } from "react";
import MovieCard from "../components/MovieCard";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text: input }]);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/recommend/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      setAiMessage(data.aiMessage || "");
      setMovies(data.movies || []);
      setMessages((prev) => [...prev, { from: "ai", text: data.aiMessage || "" }]);
    } catch (e) {
      setAiMessage("Sorry, something went wrong. Try again later.");
      setMovies([]);
    }
    setInput("");
    setLoading(false);
  };

  return (
    <div className="p-8 text-white min-h-[calc(100vh-4rem)]">
      <div className="space-y-4 mb-6">
        {messages.map((m, i) => (
          <div key={i} className={m.from === "user" ? "text-right" : "text-left"}>
            <div className="inline-block bg-gray-800 px-4 py-2 rounded-lg">
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-8">
        <input
          className="bg-gray-900 p-3 rounded flex-1"
          placeholder="I want something wholesome..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="bg-blue-500 p-3 rounded" onClick={sendMessage} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>

      {aiMessage && (
        <div className="mb-6 text-lg text-[#fdbb2d] font-semibold">
          {aiMessage}
        </div>
      )}

      {movies.length > 0 && (
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
  );
}

export default Chatbot;

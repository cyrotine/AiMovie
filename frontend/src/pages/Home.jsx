import { useNavigate } from 'react-router-dom';
import { Sparkles, MessageSquare } from 'lucide-react';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-[#22c1c3] to-[#fdbb2d] bg-clip-text text-transparent">
              Find Your Perfect Movie
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-[#9AA7B3] max-w-2xl mx-auto leading-relaxed">
            Discover personalized movie recommendations tailored to your taste, mood, and preferences
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <button
            onClick={() => navigate('/quiz')}
            className="group relative px-8 py-4 bg-gradient-to-r from-[#22c1c3] to-[#fdbb2d] rounded-lg font-semibold text-lg text-[#0b0f14] hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center space-x-2 min-w-[200px] justify-center"
          >
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Search Recommendation</span>
          </button>

          <button
            onClick={() => navigate('/chat')}
            className="group px-8 py-4 bg-[#111418] border-2 border-[#22c1c3] rounded-lg font-semibold text-lg text-[#22c1c3] hover:bg-[#22c1c3] hover:text-[#0b0f14] hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center space-x-2 min-w-[200px] justify-center"
          >
            <MessageSquare className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Ask AI</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 max-w-3xl mx-auto">
          <div className="bg-[#111418] p-6 rounded-lg border border-gray-800 hover:border-[#22c1c3] transition-all">
            <div className="text-3xl mb-3">🎬</div>
            <h3 className="text-lg font-semibold text-[#E6EEF3] mb-2">Smart Recommendations</h3>
            <p className="text-[#9AA7B3] text-sm">AI-powered suggestions based on your preferences</p>
          </div>

          <div className="bg-[#111418] p-6 rounded-lg border border-gray-800 hover:border-[#22c1c3] transition-all">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="text-lg font-semibold text-[#E6EEF3] mb-2">Chat with AI</h3>
            <p className="text-[#9AA7B3] text-sm">Get personalized movie suggestions through conversation</p>
          </div>

          <div className="bg-[#111418] p-6 rounded-lg border border-gray-800 hover:border-[#22c1c3] transition-all">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="text-lg font-semibold text-[#E6EEF3] mb-2">Mood-Based</h3>
            <p className="text-[#9AA7B3] text-sm">Find movies that match your current mood</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

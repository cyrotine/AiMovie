import { Link, useLocation } from 'react-router-dom';
import { Film } from 'lucide-react';

function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-[#111418] border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <Film className="w-8 h-8 text-[#22c1c3] group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold bg-gradient-to-r from-[#22c1c3] to-[#fdbb2d] bg-clip-text text-transparent">
              Movie Recommender
            </span>
          </Link>

          <div className="flex space-x-1 sm:space-x-2">
            <Link
              to="/"
              className={`px-3 sm:px-4 py-2 rounded-lg transition-all ${
                isActive('/')
                  ? 'bg-[#22c1c3] text-[#0b0f14] font-semibold'
                  : 'text-[#9AA7B3] hover:text-[#E6EEF3] hover:bg-[#1a1f24]'
              }`}
            >
              Home
            </Link>
            <Link
              to="/chat"
              className={`px-3 sm:px-4 py-2 rounded-lg transition-all ${
                isActive('/chat')
                  ? 'bg-[#22c1c3] text-[#0b0f14] font-semibold'
                  : 'text-[#9AA7B3] hover:text-[#E6EEF3] hover:bg-[#1a1f24]'
              }`}
            >
              Chatbot
            </Link>
            <Link
              to="/recommendations"
              className={`px-3 sm:px-4 py-2 rounded-lg transition-all ${
                isActive('/recommendations')
                  ? 'bg-[#22c1c3] text-[#0b0f14] font-semibold'
                  : 'text-[#9AA7B3] hover:text-[#E6EEF3] hover:bg-[#1a1f24]'
              }`}
            >
              Search
            </Link>
            <Link
              to="/for-you"
              className={`px-3 sm:px-4 py-2 rounded-lg transition-all ${
                isActive('/for-you')
                  ? 'bg-[#22c1c3] text-[#0b0f14] font-semibold'
                  : 'text-[#9AA7B3] hover:text-[#E6EEF3] hover:bg-[#1a1f24]'
              }`}
            >
              For You
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

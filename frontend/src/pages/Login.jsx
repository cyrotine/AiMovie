import { useState } from "react";
import { Film, Sparkles } from "lucide-react";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Fake login - accepts any credentials
    if (username && password) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-[#22c1c3] to-[#fdbb2d] rounded-2xl">
              <Film className="w-12 h-12 text-[#0b0f14]" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold">
            <span className="bg-gradient-to-r from-[#22c1c3] to-[#fdbb2d] bg-clip-text text-transparent">
              AI Movie
            </span>
          </h1>
          <p className="text-[#9AA7B3] text-lg">Sign in to discover your perfect movie</p>
        </div>
        
        {/* Login Form */}
        <div className="bg-[#111418] border border-gray-800 rounded-xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#E6EEF3] mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-[#0b0f14] border border-gray-700 rounded-lg text-[#E6EEF3] placeholder-[#9AA7B3] focus:outline-none focus:border-[#22c1c3] focus:ring-2 focus:ring-[#22c1c3]/20 transition-all"
                placeholder="Enter your username"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#E6EEF3] mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#0b0f14] border border-gray-700 rounded-lg text-[#E6EEF3] placeholder-[#9AA7B3] focus:outline-none focus:border-[#22c1c3] focus:ring-2 focus:ring-[#22c1c3]/20 transition-all"
                placeholder="Enter your password"
                required
              />
            </div>
            
            <button
              type="submit"
              className="group w-full px-8 py-4 bg-gradient-to-r from-[#22c1c3] to-[#fdbb2d] rounded-lg font-semibold text-lg text-[#0b0f14] hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Sign In</span>
            </button>
          </form>
        </div>

        {/* Features Preview */}
      </div>
    </div>
  );
}

export default Login;

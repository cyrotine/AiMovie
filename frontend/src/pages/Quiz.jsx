import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';

function Quiz() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    genres: '',
    average_rating: 0,
    popularity: 0,
    yearStart: '',
    yearEnd: '',
    language: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // save preferences for the Recommendations page
    localStorage.setItem('moviePreferences', JSON.stringify(formData));

    const res = await fetch("http://localhost:8000/api/recommend/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    // navigate to recommendations; Recommendations page will fetch results
    navigate('/recommendations', { state: { preferences: formData } });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[#22c1c3] to-[#fdbb2d] bg-clip-text text-transparent">
            Movie Preference Quiz
          </h1>
          <p className="text-[#9AA7B3] text-lg">
            Tell us what you're looking for and we'll find the perfect movies for you
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#111418] rounded-lg p-6 sm:p-8 shadow-xl space-y-6">
          <div>
            <label htmlFor="genres" className="block text-[#E6EEF3] font-semibold mb-2">
              Preferred Genres
            </label>
            <input
              type="text"
              id="genres"
              name="genres"
              value={formData.genres}
              onChange={handleChange}
              placeholder="e.g., Action, Comedy, Thriller"
              className="w-full px-4 py-3 bg-[#0b0f14] border border-gray-700 rounded-lg text-[#E6EEF3] placeholder-[#9AA7B3] focus:outline-none focus:border-[#22c1c3] transition-colors"
            />
          </div>

        

          <div>
            <label htmlFor="average_rating" className="block text-[#E6EEF3] font-semibold mb-2">
              Minimum Average Rating
            </label>
            <div className="flex items-center mb-2">
              <span className="text-[#22c1c3] font-bold text-xl mr-4">{formData.average_rating}</span>
              <input
                type="range"
                id="average_rating"
                name="average_rating"
                min="0"
                max="10"
                step="0.1"
                value={formData.average_rating}
                onChange={e => setFormData({ ...formData, average_rating: Number(e.target.value) })}
                className="w-full h-2 bg-[#0b0f14] rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label htmlFor="popularity" className="block text-[#E6EEF3] font-semibold mb-2">
              Minimum Popularity
            </label>
            <div className="flex items-center mb-2">
              <span className="text-[#fdbb2d] font-bold text-xl mr-4">{formData.popularity}</span>
              <input
                type="range"
                id="popularity"
                name="popularity"
                min="0"
                max="100"
                step="1"
                value={formData.popularity}
                onChange={e => setFormData({ ...formData, popularity: Number(e.target.value) })}
                className="w-full h-2 bg-[#0b0f14] rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="yearStart" className="block text-[#E6EEF3] font-semibold mb-2">
                Year From
              </label>
              <input
                type="number"
                id="yearStart"
                name="yearStart"
                value={formData.yearStart}
                onChange={handleChange}
                placeholder="1990"
                min="1900"
                max="2024"
                className="w-full px-4 py-3 bg-[#0b0f14] border border-gray-700 rounded-lg text-[#E6EEF3] placeholder-[#9AA7B3] focus:outline-none focus:border-[#22c1c3] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="yearEnd" className="block text-[#E6EEF3] font-semibold mb-2">
                Year To
              </label>
              <input
                type="number"
                id="yearEnd"
                name="yearEnd"
                value={formData.yearEnd}
                onChange={handleChange}
                placeholder="2024"
                min="1900"
                max="2024"
                className="w-full px-4 py-3 bg-[#0b0f14] border border-gray-700 rounded-lg text-[#E6EEF3] placeholder-[#9AA7B3] focus:outline-none focus:border-[#22c1c3] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="language" className="block text-[#E6EEF3] font-semibold mb-2">
                Language
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0b0f14] border border-gray-700 rounded-lg text-[#E6EEF3] focus:outline-none focus:border-[#22c1c3] transition-colors"
              >
                <option value="">Any</option>
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="zh">Chinese</option>
                <option value="hi">Hindi</option>
                <option value="ru">Russian</option>
                <option value="pt">Portuguese</option>
                <option value="ar">Arabic</option>
                <option value="tr">Turkish</option>
                <option value="sv">Swedish</option>
                <option value="nl">Dutch</option>
                <option value="pl">Polish</option>
                <option value="fa">Persian</option>
                <option value="he">Hebrew</option>
                <option value="bn">Bengali</option>
                <option value="ta">Tamil</option>
                <option value="te">Telugu</option>
                <option value="th">Thai</option>
                <option value="uk">Ukrainian</option>
                <option value="id">Indonesian</option>
                <option value="no">Norwegian</option>
                <option value="da">Danish</option>
                <option value="fi">Finnish</option>
                <option value="el">Greek</option>
                <option value="cs">Czech</option>
                <option value="ro">Romanian</option>
                <option value="hu">Hungarian</option>
                <option value="et">Estonian</option>
                <option value="lt">Lithuanian</option>
                <option value="lv">Latvian</option>
                <option value="ms">Malay"</option>
                <option value="ml">Malayalam"</option>
                <option value="eu">Basque"</option>
                <option value="ca">Catalan"</option>
              </select>
            </div>
          </div>

          {/* maxRuntime input removed */}

          <button
            type="submit"
            className="w-full px-6 py-4 bg-gradient-to-r from-[#22c1c3] to-[#fdbb2d] rounded-lg font-semibold text-lg text-[#0b0f14] hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <span>Get Recommendations</span>
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default Quiz;

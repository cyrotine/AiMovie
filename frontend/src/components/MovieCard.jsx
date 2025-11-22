import { Star } from 'lucide-react';

function MovieCard({ title, poster, overview, rating }) {
  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="bg-[#111418] rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
      <div className="relative overflow-hidden">
        <img
          src={poster || 'https://via.placeholder.com/300x450?text=No+Poster'}
          alt={title}
          className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {rating && (
          <div className="absolute top-3 right-3 bg-[#0b0f14] bg-opacity-90 px-2 py-1 rounded-lg flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-semibold">{rating}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-[#E6EEF3] mb-2 line-clamp-1">
          {title}
        </h3>
        <p className="text-[#9AA7B3] text-sm leading-relaxed">
          {truncateText(overview)}
        </p>
      </div>
    </div>
  );
}

export default MovieCard;

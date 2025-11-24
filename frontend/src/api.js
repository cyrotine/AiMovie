const MOCK_MOVIES = [
  {
    id: 1,
    title: 'The Shawshank Redemption',
    poster: 'https://images.pexels.com/photos/4009402/pexels-photo-4009402.jpeg?auto=compress&cs=tinysrgb&w=400',
    overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    rating: 9.3,
  },
  {
    id: 2,
    title: 'The Dark Knight',
    poster: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400',
    overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
    rating: 9.0,
  },
  {
    id: 3,
    title: 'Inception',
    poster: 'https://images.pexels.com/photos/2876511/pexels-photo-2876511.jpeg?auto=compress&cs=tinysrgb&w=400',
    overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    rating: 8.8,
  },
  {
    id: 4,
    title: 'Pulp Fiction',
    poster: 'https://images.pexels.com/photos/8263332/pexels-photo-8263332.jpeg?auto=compress&cs=tinysrgb&w=400',
    overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
    rating: 8.9,
  },
  {
    id: 5,
    title: 'The Matrix',
    poster: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400',
    overview: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
    rating: 8.7,
  },
  {
    id: 6,
    title: 'Forrest Gump',
    poster: 'https://images.pexels.com/photos/4009402/pexels-photo-4009402.jpeg?auto=compress&cs=tinysrgb&w=400',
    overview: "The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold from the perspective of an Alabama man.",
    rating: 8.8,
  },
  {
    id: 7,
    title: 'Interstellar',
    poster: 'https://images.pexels.com/photos/2156881/pexels-photo-2156881.jpeg?auto=compress&cs=tinysrgb&w=400',
    overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    rating: 8.6,
  },
  {
    id: 8,
    title: 'The Godfather',
    poster: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400',
    overview: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    rating: 9.2,
  },
];

const BASE_URL = 'http://localhost:8000/api';

export const backendApi = {
  get: async (path) => {
    const res = await fetch(`${BASE_URL}${path}`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json().then(data => ({ data })); // Wrap in data object to mimic axios response structure
  },
  post: async (path, body) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json().then(data => ({ data })); // Wrap in data object to mimic axios response structure
  },
};

export const getRecommendations = async (preferences) => {
  // This function is still used by Quiz.jsx, but the recommendations page now uses backendApi.get('/recommend/genres')
  try {
    const res = await fetch(`${BASE_URL}/recommend/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences || {}),
    });

    if (!res.ok) throw new Error('Bad response');

    const data = await res.json();
    const movies = data.movies || [];

    if (movies.length > 0 && typeof movies[0] === 'string') {
      return movies.map((t, i) => ({
        id: i,
        title: t,
        poster: 'https://images.pexels.com/photos/4009402/pexels-photo-4009402.jpeg?auto=compress&cs=tinysrgb&w=400',
        overview: '',
        rating: null,
      }));
    }

    return movies.map((m, i) => ({
      id: m.id ?? i,
      title: m.title || '',
      poster: m.poster || 'https://images.pexels.com/photos/4009402/pexels-photo-4009402.jpeg?auto=compress&cs=tinysrgb&w=400',
      overview: m.overview || '',
      rating: m.rating ?? null,
    }));
  } catch (e) {
    const shuffled = [...MOCK_MOVIES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  }
};

export const sendChatMessage = async (message) => {
  try {
    const res = await fetch(`${BASE_URL}/recommend/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) throw new Error('Bad response');

    const data = await res.json();
    const movies = data.movies || [];
    const aiInterpretation = data.aiInterpretation || '';

    const movieTitles = movies.map((m) => (typeof m === 'string' ? m : m.title || '')).filter(Boolean);
    return aiInterpretation + ' — ' + movieTitles.join(', ');
  } catch (e) {
    const responses = [
      "That sounds interesting! Here are a few picks: The Matrix, Inception, Interstellar.",
      "Great choice — try The Dark Knight or Pulp Fiction.",
      "I found a few matches: Forrest Gump, The Godfather, Shawshank Redemption.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
};

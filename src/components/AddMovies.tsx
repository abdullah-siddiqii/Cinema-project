'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import HomeWrapper from './HomeWrapper';

interface Movie {
  Title: string;
  Year: string;
  Plot: string;
  Poster: string;
}

export default function AddMovies() {
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [movieData, setMovieData] = useState<Movie | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [adding, setAdding] = useState(false);

  const router = useRouter();

  const API_KEY = '45dc88ed';
  const BASE_URL = 'https://abdullah-test.whitescastle.com';
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // loader
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // suggestions
  const fetchSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      setIsSearching(true);
      const res = await fetch(
        `https://www.omdbapi.com/?s=${encodeURIComponent(searchQuery)}&apikey=${API_KEY}`
      );
      const data = await res.json();
      if (data.Response === 'True') {
        const movies: Movie[] = data.Search.map((m: any) => ({
          Title: m.Title,
          Year: m.Year,
          Plot: '',
          Poster: m.Poster !== 'N/A' ? m.Poster : '',
        }));
        setSuggestions(movies);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(true);
      }
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  };

  // debounce
  useEffect(() => {
    if (!query || manualMode) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, manualMode]);

  // select suggestion
  const handleSelectSuggestion = async (title: string) => {
    try {
      const res = await fetch(
        `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${API_KEY}`
      );
      const data = await res.json();
      if (data.Response === 'True') {
        setMovieData({
          Title: data.Title,
          Year: data.Year,
          Plot: data.Plot,
          Poster: data.Poster !== 'N/A' ? data.Poster : '',
        });
        setPosterFile(null);
        setSuggestions([]);
        setShowSuggestions(false);
        setQuery(data.Title);
        toast.success('Movie selected!');
      }
    } catch {
      toast.error('Error fetching movie details');
    }
  };

  // search button
  const handleSearch = async () => {
    if (!query) return;
    try {
      const res = await fetch(
        `https://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=${API_KEY}`
      );
      const data = await res.json();
      if (data.Response === 'True') {
        setMovieData({
          Title: data.Title,
          Year: data.Year,
          Plot: data.Plot,
          Poster: data.Poster !== 'N/A' ? data.Poster : '',
        });
        setPosterFile(null);
        setSuggestions([]);
        setShowSuggestions(false);
        toast.success('Movie found successfully!');
      } else {
        setMovieData(null);
        toast.error(data.Error || 'Movie not found.');
      }
    } catch {
      toast.error('Error fetching movie details');
    }
  };

  // add movie
  const handleAddMovie = async () => {
    if (!movieData) return;
    setAdding(true);
    try {
      let payload: any = {
        title: movieData.Title,
        year: movieData.Year,
        plot: movieData.Plot,
        poster: movieData.Poster,
      };

      let res;
      if (manualMode && posterFile) {
        const formData = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          formData.append(k, v as string);
        });
        formData.append('poster', posterFile);
        res = await fetch(`${BASE_URL}/api/movies`, { method: 'POST', body: formData });
      } else {
        res = await fetch(`${BASE_URL}/api/movies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const result = await res.json().catch(() => null);
      if (res.ok) {
        toast.success('Movie added successfully!', { delay: 500 });
        setTimeout(() => router.push('/running-movies'), 2000);
      } else {
        toast.error(result?.error || 'Failed to add movie.');
      }
    } catch {
      toast.error('Server error while adding movie.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <HomeWrapper>
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400"></div>
        </div>
      </HomeWrapper>
    );
  }

  return (
    <div
      className="w-full min-h-[calc(100vh-77px)] flex justify-center items-start 
      bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url('/images/home.jpg')" }}
    >
      <div className="max-w-2xl w-full bg-black/80 p-6 rounded-3xl shadow-2xl mt-1">
        <h2 className="text-2xl font-bold mb-4 text-white text-center">Add New Movie</h2>

        {/* Toggle */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => {
              setManualMode(false);
              setMovieData(null);
              setPosterFile(null);
              setSuggestions([]);
              setShowSuggestions(false);
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              !manualMode
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Search Online
          </button>
          <button
            onClick={() => {
              setManualMode(true);
              setMovieData({ Title: '', Year: '', Plot: '', Poster: '' });
              setSuggestions([]);
              setShowSuggestions(false);
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              manualMode
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Add Manually
          </button>
        </div>

        {/* Search */}
        {!manualMode && (
          <div className="relative mb-6 flex flex-col">
            <div className="flex">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (query.length > 0 && suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                placeholder="Enter movie name"
                className="flex-grow p-2 border rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleSearch}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl ml-2 transition duration-300"
              >
                Search
              </button>
            </div>

            {showSuggestions && (
              <ul className="absolute z-50 top-full left-0 w-full bg-gray-800 border border-gray-600 rounded-b-xl mt-1 max-h-64 overflow-y-auto shadow-lg">
                {isSearching ? (
                  <li className="px-3 py-2 text-gray-400 italic">Searching...</li>
                ) : suggestions.length > 0 ? (
                  suggestions.map((movie, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleSelectSuggestion(movie.Title)}
                      className="px-3 py-2 hover:bg-indigo-600 cursor-pointer text-white"
                    >
                      {movie.Title} ({movie.Year})
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-gray-400 italic">No movies found</li>
                )}
              </ul>
            )}
          </div>
        )}

        {/* Movie Form */}
        {movieData && (
          <div className="flex flex-wrap gap-4 text-white">
            <div className="flex-1 min-w-[250px] space-y-3">
              <div>
                <label className="block font-semibold mb-1">Title</label>
                <input
                  type="text"
                  value={movieData.Title}
                  onChange={(e) => setMovieData({ ...movieData, Title: e.target.value })}
                  readOnly={!manualMode}
                  className="w-full p-2 border rounded bg-gray-700"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Year</label>
                <input
                  type="text"
                  value={movieData.Year}
                  onChange={(e) => setMovieData({ ...movieData, Year: e.target.value })}
                  readOnly={!manualMode}
                  className="w-full p-2 border rounded bg-gray-700"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Plot</label>
                <textarea
                  value={movieData.Plot}
                  onChange={(e) => setMovieData({ ...movieData, Plot: e.target.value })}
                  readOnly={!manualMode}
                  className="w-full p-2 border rounded h-24 bg-gray-700"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Poster</label>
                {manualMode ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPosterFile(file);
                        setMovieData({
                          ...movieData,
                          Poster: URL.createObjectURL(file),
                        });
                      }
                    }}
                    className="w-full p-2 border rounded bg-gray-700"
                  />
                ) : (
                  <input
                    type="text"
                    value={movieData.Poster}
                    readOnly
                    className="w-full p-2 border rounded bg-gray-700 text-gray-400"
                  />
                )}
              </div>

              <button
                onClick={handleAddMovie}
                disabled={adding}
                className={`w-full py-2 rounded-xl font-semibold transition duration-300 ${
                  adding
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {adding ? 'Adding...' : 'Add Movie'}
              </button>
            </div>

            {movieData.Poster && (
              <div className="flex-1 min-w-[200px] flex justify-center items-start">
                <img
                  src={movieData.Poster}
                  alt="No poster available"
                  className="rounded-xl shadow-lg w-64 h-100 mt-6 object-cover border border-gray-600 alt"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

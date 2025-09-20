'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import EditMovieModal from './EditMovieModal';
import Link from "next/link"; 
import { FiEdit, FiTrash2 } from "react-icons/fi"; 

interface Movie {
  _id: string;
  title: string;
  year: string;
  plot: string;
  poster: string;
}

export default function MoviesList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingMovieId, setDeletingMovieId] = useState<string | null>(null); 
  const BASE_URL = "https://abdullah-test.whitescastle.com";

  const fetchMovies = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/movies`);
      const data = await res.json();
      setMovies(data);
    } catch (error) {
      toast.error('Error fetching movies');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleDelete = async (movie: Movie) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete "${movie.title}"?`,
      icon: 'warning',
      background: '#1f2937',
      color: '#f9fafb',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#4b5563',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-2xl p-6',
        title: 'font-bold text-white text-lg',
        actions: 'space-x-4',
        confirmButton: 'px-4 py-2 rounded-lg',
        cancelButton: 'px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600',
      },
    });

    if (result.isConfirmed) {
      setDeletingMovieId(movie._id); 
      try {
        const res = await fetch(`${BASE_URL}/api/movies/${movie._id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (res.ok) {
          toast.success('Movie deleted successfully');
          fetchMovies();
        } else {
          toast.error('Failed to delete movie.');
        }
      } catch (err) {
        toast.error('Something went wrong.');
      } finally {
        setDeletingMovieId(null); 
      }
    }
  };

  const openEditModal = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedMovie(null);
    setIsModalOpen(false);
  };

  return (
    <div className="w-full min-h-[calc(100vh-79px)] relative">
      <EditMovieModal
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={closeEditModal}
        onSave={fetchMovies}
      />

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat bg-center"
        style={{ backgroundImage: "url('/images/login.jpg')" }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-10">
        
        {/* Heading + Always Visible Add Movie Button */}
        <div className="flex  items-center mb-10 justify-between">
          <h1 className="text-4xl font-bold text-gray-200 text-center drop-shadow-lg mb-5 ">
            🎬 Now Showing
          </h1>
          <Link
            href="/movies/add"
            className="px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg  transition-all duration-300 font-bold flex items-center gap-2"
          >
            ➕ Add Movie
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-lg text-white">Loading movies...</p>
        ) : movies.length === 0 ? (
          <p className="text-center text-lg text-white">No movies found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-9">
            {movies.map((movie) => (
              <motion.div
                key={movie._id}
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transform transition-all duration-300 flex flex-col"
              >
                {/* Poster */}
                <div className="relative h-80">
                  {movie.poster ? (
                    <img
                      src={
                        movie.poster.startsWith('http')
                          ? movie.poster 
                          : `${BASE_URL}${movie.poster}` 
                      }
                      alt={movie.title || 'Poster Not Available'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white">
                      Poster Not Available
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h2 className="text-xl font-bold text-white truncate">{movie.title}</h2>
                    <p className="text-sm text-gray-300 mt-1">Released: {movie.year}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <p className="text-gray-200 text-sm line-clamp-3">{movie.plot}</p>

                  {/* Action Buttons */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => openEditModal(movie)}
                      className="p-2 rounded-full shadow-md text-white hover:bg-gray-700 transition cursor-pointer"
                      title="Edit Movie"
                    >
                      <FiEdit size={20} color='white' />
                    </button>
                    <button
                      onClick={() => handleDelete(movie)}
                      disabled={deletingMovieId === movie._id} 
                      className={`p-2 rounded-full shadow-md hover:bg-gray-700 transition flex items-center justify-center cursor-pointer ${
                        deletingMovieId === movie._id
                          ? 'bg-gray-500 cursor-not-allowed text-white'
                          : ' text-white'
                      }`}
                      title="Delete Movie"
                    >
                      {deletingMovieId === movie._id ? (
                        <span className="text-sm font-bold">...</span>
                      ) : (
                        <FiTrash2 size={20} color='red'/>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

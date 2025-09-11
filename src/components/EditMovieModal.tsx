'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

interface Movie {
  _id: string;
  title: string;
  year: string;
  plot: string;
  poster: string;
}

interface EditMovieModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function EditMovieModal({ movie, isOpen, onClose, onSave }: EditMovieModalProps) {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [plot, setPlot] = useState('');
  const [poster, setPoster] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (movie) {
      setTitle(movie.title);
      setYear(movie.year);
      setPlot(movie.plot);
      setPoster(movie.poster);
    }
  }, [movie]);

  const handleSave = async () => {
    if (!movie) return;
    setLoading(true);
    try {
      const res = await fetch(`https://abdullah-test.whitescastle.com/api/movies/${movie._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, year, plot, poster }),
      });
      if (res.ok) {
        toast.success('Movie updated successfully');
        onSave(); // Refresh list in parent
        onClose();
      } else {
        toast.error('Failed to update movie');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating movie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-900 rounded-3xl w-full max-w-lg p-6 relative"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">Edit Movie</h2>

            <div className="flex flex-col gap-4">
                <a className='text-gray-300 font-bold'>Title</a>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <a  className='text-gray-300 font-bold'>Year</a>
              <input
                type="text"
                placeholder="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <a  className='text-gray-300 font-bold'>Plot</a>
              <textarea
                placeholder="Plot"
                value={plot}
                onChange={(e) => setPlot(e.target.value)}
                className="p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={4}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 rounded-xl text-white hover:bg-gray-700 transition  cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 transition  cursor-pointer"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaEye, FaTrash } from 'react-icons/fa';

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
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPath, setPosterPath] = useState(''); // current poster path
  const [loading, setLoading] = useState(false);
  const [showPosterPopup, setShowPosterPopup] = useState(false);

  useEffect(() => {
    if (movie) {
      setTitle(movie.title);
      setYear(movie.year);
      setPlot(movie.plot);
      setPosterPath(movie.poster || '');
      setPosterFile(null);
    }
  }, [movie]);

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPosterFile(file);
    setPosterPath(URL.createObjectURL(file)); // preview for popup
  };

  const handleDeletePoster = () => {
    setPosterFile(null);
    setPosterPath('');
  };

  const handleSave = async () => {
    if (!movie) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('year', year);
      formData.append('plot', plot);

      if (posterFile) {
        formData.append('poster', posterFile);
      } else if (!posterPath) {
        formData.append('poster', ''); // indicate deletion
      }

      const res = await fetch(
        `https://abdullah-test.whitescastle.com/api/movies/${movie._id}`,
        { method: 'PUT', body: formData, credentials: 'include' }
      );

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error('Non-JSON response:', text);
        toast.error('Server error: invalid response');
        return;
      }

      if (res.ok) {
        toast.success('Movie updated successfully');
        onSave();
        onClose();
      } else {
        toast.error(data.message || 'Failed to update movie');
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
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
              {/* Title */}
              <label className="text-gray-300 font-bold">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {/* Year */}
              <label className="text-gray-300 font-bold">Year</label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {/* Plot */}
              <label className="text-gray-300 font-bold">Plot</label>
              <textarea
                value={plot}
                onChange={(e) => setPlot(e.target.value)}
                className="p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={4}
              />

              {/* Poster Input */}
              <label className="text-gray-300 font-bold flex items-center gap-2">Poster</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={posterFile ? posterFile.name : posterPath || ''}
                  placeholder="No poster selected"
                  className="flex-1 p-2 bg-gray-800 text-gray-200 rounded-lg border border-gray-700 cursor-not-allowed"
                />
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePosterChange}
                  />
                  <span className="px-2 py-1 bg-gray-700 rounded-lg text-white hover:bg-gray-600">Browse</span>
                </label>
                {posterPath && (
                  <>
                    <FaEye
                      className="cursor-pointer text-indigo-500"
                      onClick={() => setShowPosterPopup(true)}
                      title="View Poster"
                    />
                    <FaTrash
                      className="cursor-pointer text-red-500"
                      onClick={handleDeletePoster}
                      title="Delete Poster"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 rounded-xl text-white hover:bg-gray-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 transition cursor-pointer"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.div>

          {/* Poster Popup */}
          <AnimatePresence>
            {showPosterPopup && posterPath && (
              <motion.div
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPosterPopup(false)}
              >
                <motion.img
                  src={posterPath}
                  alt="Poster Preview"
                  className="max-h-[80%] max-w-[80%] rounded-lg shadow-lg"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  onClick={(e) => e.stopPropagation()}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

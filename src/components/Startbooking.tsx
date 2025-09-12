"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import Link from "next/link";

interface Movie {
  _id: string;
  title: string;
}

interface Room {
  _id: string;
  name: string;
  seatingCapacity: number;
}

interface Showtime {
  _id: string;
  movie: Movie;
  room: Room;
  date: string;
  times: string[];
}

const BASE_URL = "https://abdullah-test.whitescastle.com/api";

export default function StartBooking() {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const [editShow, setEditShow] = useState<Showtime | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTimes, setNewTimes] = useState<string[]>([""]);
  const [selectedMovieId, setSelectedMovieId] = useState("");

  const [updating, setUpdating] = useState(false); // ✅ for edit save
  const [deletingId, setDeletingId] = useState<string | null>(null); // ✅ for delete

  const formatTime = (time: string) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${m} ${ampm}`;
  };

  const fetchShowtimes = async () => {
    try {
      const [resShowtimes, resMovies] = await Promise.all([
        fetch(`${BASE_URL}/showtimes`),
        fetch(`${BASE_URL}/movies`),
      ]);

      if (!resShowtimes.ok || !resMovies.ok) throw new Error("Failed to fetch");

      const showtimeData = await resShowtimes.json();
      const movieData = await resMovies.json();

      setMovies(movieData);

      const showtimesWithMovies = showtimeData.map((st: any) => ({
        ...st,
        movie:
          movieData.find((m: Movie) => m._id === st.movie?._id) || {
            title: "Unknown",
            _id: "",
          },
      }));

      setShowtimes(showtimesWithMovies);
    } catch {
      toast.error("❌ Failed to load showtimes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowtimes();
  }, []);

  // ✅ Delete showtime
  const handleDelete = async (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the showtime!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      background: "black",
      color: "white",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setDeletingId(id); // ✅ show deleting
          const res = await fetch(`${BASE_URL}/showtimes/${id}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("Failed");
          toast.success("Showtime deleted successfully");
          fetchShowtimes();
        } catch {
          toast.error("❌ Error deleting showtime");
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const handleEdit = (st: Showtime) => {
    setEditShow(st);
    setNewDate(st.date ? st.date.split("T")[0] : "");
    setNewTimes(st.times);
    setSelectedMovieId(st.movie?._id || "");
  };

  // ✅ Save updated showtime
  const handleUpdate = async () => {
    if (!editShow) return;
    try {
      setUpdating(true); // ✅ show saving
      const res = await fetch(`${BASE_URL}/showtimes/${editShow._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movie: selectedMovieId,
          date: newDate,
          times: newTimes,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("✅ Showtime updated");
      setEditShow(null);
      fetchShowtimes();
    } catch {
      toast.error("❌ Error updating showtime");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-79px)] relative overflow-y-auto">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/booking.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-20 p-6 max-w-6xl mx-auto text-white">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold">🎬 Available Shows</h1>
          <Link
            href="/add-shows"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all font-bold flex items-center gap-2 cursor-pointer"
          >
            ➕Add Shows
          </Link>
        </div>

        {loading ? (
          <p className="text-center">⏳ Loading...</p>
        ) : showtimes.length === 0 ? (
          <p className="text-center">No showtimes available</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {showtimes.map((st) => (
              <div
                key={st._id}
                className="relative bg-gray-900 rounded-xl p-5 shadow-lg border border-gray-700 flex flex-col z-10"
              >
                {/* Edit/Delete */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(st)}
                    title="Edit Showtime"
                    className="text-blue-400 hover:text-blue-500 cursor-pointer"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(st._id)}
                    disabled={deletingId === st._id}
                    title="Delete Showtime"
                    className={`cursor-pointer ${
                      deletingId === st._id
                        ? "text-gray-500"
                        : "text-red-400 hover:text-red-500"
                    }`}
                  >
                    {deletingId === st._id ? "⏳" : <FaTrash />}
                  </button>
                </div>

                {/* Movie */}
                <h2 className="text-xl font-bold text-center mb-3">
                  🎬 {st.movie?.title || "Unknown Movie"}
                </h2>

                <p className="text-sm text-gray-400 text-center">
                  📅 {st.date ? st.date.split("T")[0] : "N/A"}
                </p>
                <p className="text-sm text-gray-400 text-center mb-3">
                  🏠 {st.room?.name} ({st.room?.seatingCapacity} seats)
                </p>

                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {st.times.map((t, i) => (
                    <span
                      key={i}
                      className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm"
                    >
                      ⏰ {formatTime(t)}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() =>
                    toast.success(`🎟 Booking started for ${st.movie?.title}`)
                  }
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-semibold w-full mt-auto cursor-pointer"
                >
                  Start Booking
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editShow && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg w-[400px]">
            <h2 className="text-xl font-semibold mb-4">Edit Showtime</h2>

            <label className="block mb-2">Movie</label>
            <select
              value={selectedMovieId}
              onChange={(e) => setSelectedMovieId(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white mb-4"
            >
              <option value="">-- Select a Movie --</option>
              {movies.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title}
                </option>
              ))}
            </select>

            <label className="block mb-2">Date</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white mb-4"
            />

            <label className="block mb-2">Times</label>
            {newTimes.map((t, i) => (
              <input
                key={i}
                type="time"
                value={t}
                onChange={(e) =>
                  setNewTimes((prev) =>
                    prev.map((x, idx) => (idx === i ? e.target.value : x))
                  )
                }
                className="w-full p-2 rounded bg-gray-800 text-white mb-2"
              />
            ))}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditShow(null)}
                className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={updating}
                className={`px-4 py-2 rounded cursor-pointer ${
                  updating
                    ? "bg-blue-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {updating ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

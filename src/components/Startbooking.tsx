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
  time: string[]; // ✅ always array
  vipTicketPrice?: number;
  normalTicketPrice?: number;
}

const BASE_URL = "https://abdullah-test.whitescastle.com/api";

export default function StartBooking() {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const [editShow, setEditShow] = useState<Showtime | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTimes, setNewTimes] = useState<string[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState("");

  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ✅ format time
  const formatTime = (time: string) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${m} ${ampm}`;
  };

  // ✅ Fetch showtimes + movies
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

      // normalize showtimes
      const showtimesWithMovies: Showtime[] = showtimeData.map((st: any) => ({
        ...st,
        movie:
          movieData.find((m: Movie) => m._id === st.movie?._id) || {
            title: "Unknown",
            _id: "",
          },
        time: Array.isArray(st.time) ? st.time : st.time ? [st.time] : [], // ✅ always array
        vipTicketPrice: st.ticketPrices?.VIP ?? 500,
        normalTicketPrice: st.ticketPrices?.Normal ?? 300,
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
    try {
      setDeletingId(id);
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
  };

  // ✅ Edit modal open
  const handleEdit = (st: Showtime) => {
    setEditShow(st);
    setNewDate(st.date ? st.date.split("T")[0] : "");
    setNewTimes(st.time || []);
    setSelectedMovieId(st.movie?._id || "");
  };

  // ✅ Save updated showtime
  const handleUpdate = async () => {
    if (!editShow) return;
    try {
      setUpdating(true);
      const res = await fetch(`${BASE_URL}/showtimes/${editShow._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movie: selectedMovieId,
          date: newDate,
          times: newTimes, // ✅ array
          vipTicketPrice: editShow.vipTicketPrice,
          normalTicketPrice: editShow.normalTicketPrice,
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
    <div className="min-w-full h-[calc(100vh-79px)] relative overflow-y-auto">
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
            href="/start-booking/shows-add"
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
                className="relative bg-gray-900 rounded-xl p-5 shadow-lg border border-gray-700 flex flex-col justify-between h-full z-10"
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
                    onClick={async () => {
                      const result = await Swal.fire({
                        title: "Are you sure?",
                        text: "Deleting this showtime will remove all current bookings associated with it!",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: "Yes, delete it!",
                        cancelButtonText: "Cancel",
                        background: "black",
                        color: "white",
                        buttonsStyling: false,
                        customClass: {
                          confirmButton:
                            "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mr-3",
                          cancelButton:
                            "bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-3",
                        },
                      });

                      if (result.isConfirmed) {
                        handleDelete(st._id);
                      }
                    }}
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
                  {st.time.map((t, i) => (
                    <span
                      key={i}
                      className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm"
                    >
                      ⏰ {formatTime(t)}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col gap-1 text-center text-sm text-gray-300 mb-3">
                  <span>💎 VIP: Rs {st.vipTicketPrice || "N/A"}</span>
                  <span>🎟️ Normal: Rs {st.normalTicketPrice || "N/A"}</span>
                </div>

                <Link
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-semibold w-full mt-auto cursor-pointer"
                  href={`/Screens/${st._id}`}
                >
                  Start Booking
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
    

{/* -------------------- Edit Modal -------------------- */}
{editShow && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg w-[400px]">
      <h2 className="text-xl font-semibold mb-4">Edit Showtime</h2>

      {/* Movie */}
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

      {/* Date */}
      <label className="block mb-2">Date</label>
      <input
        type="date"
        value={newDate}
        onChange={(e) => setNewDate(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 text-white mb-4"
      />

      {/* VIP Ticket Price */}
      <label className="block mb-2">VIP Ticket Price</label>
      <input
        type="number"
        value={editShow.vipTicketPrice || 0}
        onChange={(e) =>
          setEditShow((prev) =>
            prev ? { ...prev, vipTicketPrice: Number(e.target.value) } : prev
          )
        }
        className="w-full p-2 rounded bg-gray-800 text-white mb-4"
      />

      {/* Normal Ticket Price */}
      <label className="block mb-2">Normal Ticket Price</label>
      <input
        type="number"
        value={editShow.normalTicketPrice || 0}
        onChange={(e) =>
          setEditShow((prev) =>
            prev ? { ...prev, normalTicketPrice: Number(e.target.value) } : prev
          )
        }
        className="w-full p-2 rounded bg-gray-800 text-white mb-4"
      />

      {/* Showtime Times */}
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
      <button
        onClick={() => setNewTimes((prev) => [...prev, ""])}
        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded mb-4"
      >
        + Add Time
      </button>

   
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={() => setEditShow(null)}
          className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer"
          disabled={updating}
        >
          Cancel
        </button>
        <button
          onClick={async () => {
            if (!editShow) return;
            try {
              setUpdating(true);

              const res = await fetch(`${BASE_URL}/showtimes/${editShow._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  movie: selectedMovieId,
                  date: newDate,
                  times: newTimes.filter((t) => t), 
                  ticketPrices: {
                    VIP: editShow.vipTicketPrice || 500,
                    Normal: editShow.normalTicketPrice || 300,
                  },
                }),
              });

              if (!res.ok) throw new Error("Failed to update showtime");

              toast.success("✅ Showtime updated successfully");
              setEditShow(null);
              fetchShowtimes();
            } catch {
              toast.error("❌ Error updating showtime");
            } finally {
              setUpdating(false);
            }
          }}
          disabled={updating}
          className={`px-4 py-2 rounded cursor-pointer ${
            updating ? "bg-blue-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
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

"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";
import Link from "next/link";

// Custom hook to debounce the search input value
// Custom hook to debounce a value (ensures API call happens only after typing stops)
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      // Only update after the delay passes with no new keystrokes
      setDebouncedValue(value);
    }, delay);

    // If user types again before delay, cancel previous timer
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}


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
  time: string[]; // Always array of times for that day (will contain max 1 element here)
  vipTicketPrice?: number;
  normalTicketPrice?: number;
}

interface ShowtimesResponse {
  page: number;
  limit: number;
  totalPages: number;
  totalShowtimes: number;
  showtimes: Showtime[];
  filter: FilterType;
  search: string;
}

const BASE_URL = "https://abdullah-test.whitescastle.com/api";
const ITEMS_PER_PAGE = 6;

type FilterType = "Today" | "Next Week" | "Next Day" | "This Month" | "All";


export default function StartBooking() {
  // --- State Initialization ---
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const [totalPages, setTotalPages] = useState(1);
  const [totalShowtimes, setTotalShowtimes] = useState(0);

  // Pagination & Search States
  const [filter, setFilter] = useState<FilterType>("Today");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Edit/Delete States
  const [editShow, setEditShow] = useState<Showtime | null>(null);
  const [newDate, setNewDate] = useState("");
  // newTimes will now hold only one time string
  const [newTimes, setNewTimes] = useState<string[]>([]); 
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // --- Utility Functions ---

  // Time formatter (e.g., "14:30" -> "2:30 PM")
  const formatTime = (time: string) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${m} ${ampm}`;
  };

  // --- Data Fetching ---

  // Fetch showtimes + movies + rooms with server-side pagination/filtering
  const fetchShowtimes = async () => {
    setLoading(true);

    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: ITEMS_PER_PAGE.toString(),
      filter: filter,
      search: debouncedSearchTerm,
    });

    try {
      const [resShowtimes, resMovies, resRooms] = await Promise.all([
        fetch(`${BASE_URL}/showtimes?${params.toString()}`),
        fetch(`${BASE_URL}/movies`),
        fetch(`${BASE_URL}/rooms`),
      ]);

      if (!resShowtimes.ok || !resMovies.ok || !resRooms.ok)
        throw new Error("Failed to fetch all data");

      const showtimeResponse: ShowtimesResponse = await resShowtimes.json();
      const movieData = await resMovies.json();
      const roomData = await resRooms.json();

      // Set fetched data
      setMovies(movieData.movies || movieData);
      setRooms(roomData.rooms || roomData);

      // Normalize showtime data (time array, prices)
      setShowtimes(
        showtimeResponse.showtimes.map((st: any) => ({
          ...st,
          // Ensure time is an array of strings
          time: Array.isArray(st.time) ? st.time : st.time ? [st.time] : [],
          // Safely set prices with defaults
          vipTicketPrice: st.ticketPrices?.VIP ?? 500,
          normalTicketPrice: st.ticketPrices?.Normal ?? 300,
        }))
      );

      setTotalPages(showtimeResponse.totalPages);
      setTotalShowtimes(showtimeResponse.totalShowtimes);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to load showtimes or supporting data from server");
    } finally {
      setLoading(false);
    }
  };

  // --- Effects ---
  useEffect(() => {
    fetchShowtimes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filter, debouncedSearchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, debouncedSearchTerm]);

  // --- Handlers ---

  const handleEdit = (st: Showtime) => {
    setEditShow(st);
    // Format date string for the input[type="date"]
    setNewDate(st.date ? st.date.split("T")[0] : "");
    // Initialize newTimes with the first time slot, or an empty string if none exist
    setNewTimes(Array.isArray(st.time) && st.time.length > 0 ? [st.time[0]] : [""]); 
    setSelectedMovieId(st.movie?._id || "");
    setSelectedRoomId(st.room?._id || "");
  };

  /**
   * Correctly updates the single time slot value in the newTimes array state.
   */
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    // Always set the state as a single-element array containing the new time.
    setNewTimes([timeValue]); 
  };

  // Inside StartBooking.tsx

const handleSaveEdit = async () => {
    if (!editShow) return;

    // 1. Validation and Data Extraction
    const singleTime = newTimes[0]?.trim();
    const filteredTimes = singleTime ? [singleTime] : [];

    if (!selectedMovieId || !selectedRoomId || !newDate || filteredTimes.length === 0) {
      toast.error("Movie, Room, Date, and Time are required ❌");
      return;
    }
    
    try {
      setUpdating(true);

      // 2. Construct the Payload
      const payload = {
        movie: selectedMovieId,
        room: selectedRoomId,
        // Send the newDate string (YYYY-MM-DD) directly. The backend router will handle converting it to a Date object at midnight (00:00:00).
        date: newDate, 
        // This array must contain exactly one time string (e.g., ["14:30"]).
        times: filteredTimes, 
        ticketPrices: {
          // Ensure prices are converted to number
          VIP: Number(editShow.vipTicketPrice) || 500,
          Normal: Number(editShow.normalTicketPrice) || 300,
        },
      };

      // 3. API Call
      const res = await fetch(
        `${BASE_URL}/showtimes/${editShow._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        // Log the error response body to console for detailed debugging
        const errorData = await res.json();
        console.error("Backend Error Details:", errorData); 
        throw new Error(errorData.message || "Failed to update showtime");
      }

      toast.success("✅ Showtime updated successfully");
      setEditShow(null);
      fetchShowtimes(); 
    } catch (err: any) {
      console.error("Update Catch Error:", err);
      toast.error(err.message || "❌ Error updating showtime");
    } finally {
      setUpdating(false);
    }
};

// ... (rest of the component)

  /**
   * Handles the deletion of a showtime after confirmation.
   * @param _id The ID of the showtime to delete.
   */
  async function handleDelete(_id: string) {
    setDeletingId(_id);
    try {
      const res = await fetch(`${BASE_URL}/showtimes/${_id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete showtime");
      }

      toast.success("✅ Showtime deleted successfully");
      // Refetch showtimes to update the list
      fetchShowtimes();
    } catch (err: any) {
      toast.error(err.message || "❌ Error deleting showtime");
    } finally {
      setDeletingId(null);
    }
  }

  const filters: { label: string; value: FilterType; title: string }[] = [
    { label: "All Shows", value: "All", title: "All Shows" },
    { label: "Today", value: "Today", title: "Today" },
    { label: "Next Day", value: "Next Day", title: "Next Day" },
    { label: "Next Week", value: "Next Week", title: "Next Week" },
    { label: "Next Month", value: "This Month", title: "Next Month" },
  ];

  // --- Component JSX ---
  return (
    <div className="min-w-full min-h-[calc(100vh-79px)] relative">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/booking.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative z-20 p-6 max-w-6xl mx-auto text-white">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <h1 className="text-4xl font-extrabold text-white tracking-wider">
            🎬 Available Shows
          </h1>
          <Link
            href="/start-booking/shows-add"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-2xl transition-all font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            ➕ Add New Show
          </Link>
        </div>

        {/* -------------------- Search Bar and Filters -------------------- */}
        <div className="mb-8 p-4 bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-xl border border-gray-700">
          {/* Search Bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search by Movie Title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* Filters Section */}
          <div className="flex flex-wrap gap-3 justify-center md:justify-start ">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors shadow-md cursor-pointer ${
                  filter === f.value
                    ? "bg-blue-600 text-white ring-2 ring-blue-400"
                    : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {/* -------------------- End Search Bar and Filters -------------------- */}
        
        {/* -------------------- Showtime Grid -------------------- */}
        {loading ? (
          <p className="text-center text-xl py-10">⏳ Loading showtimes...</p>
        ) : showtimes.length === 0 ? (
          <p className="text-center text-xl py-10 text-gray-400">
           No showtimes available for {filter.toLowerCase()} matching: {searchTerm}.
          </p>
        ) : (
          <>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {showtimes.map((st) => (
                <div
                  key={st._id}
                  className="relative bg-gray-900/90 rounded-xl p-6 shadow-2xl border border-gray-700 flex flex-col justify-between h-full transform transition-transform hover:scale-[1.02] duration-300"
                >
                  {/* Edit/Delete Buttons */}
                  <div className="absolute top-1 right-1 flex gap-3 z-10 mb-4">
                    <button
                      onClick={() => handleEdit(st)}
                      title="Edit Showtime"
                      className="text-blue-400 hover:text-blue-500 transition-colors p-1 cursor-pointer"
                    >
                      <FaEdit className="w-5 h-5" />
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
                              "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mr-3 shadow-md",
                            cancelButton:
                              "bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-3 shadow-md",
                          },
                        });

                        if (result.isConfirmed) {
                          handleDelete(st._id);
                        }
                      }}
                      disabled={deletingId === st._id}
                      title="Delete Showtime"
                      className={`p-1 transition-colors cursor-pointer ${
                        deletingId === st._id
                          ? "text-gray-500 cursor-not-allowed"
                          : "text-red-400 hover:text-red-500"
                      }`}
                    >
                      {deletingId === st._id ? (
                        "⏳"
                      ) : (
                        <FaTrash className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Movie Info */}
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-center mb-1 mt-2">
                      🎬 {st.movie?.title || "Unknown Movie"}
                    </h2>
                    <p className="text-sm text-gray-400 text-center mb-1">
                      📅 Date: {st.date ? st.date.split("T")[0] : "N/A"}
                    </p>
                    <p className="text-sm text-gray-400 text-center">
                      🏠 Screen: {st.room?.name} ({st.room?.seatingCapacity}{" "}
                      seats)
                    </p>
                  </div>

                  {/* Times */}
                  <div className="flex flex-wrap justify-center gap-2 mb-4 p-3 bg-gray-800 rounded-lg">
                    {(Array.isArray(st.time) ? st.time : []).map((t, i) => (
                      <span
                        key={i}
                        className="bg-blue-600/80 text-white px-3 py-1 rounded-full text-sm font-medium shadow-inner"
                      >
                        ⏰ {formatTime(t)}
                      </span>
                    ))}
                  </div>

                  {/* Prices */}
                  <div className="flex justify-between gap-4 text-sm font-semibold text-gray-300 mb-4 p-2 bg-gray-800 rounded-lg">
                    <span>
                      💎 VIP: Rs {st.vipTicketPrice || "N/A"}
                    </span>
                    <span>
                      🎟️ Normal: Rs {st.normalTicketPrice || "N/A"}
                    </span>
                  </div>

                  {/* Booking Link */}
                  <Link
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-xl text-white font-bold w-full mt-auto cursor-pointer text-center transition-colors shadow-lg"
                    href={`/Screens/${st._id}`}
                  >
                    Start Booking
                  </Link>
                </div>
              ))}
            </div>

            {/* -------------------- Pagination Controls -------------------- */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12 mb-4 sticky bottom-0 border-t border-gray-700 pt-4 bg-gradient-to-t from-black/90 to-transparent ">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-950 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-lg font-semibold">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
            {/* -------------------- End Pagination Controls -------------------- */}
          </>
        )}
        {/* -------------------- End Showtime Grid -------------------- */}
      </div>

      {/* -------------------- Edit Modal -------------------- */}
      {editShow && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-xl shadow-2xl w-full **max-w-xl** border border-gray-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold mb-6 text-white text-center">✏️ Edit Showtime</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit();
              }}
              className="bg-gray-800/90 p-6 rounded-xl shadow-md space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Movie */}
                <div>
                  <p className="mb-2 font-medium text-gray-300">🎬 Select Movie</p>
                  <select
                    value={selectedMovieId}
                    onChange={(e) => setSelectedMovieId(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">-- Select a Movie --</option>
                    {movies.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Room */}
                <div>
                  <p className="mb-2 font-medium text-gray-300">🏢 Select Screen/Room</p>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">-- Select a Room --</option>
                    {rooms.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name} ({r.seatingCapacity} seats)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <p className="mb-2 font-medium text-gray-300">📅 Start Date</p>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Showtime Time (Single Input) */}
                <div>
                  <p className="mb-2 font-medium text-gray-300">⏰ Show Time</p>
                  <input
                    type="time"
                    // newTimes[0] holds the single time slot string
                    value={newTimes[0] || ""}
                    // Use the single-item handler
                    onChange={handleTimeChange} 
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Ticket Prices */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-2 font-medium text-gray-300">💎 VIP Price (Rs)</p>
                  <input
                    type="number"
                    value={editShow.vipTicketPrice || 0}
                    onChange={(e) =>
                      setEditShow((prev) =>
                        prev ? { ...prev, vipTicketPrice: Number(e.target.value) } : prev
                      )
                    }
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    min={0}
                    required
                  />
                </div>
                <div>
                  <p className="mb-2 font-medium text-gray-300">🎟️ Normal Price (Rs)</p>
                  <input
                    type="number"
                    value={editShow.normalTicketPrice || 0}
                    onChange={(e) =>
                      setEditShow((prev) =>
                        prev ? { ...prev, normalTicketPrice: Number(e.target.value) } : prev
                      )
                    }
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    min={0}
                    required
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setEditShow(null)}
                  className="px-5 py-3 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors font-semibold"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-3 rounded-xl font-bold transition-colors ${
                    updating ? "bg-blue-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  disabled={updating}
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
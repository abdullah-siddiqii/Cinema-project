"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface Movie {
  _id: string;
  title: string;
}

interface Room {
  _id: string;
  name: string;
  seatingCapacity: number;
}

const BASE_URL = "https://abdullah-test.whitescastle.com/api";

export default function AddShowtime() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [movie, setMovie] = useState("");
  const [room, setRoom] = useState("");
  const [startDate, setStartDate] = useState("");
  const [repeatUntil, setRepeatUntil] = useState("");
  const [time, setTime] = useState("");
  const [vipPrice, setVipPrice] = useState("");
  const [normalPrice, setNormalPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const formatTime = (time: string) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${m} ${ampm}`;
  };

  // Fetch movies & rooms
  useEffect(() => {
    Promise.all([
      fetch(`${BASE_URL}/movies`).then((res) => res.json()),
      fetch(`${BASE_URL}/rooms`).then((res) => res.json()),
    ])
      .then(([moviesData, roomsData]) => {
        if (Array.isArray(moviesData)) setMovies(moviesData);
        else if (Array.isArray(moviesData.movies)) setMovies(moviesData.movies);

        if (Array.isArray(roomsData)) setRooms(roomsData);
        else if (Array.isArray(roomsData.rooms)) setRooms(roomsData.rooms);
      })
      .catch(() => toast.error("⚠️ Failed to load movies or rooms"));
  }, []);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!movie || !room || !startDate || !time || !vipPrice || !normalPrice) {
      toast.error("All fields are required ❌");
      return;
    }

    if (repeatUntil && new Date(repeatUntil) < new Date(startDate)) {
      toast.error("End date cannot be before start date ❌");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        movie,
        room,
        startDate,
        repeatUntil: repeatUntil || startDate, // if no repeatUntil, just one day
        time,
        ticketPrices: {
          VIP: Number(vipPrice),
          Normal: Number(normalPrice),
        },
      };

      console.log("🎬 Sending showtime payload:", payload);

      const res = await fetch(`${BASE_URL}/showtimes/`, { // assume backend endpoint for bulk
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Error response:", errorData);
        toast.error(errorData.message || "Failed to create showtime ❌");
        throw new Error(errorData.message || "Failed to create showtime ❌");
      }

      const data = await res.json();
      toast.success(`✅ ${data.showtimes.length} showtime(s) created successfully!`);
      console.log("✅ Created showtimes:", data.showtimes);

      // Clear form
      setMovie("");
      setRoom("");
      setStartDate("");
      setRepeatUntil("");
      setTime("");
      setVipPrice("");
      setNormalPrice("");

      // Redirect to list
      setTimeout(() => router.push("/start-booking"), 1500);
    } catch (err: any) {
      toast.error(err.message || "Error saving showtime ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-79px)] relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/Showtime.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative z-10 p-6 text-white max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold mb-4">➕ Add Show</h1>
          <Link
            href="/start-booking"
            className="mb-6 inline-block text-white font-bold bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
          >
            &larr; Back to List
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-800/90 p-6 rounded-xl shadow-md space-y-4"
        >
          {/* Movie */}
          <div>
            <p className="mb-2 font-medium">🎬 Select Movie</p>
            <select
              value={movie}
              onChange={(e) => setMovie(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
            >
              <option value="">Select Movie</option>
              {movies.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          {/* Room */}
          <div>
            <p className="mb-2 font-medium">🏢 Select Screen</p>
            <select
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
            >
              <option value="">Select Room</option>
              {rooms.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} ({r.seatingCapacity} seats)
                </option>
              ))}
            </select>
          </div>

          {/* Dates & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="mb-2 font-medium">📅 Start Date</p>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <p className="mb-2 font-medium">📆 Repeat Until (optional)</p>
              <input
                type="date"
                value={repeatUntil}
                onChange={(e) => setRepeatUntil(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <p className="mb-2 font-medium">⏰ Show Time</p>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="flex-1 p-2 rounded bg-gray-700 text-white"
                  required
                />
                {time && (
                  <span className="bg-gray-700 px-3 py-1 rounded-full text-sm">
                    {formatTime(time)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Ticket Prices */}
          <div>
            <p className="mb-2 font-medium">🎟️ Ticket Prices</p>
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="VIP Price"
                value={vipPrice}
                onChange={(e) => setVipPrice(e.target.value)}
                className="flex-1 p-2 rounded bg-gray-700 text-white"
                required
                min={0}
              />
              <input
                type="number"
                placeholder="Normal Price"
                value={normalPrice}
                onChange={(e) => setNormalPrice(e.target.value)}
                className="flex-1 p-2 rounded bg-gray-700 text-white"
                required
                min={0}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white cursor-pointer w-full transition ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 font-bold"
            }`}
          >
            {loading ? "⏳ Adding..." : "Add Showtime"}
          </button>
        </form>
      </div>
    </div>
  );
}

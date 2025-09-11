"use client";

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
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [movie, setMovie] = useState("");
  const [room, setRoom] = useState("");
  const [date, setDate] = useState("");
  const [times, setTimes] = useState<string[]>([""]);

  // ✅ Format time to 12-hour AM/PM
  const formatTime = (time: string) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${m} ${ampm}`;
  };

  // ✅ Fetch Movies & Rooms
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
      .catch(() => toast.error("Failed to load movies or rooms"));
  }, []);

  // ✅ Handle time inputs
  const handleTimeChange = (index: number, value: string) => {
    const updated = [...times];
    updated[index] = value;
    setTimes(updated);
  };
  const addTimeField = () => setTimes([...times, ""]);
  const removeTimeField = (index: number) =>
    setTimes(times.filter((_, i) => i !== index));

  // ✅ Add Showtime
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!movie || !room || !date || times.some((t) => !t)) {
      toast.error("All fields are required");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/showtimes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movie, room, date, times }), // ✅ send array
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to save showtime");
      }

      toast.success("Showtime(s) added ✅");
      setMovie("");
      setRoom("");
      setDate("");
      setTimes([""]);
    } catch (err: any) {
      toast.error(err.message || "Error saving showtime");
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-79px)] relative">
      {/* 🔹 Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/Showtime.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/70" />

      {/* 🔹 Main Content */}
      <div className="relative z-10 p-6 text-white max-w-3xl mx-auto">
        
        <h1 className="text-3xl font-bold mb-4">🎬 Add Showtime</h1>

        {/* Add Showtime Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800/90 p-4 rounded-lg shadow-md space-y-4"
        >
          {/* Movie */}
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

          {/* Room */}
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

          {/* Date */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />

          {/* Times */}
          <div>
            <p className="mb-2">Show Times</p>
            {times.map((t, index) => {
              const formatted = formatTime(t);
              return (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="time"
                    value={t}
                    onChange={(e) => handleTimeChange(index, e.target.value)}
                    className="flex-1 p-2 rounded bg-gray-700 text-white"
                    required
                  />
                  {t && (
                    <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm">
                      ⏰ {formatted}
                    </span>
                  )}
                  {times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTimeField(index)}
                      className="px-3 py-1 bg-red-600 rounded"
                    >
                      -
                    </button>
                  )}
                  {index === times.length - 1 && (
                    <button
                      type="button"
                      onClick={addTimeField}
                      className="px-3 py-1 bg-green-600 rounded"
                    >
                      +
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
          >
            Add Showtime
          </button>
        </form>
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { error } from 'console';

const BASE_URL = 'https://abdullah-test.whitescastle.com';

export default function RoomForm({ onRoomAdded }: { onRoomAdded?: () => void }) {
  const [name, setName] = useState('');
  const [rows, setRows] = useState<number | string>('');
  const [columns, setColumns] = useState<number | string>('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !rows || !columns || !location) {
      toast.error('All fields are required ❌');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          rows: Number(rows),
          columns: Number(columns),
          location,
        }),
      });

 if (!res.ok) {
  const errorData = await res.json().catch(() => ({}));
  console.error("❌ Backend error:", errorData);
  throw new Error(errorData.message || errorData.error || "Failed to create room");
}


      toast.success('✅ Room added successfully', { autoClose: 2000 });

      // Reset form
      setName('');
      setRows('');
      setColumns('');
      setLocation('');

      if (onRoomAdded) onRoomAdded();

      setTimeout(() => {
        router.push('/Screens');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full min-h-[calc(100vh-77px)] flex items-center justify-center bg-cover bg-center relative px-3"
      style={{ backgroundImage: "url('/images/AddRoom.jpg')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70"></div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-gray-900/80 p-10 rounded-2xl shadow-2xl space-y-5 max-w-lg w-full border border-white/10 backdrop-blur-md"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold mb-4">➕ Add Screen</h1>
          <Link
            href="/Screens"
            className="mb-6 inline-block font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition"
          >
            &larr; Back to List
          </Link>
        </div>

        {/* Room Name */}
        <div>
          <label className="block text-gray-300 mb-2 font-medium">Screen Name</label>
          <input
            type="text"
            placeholder="Enter screen name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800/80 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>

        {/* Rows & Columns */}
        <div>
          <label className="block text-gray-300 mb-2 font-medium">Rows & Columns</label>
          <div className="flex gap-3">
            <input
              type="number"
              min="1"
              placeholder="Rows"
              value={rows}
              onChange={(e) => setRows(e.target.value)}
              className="w-1/2 p-3 rounded-lg bg-gray-800/80 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
            />
            <input
              type="number"
              min="1"
              placeholder="Columns"
              value={columns}
              onChange={(e) => setColumns(e.target.value)}
              className="w-1/2 p-3 rounded-lg bg-gray-800/80 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-gray-300 mb-2 font-medium">Location</label>
          <input
            type="text"
            placeholder="Enter location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800/80 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-bold tracking-wide transition transform shadow-lg cursor-pointer ${
            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]'
          }`}
        >
          {loading ? '⏳ Adding...' : '➕ Add Screen'}
        </button>
      </form>
    </div>
  );
}

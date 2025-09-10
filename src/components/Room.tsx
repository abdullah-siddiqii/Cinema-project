'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { FiEdit, FiTrash2 } from "react-icons/fi";

interface Room {
  _id?: string;
  name: string;
  seatingCapacity: number;
  rows: number;
  columns: number;
  location: string;
}

interface RoomsManagerProps {
  user: {
    role: string; // 'admin' or 'user'
  };
}

export default function RoomsManager({ user }: RoomsManagerProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form, setForm] = useState<Room>({
       name: '',
    seatingCapacity: "Capacity" as unknown as number,
    rows: "Rows" as unknown as number,
    columns: "Columns" as unknown as number,
    location: '',
  });

  const BASE_URL = 'https://abdullah-test.whitescastle.com';
  const isAdmin = user?.role === 'admin';

  // Fetch rooms
  const fetchRooms = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/rooms`);
      if (!res.ok) throw new Error('Failed to fetch rooms');
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      console.error('Error fetching rooms', err);
      toast.error('Failed to fetch rooms');
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Create or update room
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.seatingCapacity || !form.rows || !form.columns || !form.location) {
      toast.error('All fields are required');
      return;
    }

    try {
      if (editingRoom) {
        const res = await fetch(`${BASE_URL}/api/rooms/${editingRoom._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Failed to update room');
        toast.success('Room updated successfully!');
        setEditingRoom(null);
      } else {
        const res = await fetch(`${BASE_URL}/api/rooms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Failed to create room');
        toast.success('Room created successfully!');
      }

      setForm({ name: '', seatingCapacity: 0, rows: 0, columns: 0, location: '' });
      fetchRooms();
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    }
  };

  const deleteRoom = async (id: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This room will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      background: '#1f2937',
      color: '#f9fafb',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${BASE_URL}/api/rooms/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete room');
          setRooms((prev) => prev.filter((r) => r._id !== id));
          toast.success('Room deleted successfully');
        } catch (err) {
          console.error(err);
          toast.error('Something went wrong');
        }
      }
    });
  };

  const startEditing = (room: Room) => {
    setEditingRoom(room);
    setForm({ ...room });
  };

  const cancelEditing = () => {
    setEditingRoom(null);
    setForm({ name: '', seatingCapacity: 0, rows: 0, columns: 0, location: '' });
  };

  return (
    <div className="relative flex flex-col md:flex-row w-full min-h-[calc(100vh-77px)]">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat bg-center"
        style={{ backgroundImage: "url('/images/RoomList.jpg')" }}
      ></div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Content */}
      <div className="relative flex flex-col md:flex-row w-full z-10">
        {/* Left Column: Rooms List */}
        <div className="md:w-1/2 p-6 overflow-y-auto max-h-[calc(100vh-77px)] scrollbar-y">
          <h2 className="text-3xl font-bold mb-6 text-white">🎬 Rooms List</h2>
          {rooms.length === 0 ? (
            <p className="text-gray-300">No rooms created yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {rooms.map((room) => (
                <div
                  key={room._id}
                  className="p-4 bg-gray-800/60 rounded-lg flex justify-between items-center 
                             shadow-md shadow-gray-900/40 hover:shadow-lg hover:shadow-indigo-500/20 
                             transition-all duration-300"
                >
                  <div>
                    <h3 className="text-white font-semibold">{room.name}</h3>
                    <p className="text-gray-300 text-sm">
                      Capacity: {room.seatingCapacity} | Rows: {room.rows} | Columns: {room.columns}
                    </p>
                    <p className="text-gray-300 text-sm">Location: {room.location}</p>
                  </div>
                  {isAdmin && (
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => startEditing(room)}
                        className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                      >
                        <FiEdit size={18} className="text-indigo-400" />
                      </button>
                      <button
                        onClick={() => deleteRoom(room._id!)}
                        className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                      >
                        <FiTrash2 size={18} className="text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Room Form (Admin Only) */}
        {isAdmin && (
          <div className="md:w-1/2 p-6 bg-gray-900/80 rounded-3xl 
                          shadow-lg shadow-gray-900/50 hover:shadow-2xl hover:shadow-indigo-600/30 
                          transition-all duration-300 m-4">
            <h2 className="text-3xl font-bold mb-6 text-white text-center">
              {editingRoom ? 'Edit Room' : 'Create Room'}
            </h2>
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <span className="font-bold text-gray-300">Name</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Room Name eg: Hall"
                className="p-3 rounded bg-gray-700 text-white focus:outline-none"
              />
              <span className="font-bold text-gray-300">Capacity</span>
              <input
                type="number"
                value={form.seatingCapacity}
                onChange={(e) => setForm({ ...form, seatingCapacity: Number(e.target.value) })}
                placeholder="Seating Capacity eg: 100"
                className="p-3 rounded bg-gray-700 text-white focus:outline-none"
              />
              <span className="font-bold text-gray-300">Rows & Columns</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={form.rows}
                  onChange={(e) => setForm({ ...form, rows: Number(e.target.value) })}
                  placeholder="Rows eg: 50"
                  className="p-3 rounded bg-gray-700 text-white focus:outline-none w-1/2"
                />
                <input
                  type="number"
                  value={form.columns}
                  onChange={(e) => setForm({ ...form, columns: Number(e.target.value) })}
                  placeholder="Columns eg: 50"
                  className="p-3 rounded bg-gray-700 text-white focus:outline-none w-1/2"
                />
              </div>
              <span className="font-bold text-gray-300">Location</span>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Location eg: First Floor"
                className="p-3 rounded bg-gray-700 text-white focus:outline-none"
              />

              <div className="flex gap-2">
                {editingRoom && (
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="flex-1 py-3 mt-4 bg-red-500 rounded text-white font-semibold 
                               hover:shadow-lg hover:shadow-red-500/40 transition-all duration-300"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className={`flex-1 py-3 mt-4 rounded text-white font-semibold 
                    ${editingRoom 
                      ? 'bg-blue-600 hover:shadow-lg hover:shadow-blue-500/40' 
                      : 'bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/40'} 
                    transition-all duration-300`}
                >
                  {editingRoom ? 'Update Room' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

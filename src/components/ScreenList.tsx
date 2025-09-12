'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { FaPlus } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Room {
  _id: string;
  name: string;
  seatingCapacity: number;
  rows: number;
  columns: number;
  location: string;
}

export default function ScreenList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [updating, setUpdating] = useState(false);
  const BASE_URL = 'https://abdullah-test.whitescastle.com';
  const router = useRouter();

  // ✅ Fetch Rooms
  const fetchRooms = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/rooms`);
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      console.error('Error fetching rooms', err);
      toast.error('Failed to load rooms');
    }
  };

  // ✅ Delete Room
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
      if (!result.isConfirmed) return;

      try {
        const res = await fetch(`${BASE_URL}/api/rooms/${id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setRooms((prev) => prev.filter((room) => room._id !== id));
          toast.success('Room deleted successfully');
        } else {
          toast.error('Failed to delete room');
        }
      } catch (err) {
        console.error('Error deleting room', err);
        toast.error('Something went wrong');
      }
    });
  };

  // ✅ Update Room
  const handleUpdate = async () => {
    if (!editingRoom) return;

    setUpdating(true);
    try {
      const res = await fetch(`${BASE_URL}/api/rooms/${editingRoom._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRoom),
      });

      if (res.ok) {
        toast.success('Room updated successfully');
        fetchRooms();
        setEditingRoom(null);
      } else {
        toast.error('Failed to update room');
      }
    } catch (err) {
      console.error('Error updating room', err);
      toast.error('Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div
      className="w-full min-h-[calc(100vh-77px)] 
        bg-cover bg-center bg-no-repeat overflow-hidden 
        flex flex-col items-center px-4 py-8 relative"
      style={{ backgroundImage: "url('/images/RoomList.jpg')" }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 w-full max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-white drop-shadow-md">
            🎬 Screens List
          </h2>
          <Link
            href="/Screens/add-screens"
            className="flex items-center gap-2 px-5 py-2 rounded-lg 
              bg-blue-600 hover:bg-blue-700 
              text-white  shadow-md transition font-bold"
          >
            <FaPlus /> Add Screens
          </Link>
        </div>

        {/* Rooms */}
        {rooms.length === 0 ? (
          <p className="text-gray-300 text-center italic">No rooms created yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room._id}
                className="p-6 rounded-2xl bg-white/10 backdrop-blur-md 
                  border border-white/20 shadow-lg
                  hover:scale-[1.03] hover:shadow-2xl transition 
                  flex justify-between items-start gap-4"
              >
                {/* Room Info */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{room.name}</h3>
                  <p className="text-sm text-gray-200">
                    Capacity: <span className="font-semibold">{room.seatingCapacity}</span>
                  </p>
                  <p className="text-sm text-gray-200">
                    Rows: <span className="font-semibold">{room.rows}</span> | Columns:{' '}
                    <span className="font-semibold">{room.columns}</span>
                  </p>
                  <p className="text-sm text-gray-200 mt-1">
                    Location: <span className="font-semibold">{room.location}</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setEditingRoom(room)}
                    className="p-2 rounded-full hover:bg-white/20 transition"
                    title="Edit Room"
                  >
                    <FiEdit size={20} className="text-blue-400" />
                  </button>
                  <button
                    onClick={() => deleteRoom(room._id)}
                    className="p-2 rounded-full hover:bg-white/20 transition"
                    title="Delete Room"
                  >
                    <FiTrash2 size={20} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Edit Modal */}
      {editingRoom && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-white">Edit Room</h3>

            {/* Inputs */}
            <input
              type="text"
              value={editingRoom.name}
              onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
              className="w-full mb-3 p-2 rounded bg-gray-800 text-white border border-gray-700"
              placeholder="Room Name"
            />
            <input
              type="number"
              value={editingRoom.seatingCapacity}
              onChange={(e) =>
                setEditingRoom({ ...editingRoom, seatingCapacity: Number(e.target.value) })
              }
              className="w-full mb-3 p-2 rounded bg-gray-800 text-white border border-gray-700"
              placeholder="Seating Capacity"
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={editingRoom.rows}
                onChange={(e) => setEditingRoom({ ...editingRoom, rows: Number(e.target.value) })}
                className="w-1/2 mb-3 p-2 rounded bg-gray-800 text-white border border-gray-700"
                placeholder="Rows"
              />
              <input
                type="number"
                value={editingRoom.columns}
                onChange={(e) => setEditingRoom({ ...editingRoom, columns: Number(e.target.value) })}
                className="w-1/2 mb-3 p-2 rounded bg-gray-800 text-white border border-gray-700"
                placeholder="Columns"
              />
            </div>
            <input
              type="text"
              value={editingRoom.location}
              onChange={(e) => setEditingRoom({ ...editingRoom, location: e.target.value })}
              className="w-full mb-3 p-2 rounded bg-gray-800 text-white border border-gray-700"
              placeholder="Location"
            />

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditingRoom(null)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-white font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={updating}
                className={`px-4 py-2 rounded text-white font-semibold transition 
                  ${updating ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {updating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

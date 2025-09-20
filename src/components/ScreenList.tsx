'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { FiTrash2, FiEdit } from 'react-icons/fi';
import { FaPlus, FaChair } from 'react-icons/fa';
import Link from 'next/link';

interface Seat {
  seatNumber: string;
  row: number;
  column: number;
  type: string;
}

interface Room {
  _id: string;
  name: string;
  rows: number;
  columns: number;
  location: string;
  seats: Seat[];
}

export default function ScreenList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [seatModalRoom, setSeatModalRoom] = useState<Room | null>(null);
  const [seatTempState, setSeatTempState] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [editModalRoom, setEditModalRoom] = useState<Room | null>(null);
  const [editRoomData, setEditRoomData] = useState({ name: '', rows: 0, columns: 0, location: '' });
  const BASE_URL = 'https://abdullah-test.whitescastle.com';

  /* -------------------- Fetch Rooms -------------------- */
  const fetchRooms = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/rooms`);
      const data: Room[] = await res.json();
      setRooms(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load rooms');
    }
  };

  /* -------------------- Delete Room -------------------- */
  const deleteRoom = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This room will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      background: '#1f2937',
      color: '#f9fafb',
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${BASE_URL}/api/rooms/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRooms(prev => prev.filter(r => r._id !== id));
        toast.success('Room deleted successfully');
      } else toast.error('Failed to delete room');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    }
  };

  /* -------------------- Open Seat Modal -------------------- */
  const openSeatModal = (room: Room) => {
    setSeatModalRoom(room);
    setSelectedSeats([]);
    setSeatTempState([...room.seats]);
  };

  /* -------------------- Open Edit Modal -------------------- */
  const openEditModal = (room: Room) => {
    setEditModalRoom(room);
    setEditRoomData({ name: room.name, rows: room.rows, columns: room.columns, location: room.location });
  };

  /* -------------------- Handle Edit Input -------------------- */
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditRoomData(prev => ({
      ...prev,
      [name]: name === 'name' || name === 'location' ? value : Number(value),
    }));
  };

  /* -------------------- Save Room Changes -------------------- */
  const saveRoomChanges = async () => {
    if (!editModalRoom) return;
    const { name, rows, columns, location } = editRoomData;
    const { _id: roomId } = editModalRoom;

    try {
      const res = await fetch(`${BASE_URL}/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rows, columns, location }),
      });
      if (!res.ok) throw new Error('Failed to update room');

      const updatedRoom: Room = await res.json();
      setRooms(prev => prev.map(r => (r._id === updatedRoom._id ? updatedRoom : r)));
      toast.success('Room updated successfully ✅');
      setEditModalRoom(null);
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    }
  };

  /* -------------------- Seat Click -------------------- */
  const handleSeatClick = (seat: Seat) => {
    const isSelected = selectedSeats.some(s => s.seatNumber === seat.seatNumber);
    if (isSelected) {
      setSelectedSeats(prev => prev.filter(s => s.seatNumber !== seat.seatNumber));
    } else {
      setSelectedSeats(prev => [...prev, seat]);
    }
  };

  /* -------------------- Apply Type to Selected Seats -------------------- */
 const applyTypeToSelectedSeats = async () => {
  if (selectedSeats.length === 0) return;

  const result = await Swal.fire({
    title: `Assign type to ${selectedSeats.length} seats`,
    html: `
      <select id="seatType" class="bg-gray-800 text-white p-2 rounded-md w-full border border-gray-100">
        <option value="Normal">Normal</option>
        <option value="VIP">VIP</option>
        <option value="Disabled">Disabled</option>
      </select>
    `,
    showCancelButton: true,
    confirmButtonText: 'Apply',
    cancelButtonText: 'Cancel',
    background: '#1f2937',
    color: '#f9fafb',
    buttonsStyling: false,
    customClass: {
      confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2',
      cancelButton: 'bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-3'
    },
    preConfirm: () => {
      const select = document.getElementById('seatType') as HTMLSelectElement | null;
      return select?.value;
    },
  });

  if (result.isConfirmed && result.value) {
    const newType = result.value;
    setSeatTempState(prev =>
      prev.map(seat =>
        selectedSeats.some(s => s.seatNumber === seat.seatNumber) ? { ...seat, type: newType } : seat
      )
    );
    setSelectedSeats([]);
  }
};


  /* -------------------- Remove Selected Seats -------------------- */
  const removeSelectedSeats = () => {
    setSeatTempState(prev =>
      prev.map(seat =>
        selectedSeats.some(s => s.seatNumber === seat.seatNumber) ? { ...seat, type: '' } : seat
      )
    );
    setSelectedSeats([]);
    toast.success('Selected seats removed');
  };

  /* -------------------- Confirm Seat Changes -------------------- */
  const confirmSeats = async () => {
    if (!seatModalRoom) return;
    try {
      const res = await fetch(`${BASE_URL}/api/rooms/${seatModalRoom._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seats: seatTempState }),
      });
      if (!res.ok) throw new Error('Failed to save seats');

      const updatedRoom: Room = await res.json();
      setRooms(prev => prev.map(r => (r._id === updatedRoom._id ? updatedRoom : r)));
      toast.success('Seat structure saved successfully ✅');
      setSeatModalRoom(null);
      setSelectedSeats([]);
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    }
  };

  /* -------------------- Seat Styling -------------------- */
  const getSeatClasses = (seat: Seat) => {
    const isSelected = selectedSeats.some(s => s.seatNumber === seat.seatNumber);
    if (isSelected) return 'bg-cyan-500 hover:bg-cyan-600 border-2 border-white shadow-lg';

    if (seat.type === 'VIP') return 'bg-amber-400 hover:bg-amber-500 shadow-amber-300/50 text-black';
    if (seat.type === 'Disabled') return 'bg-slate-500 hover:bg-slate-600 shadow-slate-400/50';
    if (seat.type === 'Normal') return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/50';
    if (seat.type === '') return 'bg-gray-800 hover:bg-gray-700 cursor-pointer';
    return 'bg-gray-800 hover:bg-gray-700 cursor-pointer';
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="w-full min-h-[calc(100vh-77px)] bg-cover bg-center flex flex-col items-center px-4 py-8 relative"
      style={{ backgroundImage: "url('/images/RoomList.jpg')" }}>
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative z-10 w-full max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-white drop-shadow-md">🎬 Screens List</h2>
          <Link href="/Screens/add"
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition font-bold">
            <FaPlus /> Add Screens
          </Link>
        </div>

        {/* Rooms Grid */}
        {rooms.length === 0 ? (
          <p className="text-gray-300 text-center italic">No rooms created yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map(room => (
              <div key={room._id} className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:scale-[1.03] hover:shadow-2xl transition flex flex-col justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{room.name}</h3>
                  <p className="text-sm text-gray-200">
                    Rows: <span className="font-semibold">{room.rows}</span> | Columns: <span className="font-semibold">{room.columns}</span>
                  </p>
                  <p className="text-sm text-gray-200 mt-1">
                    Location: <span className="font-semibold">{room.location}</span>
                  </p>
                  <p className="text-sm text-gray-300 mt-2">
                    Total Seats: <span className="font-semibold">{room.seats.length}</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      Swal.fire({
                        title: 'Edit Room?',
                        text: '⚠️ If you edit this room, all existing bookings will be canceled!',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, edit it!',
                        cancelButtonText: 'No, cancel',
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        background: 'black', // optional dark background
                        color: 'white',
                      }).then((result) => {
                        if (result.isConfirmed) {
                          openEditModal(room);
                        }
                      });
                    }}
                    className="p-2 rounded-full hover:bg-white/20 transition"
                    title="Edit Room"
                  >
                    <FiEdit size={20} className="text-blue-400" />
                  </button>

                  <button
                    onClick={() => {
                      Swal.fire({
                        title: 'Manage Seats?',
                        text: '⚠️ Changing seats may affect existing bookings!',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Proceed',
                        cancelButtonText: 'Cancel',
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        background: 'black',
                        color: 'white',
                      }).then((result) => {
                        if (result.isConfirmed) {
                          openSeatModal(room);
                        }
                      });
                    }}
                    className="p-2 rounded-full hover:bg-white/20 transition"
                    title="Manage Seats"
                  >
                    <FaChair size={20} className="text-yellow-400" />
                  </button>
                  <button
                    onClick={() => {
                      Swal.fire({
                        title: 'Delete Room?',
                        text: '⚠️ This action cannot be undone!',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, delete it!',
                        cancelButtonText: 'No, cancel',
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        background: 'black', // optional dark background
                        color: 'white',
                      }).then((result) => {
                        if (result.isConfirmed) {
                          deleteRoom(room._id);
                        }
                      });
                    }}
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

      {/* Seat Modal */}
      {seatModalRoom && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 overflow-auto p-4">
          <div className="bg-gray-900 rounded-3xl p-6 w-full max-w-3xl shadow-2xl border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-white">Manage Seats - {seatModalRoom.name}</h3>

            {/* Seat Legend */}
            <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm text-gray-300">
              <div className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-emerald-600"></span> Normal</div>
              <div className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-amber-400"></span> VIP</div>
              <div className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-slate-500"></span> Disabled</div>
              <div className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-gray-800"></span> Not Typed</div>
              <div className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-cyan-500"></span> Selected</div>
            </div>

            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${seatModalRoom.columns}, minmax(50px,1fr))` }}>
              {seatTempState.map(seat => (
                <button
                  key={seat.seatNumber}
                  onClick={() => handleSeatClick(seat)}
                  className={`p-2 rounded-md font-bold text-white transition-all duration-300 shadow-md relative group ${getSeatClasses(seat)}`}
                >
                  <span className="z-10 relative">{seat.seatNumber}</span>
                  {!seat.type && <FaPlus className="absolute inset-0 m-auto text-xl opacity-100 group-hover:opacity-100" />}
                </button>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <div className="flex gap-2">
                {selectedSeats.length > 0 && (
                  <>
                    <button onClick={applyTypeToSelectedSeats} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition flex items-center gap-2">
                      <FaChair /> Apply Type
                    </button>
                    <button onClick={removeSelectedSeats} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition flex items-center gap-2">
                      <FiTrash2 /> Remove
                    </button>
                  </>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setSeatModalRoom(null); setSelectedSeats([]); }} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded-lg text-white font-semibold transition">
                  Cancel
                </button>
                <button onClick={confirmSeats} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition">
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalRoom && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4">
          <div className="bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-white">Edit Room - {editModalRoom.name}</h3>
            <div className="flex flex-col gap-4">
              <input type="text" name="name" value={editRoomData.name} onChange={handleEditChange} placeholder="Room Name" className="p-2 rounded-md bg-gray-800 text-white border border-gray-600" />
              <input type="number" name="rows" value={editRoomData.rows} onChange={handleEditChange} placeholder="Rows" className="p-2 rounded-md bg-gray-800 text-white border border-gray-600" />
              <input type="number" name="columns" value={editRoomData.columns} onChange={handleEditChange} placeholder="Columns" className="p-2 rounded-md bg-gray-800 text-white border border-gray-600" />
              <input type="text" name="location" value={editRoomData.location} onChange={handleEditChange} placeholder="Location" className="p-2 rounded-md bg-gray-800 text-white border border-gray-600" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditModalRoom(null)} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded-lg text-white font-semibold transition">Cancel</button>
              <button onClick={saveRoomChanges} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

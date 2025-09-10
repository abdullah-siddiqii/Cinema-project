// 'use client';
// import React, { useEffect, useState } from 'react';
// import { toast } from 'react-toastify';
// import Swal from 'sweetalert2';
// import { FiEdit, FiTrash2 } from "react-icons/fi"; // ✅ import icons
// interface Room {
//   _id: string;
//   name: string;
//   seatingCapacity: number;
//   rows: number;
//   columns: number;
//   location: string;
// }

// export default function RoomList() {
//   const [rooms, setRooms] = useState<Room[]>([]);
//   const [editingRoom, setEditingRoom] = useState<Room | null>(null);
//   const BASE_URL = 'https://abdullah-test.whitescastle.com';

//   // ✅ Fetch Rooms
//   const fetchRooms = async () => {
//     try {
//       const res = await fetch(`${BASE_URL}/api/rooms`);
//       const data = await res.json();
//       setRooms(data);
//     } catch (err) {
//       console.error('Error fetching rooms', err);
//     }
//   };

//   // ✅ Delete Room
//   const deleteRoom = async (id: string) => {
//     Swal.fire({
//       title: 'Are you sure?',
//       text: 'This room will be permanently deleted!',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#d33',
//       cancelButtonColor: '#3085d6',
//       confirmButtonText: 'Yes, delete it!',
//       background: '#1f2937',
//       color: '#f9fafb',
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           const res = await fetch(`${BASE_URL}/api/rooms/${id}`, {
//             method: 'DELETE',
//           });

//           if (res.ok) {
//             setRooms((prev) => prev.filter((room) => room._id !== id));
//             toast.success('Room deleted successfully');
//           } else {
//             toast.error('Failed to delete room');
//           }
//         } catch (err) {
//           console.error('Error deleting room', err);
//           toast.error('Something went wrong');
//         }
//       }
//     });
//   };

//   // ✅ Edit Room Modal open
//   const editRoom = (room: Room) => {
//     setEditingRoom(room);
//   };

//   // ✅ Update Room
//   const handleUpdate = async () => {
//     if (!editingRoom) return;

//     try {
//       const res = await fetch(`${BASE_URL}/api/rooms/${editingRoom._id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(editingRoom),
//       });

//       if (res.ok) {
//         toast.success('Room updated successfully.');
//         fetchRooms();
//         setEditingRoom(null);
//       } else {
//         toast.error('Failed to update room');
//       }
//     } catch (err) {
//       console.error('Error updating room', err);
//       toast.error('Something went wrong');
//     }
//   };

//   useEffect(() => {
//     fetchRooms();
//   }, []);

//   return (
//     <div
//       className="w-full min-h-[calc(100vh-77px)] 
//         bg-cover bg-center bg-no-repeat overflow-hidden flex flex-col items-center px-4 py-6"
//       style={{ backgroundImage: "url('/images/RoomList.jpg')" }}
//     >
//       {/* Overlay */}
//       <div className="absolute inset-0 bg-black/40"></div>

//       <div className="relative z-10 w-full max-w-6xl">
//         {/* Heading */}
//         <h2 className="text-3xl font-bold mb-8 text-white text-center drop-shadow-lg">
//           🎬 Rooms List
//         </h2>

//         {/* Room list */}
//         {rooms.length === 0 ? (
//           <p className="text-gray-300 text-center">No rooms created yet.</p>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {rooms.map((room) => (
//               <div
//                 key={room._id}
//                 className="p-6 rounded-2xl 
//                   bg-white/10 backdrop-blur-md 
//                   shadow-lg border border-white/20
//                   hover:scale-[1.03] hover:shadow-2xl transition duration-300 
//                   flex  justify-between"
//               >
//                 {/* Room Info */}
//                 <div>
//                   <h3 className="text-xl font-semibold text-white mb-2">{room.name}</h3>
//                   <p className="text-sm text-gray-200">
//                     Capacity: <span className="font-bold">{room.seatingCapacity}</span>
//                   </p>
//                   <p className="text-sm text-gray-200">
//                     Rows: <span className="font-bold">{room.rows}</span> | Columns: <span className="font-bold">{room.columns}</span>
//                   </p>
//                   <p className="text-sm text-gray-200 mt-1">
//                     Location: <span className="font-bold">{room.location}</span>
//                   </p>
//                 </div>

//                 {/* Buttons */}
//                <div className="flex  justify-between flex-col gap-1">
//   <button
//     onClick={() => deleteRoom(room._id)}
//     className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full  shadow-md flex items-center justify-center transition cursor-pointer"
//     title="Delete Room"
//   >
//     <FiTrash2 size={20} color="black"/>
//   </button>
//   <button
//     onClick={() => editRoom(room)}
//     className="p-2 bg-yellow-500 hover:bg-yellow-400 rounded-full shadow-md text-gray-900 transition cursor-pointer"
//     title="Edit Room"
//   >
//     <FiEdit size={20} color="black"/>
//   </button>
// </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* ✅ Modal for Editing */}
//       {editingRoom && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
//           <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl">
//             <h3 className="text-xl font-bold mb-4 text-white">Edit Room</h3>

//             <input
//               type="text"
//               value={editingRoom.name}
//               onChange={(e) =>
//                 setEditingRoom({ ...editingRoom, name: e.target.value })
//               }
//               className="w-full mb-3 p-2 rounded bg-gray-800 text-white border border-gray-700"
//               placeholder="Room Name"
//             />
//             <input
//               type="number"
//               value={editingRoom.seatingCapacity}
//               onChange={(e) =>
//                 setEditingRoom({
//                   ...editingRoom,
//                   seatingCapacity: Number(e.target.value),
//                 })
//               }
//               className="w-full mb-3 p-2 rounded bg-gray-800 text-white border border-gray-700"
//               placeholder="Seating Capacity"
//             />
//             <div className="flex gap-2">
//               <input
//                 type="number"
//                 value={editingRoom.rows}
//                 onChange={(e) =>
//                   setEditingRoom({
//                     ...editingRoom,
//                     rows: Number(e.target.value),
//                   })
//                 }
//                 className="w-1/2 mb-3 p-2 rounded bg-gray-800 text-white border border-gray-700"
//                 placeholder="Rows"
//               />
//               <input
//                 type="number"
//                 value={editingRoom.columns}
//                 onChange={(e) =>
//                   setEditingRoom({
//                     ...editingRoom,
//                     columns: Number(e.target.value),
//                   })
//                 }
//                 className="w-1/2 mb-3 p-2 rounded bg-gray-800 text-white border border-gray-700"
//                 placeholder="Columns"
//               />
//             </div>
//             <input
//               type="text"
//               value={editingRoom.location}
//               onChange={(e) =>
//                 setEditingRoom({ ...editingRoom, location: e.target.value })
//               }
//               className="w-full mb-3 p-2 rounded bg-gray-800 text-white border border-gray-700"
//               placeholder="Location"
//             />

//             <div className="flex justify-end gap-2 mt-4">
//               <button
//                 onClick={() => setEditingRoom(null)}
//                 className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-white font-bold"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleUpdate}
//                 className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold"
//               >
//                 Update
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

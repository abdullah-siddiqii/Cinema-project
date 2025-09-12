"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HomeWrapper from "./HomeWrapper";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", role: "user" });
  const [saving, setSaving] = useState(false); // ✅ new state
  const router = useRouter();

  const API_URL = "https://abdullah-test.whitescastle.com/api/auth";

  // ✅ Fetch all users
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Unauthorized ❌");
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      })
      .then((data) => setUsers(data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ✅ Delete user with SweetAlert2
  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Unauthorized ❌");

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won’t be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      background: "black",
      color: "white",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to delete user");

        setUsers(users.filter((u) => u._id !== id));
        toast.success("User has been deleted.");
      } catch (err: any) {
        toast.error(err.message);
      }
    }
  };

  // ✅ Open edit modal
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role });
  };

  // ✅ Save updated user
  const handleSave = async () => {
    if (!editingUser) return;
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Unauthorized ❌");

    setSaving(true); // start saving

    try {
      const res = await fetch(`${API_URL}/${editingUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update user");

      toast.success("User updated ✅");

      // Refresh users
      const refreshed = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await refreshed.json();
      setUsers(data);

      setEditingUser(null); // close modal
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false); // stop saving
    }
  };

 if(loading){
    return(
      <HomeWrapper>
        {/* You can add a loading spinner or message here */}
        <div className="flex items-center justify-center h[calc(100vh-77px)] bg-black">
          <span className="text-white text-xl">Loading...</span>
        </div>
      </HomeWrapper>
    );
  }

  return (
    <div
      className="min-h-screen p-6 bg-cover bg-center relative"
      style={{ backgroundImage: "url('/images/user.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/70"></div>

      <div className="relative z-10 overflow-y-auto scrollbar-y">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">👥Users List</h1>
          <Link
            href="/users/add-user"
            className="flex items-center gap-2 cursor-pointer  bg-blue-600 hover:bg-blue-700  text-white px-5 py-2 rounded-lg shadow-md transition"
          >
            <FaPlus /> Add User
          </Link>
        </div>

        {/* Table */}
        {users.length === 0 ? (
          <p className="text-gray-300">No users found</p>
        ) : (
          <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-700">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-gray-900 to-gray-800 text-white text-sm uppercase tracking-wide">
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Role</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, index) => (
                  <tr
                    key={u._id}
                    className={`text-gray-200 text-sm ${
                      index % 2 === 0 ? "bg-gray-800/50" : "bg-gray-700/50"
                    } hover:bg-gray-600/60 transition`}
                  >
                    <td className="p-4 font-medium">{u.name}</td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4 capitalize">{u.role}</td>
                    <td className="p-4 flex justify-center gap-4">
                      <button
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-600 transition cursor-pointer"
                        onClick={() => handleEdit(u)}
                        title="Edit User"
                      >
                        <FaEdit size={20} />
                      </button>
                      <button
                        className="flex items-center gap-1 text-red-400 hover:text-red-600 transition cursor-pointer"
                        onClick={() => handleDelete(u._id)}
                        title="Delete User"
                      >
                        <FaTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Modal */}
        {editingUser && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-gray-900 rounded-2xl p-8 w-96 shadow-lg border border-gray-700">
              <h2 className="text-xl font-bold mb-4 text-white">Edit User</h2>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Name"
                className="w-full p-2 mb-3 border rounded bg-gray-800 text-white"
              />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email"
                className="w-full p-2 mb-3 border rounded bg-gray-800 text-white"
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full p-2 mb-3 border rounded bg-gray-800 text-white"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>

              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 cursor-pointer"
                  onClick={() => setEditingUser(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 rounded text-white font-bold cursor-pointer ${
                    saving ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
                  }`}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

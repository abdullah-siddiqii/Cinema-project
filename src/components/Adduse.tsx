'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthGuard from "@/components/AuthGuard";
import HomeWrapper from "@/components/HomeWrapper";
import Link from "next/link";

export default function AddUserPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);


  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);

  // Load logged-in user
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);

      // if not admin → redirect to home
      if (parsed.role !== "admin") {
        router.push("/");
      }
    }
  }, [router]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`https://abdullah-test.whitescastle.com/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to add user");
      } else {
        toast.success("User added successfully ✅", { autoClose: 2000 });
        setForm({ name: "", email: "", password: "", role: "user" });
        setTimeout(() => router.push("/users"), 2000);
      }
    } catch (error) {
      toast.error("Server error, please try again later");
    } finally {
      setLoading(false);
    }
  };
  if(loading){
    return(
      <HomeWrapper> <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400"></div>
        </div>
      </HomeWrapper>
    );
  }

  return (
    <AuthGuard>
        <div className="flex justify-center items-center min-h-[calc(100vh-77px)]">
             <div
      className="w-full min-h-[calc(100vh-77px)] flex justify-center items-start 
      bg-cover bg-center bg-no-repeat overflow-hidden "
      style={{ backgroundImage: "url('/images/adduser.jpg')" ,opacity:"100%" }}
    >
       <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70 z-10"></div>
          <div className="bg-gray-900 text-white rounded-2xl shadow-xl p-8 max-w-lg w-full mt-6 z-20">
             <div className=" flex flex-col md:flex-row md:items-center md:justify-between">
              <h1 className="text-2xl font-bold mb-4 ">➕Add User</h1>
              <Link href="/users" className="mb-6 inline-block text-white font-bold   bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition">
                &larr; Back to List
              </Link>
      </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block mb-1 font-semibold">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block mb-1 font-semibold">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  placeholder="Email Address"
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block mb-1 font-semibold">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  placeholder="Password"
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="block mb-1 font-semibold">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add User"}
              </button>
            </form>
          </div>
        </div>
        </div>
    </AuthGuard>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import HomeWrapper from '@/components/HomeWrapper';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(
        'https://abdullah-test.whitescastle.com/api/auth/login',
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        document.cookie = 'isLoggedIn=true; path=/; max-age=3600';
        toast.success('Login successful!', { delay: 1000 });
        router.push('/home');
      } else {
        toast.error(data.message || 'Login failed');
        setError(data.message || 'Login failed. Try again.');
      }
    } catch (err) {
      toast.error('Incorrect email or password');
      setError('Login failed. Try again.');
    } finally {
      // Always stop loading spinner
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <HomeWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400"></div>
        </div>
      </HomeWrapper>
    );
  }

  return (
    <HomeWrapper>
      <main
        className="min-h-screen w-full bg-cover bg-center flex items-center justify-center px-4"
        style={{ backgroundImage: "url('/images/login.jpg')" }}
      >
        <div className="w-full max-w-md bg-black/40 backdrop-transparent-2xl border border-white/10 rounded-3xl p-10 shadow-xl">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Login here</h2>

          {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
            >
              {loading ? 'Loading...' : <>Login <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      </main>
    </HomeWrapper>
  );
}

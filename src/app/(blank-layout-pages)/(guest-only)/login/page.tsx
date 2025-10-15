'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import HomeWrapper from '@/components/HomeWrapper';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Show toast from sessionStorage if redirected after login
  useEffect(() => {
    const toastData = sessionStorage.getItem('loginToast');
    if (toastData) {
      const { message } = JSON.parse(toastData);
      toast.success(message);
      sessionStorage.removeItem('loginToast');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('https://abdullah-test.whitescastle.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Login successful! Redirecting...', {
          toastId: `login-success-${Date.now()}`,
        });
        setTimeout(() => router.push('/home'), 1200); // 0.5s delay

        setEmail('');
        setPassword('');
        setLoading(false);
      } else {
        const errorMessage = data.message || 'Incorrect email or password';
        toast.error(errorMessage);
        setError(errorMessage);
        setPassword('');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = 'Network error, please try again';
      toast.error(errorMessage);
      setError(errorMessage);
      setPassword('');
      setLoading(false);
    }
  };

  return (
    <HomeWrapper>
      
      <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
      <main
        className="min-h-screen w-full bg-cover bg-center flex items-center justify-center px-4"
        style={{ backgroundImage: "url('/images/login.jpg')" }}
      >
        <div className="w-full max-w-md bg-black/40 border border-white/10 rounded-3xl p-10 shadow-xl backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Log In 🚀
          </h2>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-300 bg-red-800/50 rounded-lg text-center border border-red-700/50">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email-input" className="text-sm text-gray-300 mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  id="email-input"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-800/80 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 border border-transparent focus:border-indigo-500 disabled:opacity-70"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password-input" className="text-sm text-gray-300 mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-800/80 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 border border-transparent focus:border-indigo-500 disabled:opacity-70"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-3 text-gray-400 hover:text-black transition duration-200 disabled:opacity-50"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 cursor-pointer text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Authenticating...
                </>
              ) : (
                <>
                  Log In <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </HomeWrapper>
  );
}

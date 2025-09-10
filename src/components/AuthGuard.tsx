// AuthGuard.tsx
'use client';
import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import HomeWrapper from './HomeWrapper';

interface AuthGuardProps {
  children: ReactNode;
}

const BASE_URL = 'https://abdullah-test.whitescastle.com/api';

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to continue');
      router.replace('/login');
      return;
    }

    fetch(`${BASE_URL}/auth/check-auth`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Invalid session');
        const data = await res.json();
        setUser(data.user); // save user
        setLoading(false);
      })
      .catch(() => {
        toast.error('Authentication failed');
        router.replace('/login');
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <HomeWrapper>
          <div className="animate-pulse text-white/70">Checking session…</div>
        </HomeWrapper>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>; // just render JSX children
}

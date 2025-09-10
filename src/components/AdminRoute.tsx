'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';

interface AdminRouteProps {
  user: any;
  children: React.ReactNode;
}

export default function AdminRoute({ user, children }: AdminRouteProps) {
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const toastShown = useRef(false); // Track if toast was already shown

  useEffect(() => {
    if (!user) {
      setIsAllowed(null);
      return;
    }

    if (user.role === "admin") {
      setIsAllowed(true);
    } else {
      if (!toastShown.current) {
        toastShown.current = true; // prevent multiple toasts
        toast.error("🚫 You are not an admin!", { autoClose: 1500 });
      }
      setIsAllowed(false);
      setTimeout(() => {
        router.push("/login");
      }, 500);
    }
  }, [user, router]);

  if (isAllowed !== true) return null;

  return <>{children}</>;
}

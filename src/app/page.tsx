// Do NOT use 'use client' here
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Server-side redirect
  redirect('/welcome');
}

"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function LoginSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      
      // Fetch user data to populate localStorage
      fetch("http://localhost:3001/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(user => {
        localStorage.setItem("user", JSON.stringify(user));
        router.push("/");
      })
      .catch(() => {
        router.push("/login?error=Failed to complete google login");
      });
    } else {
      router.push("/login?error=No token found");
    }
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="p-4 bg-white rounded-2xl shadow-xl shadow-indigo-500/10 border border-zinc-100">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-zinc-900">Authenticating...</h1>
        <p className="text-zinc-500 text-sm">Finishing your secure sign in with Google.</p>
      </div>
    </div>
  );
}

export default function LoginSuccessPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-8">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 bg-white rounded-2xl shadow-xl shadow-indigo-500/10 border border-zinc-100">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-zinc-900">Authenticating...</h1>
            <p className="text-zinc-500 text-sm">Finishing your secure sign in with Google.</p>
          </div>
        </div>
      }>
        <LoginSuccessContent />
      </Suspense>
    </div>
  );
}

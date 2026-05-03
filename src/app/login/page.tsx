"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Invalid credentials");
      
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  return (
    <div className="h-[100dvh] w-full bg-[#0a0a0a] text-zinc-100 font-sans overflow-hidden selection:bg-indigo-500/30">
      <div className="flex flex-col md:grid md:grid-cols-[1fr_480px] h-full relative">
        
        {/* Background / Left Panel */}
        <div className="relative hidden md:flex flex-col justify-center p-12 lg:p-20 overflow-hidden h-full">
          {/* Subtle elegant background gradients */}
          <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Hero Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 space-y-12 max-w-2xl"
          >
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white text-black grid place-items-center shadow-lg transition-transform group-hover:scale-105">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m8 2 1.88 1.88" />
                  <path d="M14.12 3.88 16 2" />
                  <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
                  <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
                  <path d="M12 20v-9" />
                  <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
                  <path d="M17.47 9c1.93-.2 3.53-1.9 3.53-4" />
                  <path d="M8 12H4.62" />
                  <path d="M16 12h3.38" />
                  <path d="M8 16H5.5" />
                  <path d="M16 16h2.5" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-white leading-none">BugTracker</span>
                <span className="text-[10px] text-zinc-400 font-medium tracking-widest uppercase mt-1">Enterprise</span>
              </div>
            </Link>

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs font-medium text-zinc-300 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                System Operational
              </div>
              
              <h1 className="font-sans font-extrabold text-5xl lg:text-7xl leading-[1.05] tracking-tighter text-white">
                Track bugs.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                  Build better<br />software.
                </span>
              </h1>
              
              <p className="text-zinc-400 text-lg font-normal leading-relaxed max-w-md">
                The professional platform for modern engineering teams to manage projects, track issues, and ship faster.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-zinc-800/50">
              <div>
                <div className="text-white font-semibold mb-1 flex items-center gap-2">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                  Velocity
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed">Real-time sync across your entire organization.</p>
              </div>
              <div>
                <div className="text-white font-semibold mb-1 flex items-center gap-2">
                  <div className="w-1 h-4 bg-cyan-500 rounded-full" />
                  Security
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed">Enterprise-grade security and role management.</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Form Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-20 bg-white h-full flex flex-col justify-center p-8 md:p-12 shadow-2xl overflow-y-auto"
        >
          <div className="max-w-[360px] mx-auto w-full space-y-8">
            
            {/* Mobile Header */}
            <div className="md:hidden flex items-center gap-3 mb-8">
               <div className="w-8 h-8 rounded-lg bg-black text-white grid place-items-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M17.47 9c1.93-.2 3.53-1.9 3.53-4"/><path d="M8 12H4.62"/><path d="M16 12h3.38"/><path d="M8 16H5.5"/><path d="M16 16h2.5"/></svg>
               </div>
               <span className="font-bold text-zinc-900 tracking-tight">BugTracker</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-zinc-900 text-3xl font-bold tracking-tight">Welcome back</h2>
              <p className="text-zinc-500 text-sm">Enter your credentials to access your workspace.</p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2 overflow-hidden"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold text-zinc-700">Email Address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="name@company.com"
                  required 
                  className="h-11 bg-zinc-50/50 border-zinc-200 focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all rounded-lg text-zinc-900 placeholder:text-zinc-400" 
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-zinc-700">Password</Label>
                  <Link href="#" className="text-xs font-medium text-zinc-500 hover:text-black transition-colors">Forgot password?</Link>
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="••••••••"
                  required 
                  className="h-11 bg-zinc-50/50 border-zinc-200 focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all rounded-lg text-zinc-900 placeholder:text-zinc-400" 
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-11 bg-black hover:bg-zinc-800 text-white rounded-lg text-sm font-semibold group transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative flex items-center gap-3 py-2">
              <div className="flex-1 h-[1px] bg-zinc-100" />
              <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Or continue with</span>
              <div className="flex-1 h-[1px] bg-zinc-100" />
            </div>

            <Button 
              variant="outline" 
              type="button" 
              onClick={handleGoogleLogin} 
              className="w-full h-11 border-zinc-200 bg-white rounded-lg hover:bg-zinc-50 hover:text-zinc-900 transition-all text-zinc-600 font-medium gap-3"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Button>

            <p className="text-center text-sm text-zinc-500">
              Don&apos;t have an account? 
              <Link href="/register" className="ml-1.5 text-black font-semibold hover:underline underline-offset-4">Create one</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

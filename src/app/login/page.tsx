"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bug, ShieldCheck, Zap, Users, ArrowRight, Loader2 } from "lucide-react";

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
      const res = await fetch("http://localhost:3001/api/auth/login", {
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
    window.location.href = "http://localhost:3001/api/auth/google";
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col lg:flex-row overflow-hidden selection:bg-indigo-500/30">
      {/* Left Side - Visual Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-white p-12 flex-col justify-between overflow-hidden border-r border-zinc-200">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200">
              <Bug className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900">BugTracker SaaS</span>
          </div>

          <div className="space-y-8">
            <h1 className="text-6xl font-extrabold tracking-tighter leading-[1.1] text-zinc-900">
              Track bugs. <br />
              <span className="bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Build better software.
              </span>
            </h1>
            <p className="text-zinc-500 text-lg max-w-md leading-relaxed">
              The all-in-one platform for modern teams to manage projects, track issues, and collaborate in real-time.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-6">
          <div className="p-4 rounded-2xl bg-white/50 border border-zinc-200 backdrop-blur-sm shadow-sm">
            <Zap className="w-5 h-5 text-indigo-600 mb-2" />
            <h3 className="font-semibold text-sm text-zinc-900">Lightning Fast</h3>
            <p className="text-xs text-zinc-500 mt-1">Real-time updates across your entire team.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/50 border border-zinc-200 backdrop-blur-sm shadow-sm">
            <ShieldCheck className="w-5 h-5 text-cyan-600 mb-2" />
            <h3 className="font-semibold text-sm text-zinc-900">Secure by Design</h3>
            <p className="text-xs text-zinc-500 mt-1">Enterprise-grade security for your data.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-zinc-50 relative">
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <Bug className="w-6 h-6 text-indigo-600" />
          <span className="font-bold tracking-tight text-zinc-900">BugTracker</span>
        </div>

        <div className="w-full max-w-[400px] space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Welcome Back</h2>
            <p className="text-zinc-500 font-medium">Enter your credentials to access your workspace.</p>
          </div>

          <Card className="bg-white border-zinc-200 backdrop-blur-xl shadow-xl shadow-indigo-500/5 overflow-hidden">
            <CardContent className="p-6 md:p-8">
              {error && (
                <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Email Address</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="name@company.com"
                    required 
                    className="h-11 bg-zinc-50 border-zinc-200 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-zinc-900 placeholder:text-zinc-400" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Password</Label>
                    <Link href="#" className="text-xs text-indigo-600 font-semibold hover:text-indigo-500 transition-colors">Forgot password?</Link>
                  </div>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    placeholder="••••••••"
                    required 
                    className="h-11 bg-zinc-50 border-zinc-200 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-zinc-900 placeholder:text-zinc-400" 
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 group shadow-lg shadow-indigo-200"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
                
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-100"></div></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-white px-3 text-zinc-400">Or continue with</span></div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button variant="outline" type="button" onClick={handleGoogleLogin} className="w-full bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 shadow-sm">
                    <Users className="w-4 h-4 mr-2 text-zinc-400" /> Continue with Google
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-zinc-500 font-medium">
            Don't have an account?{" "}
            <Link href="/register" className="text-indigo-600 font-bold hover:text-indigo-500 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

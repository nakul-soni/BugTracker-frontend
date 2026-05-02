"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bug, ShieldCheck, Zap, Rocket, ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage() {
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
      const res = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to register");
      }
      
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

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col lg:flex-row overflow-hidden selection:bg-indigo-500/30">
      {/* Left Side - Visual Panel (Mirrored from Login) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-white p-12 flex-col justify-between overflow-hidden border-r border-zinc-200">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200">
              <Bug className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900">BugTracker SaaS</span>
          </div>

          <div className="space-y-8">
            <h1 className="text-6xl font-extrabold tracking-tighter leading-[1.1] text-zinc-900">
              Scale faster. <br />
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Ship with confidence.
              </span>
            </h1>
            <p className="text-zinc-500 text-lg max-w-md leading-relaxed">
              Join thousands of developers who use BugTracker to deliver high-quality software at scale.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-6">
          <div className="p-4 rounded-2xl bg-white/50 border border-zinc-200 backdrop-blur-sm shadow-sm">
            <Rocket className="w-5 h-5 text-violet-600 mb-2" />
            <h3 className="font-semibold text-sm text-zinc-900">Rapid Deployment</h3>
            <p className="text-xs text-zinc-500 mt-1">Get up and running in less than 2 minutes.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/50 border border-zinc-200 backdrop-blur-sm shadow-sm">
            <ShieldCheck className="w-5 h-5 text-indigo-600 mb-2" />
            <h3 className="font-semibold text-sm text-zinc-900">Role Management</h3>
            <p className="text-xs text-zinc-500 mt-1">Fine-grained access control for your team.</p>
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
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Create Account</h2>
            <p className="text-zinc-500 font-medium">Join BugTracker today and start squashig bugs.</p>
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
                  <Label htmlFor="name" className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Full Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    type="text" 
                    placeholder="John Doe"
                    required 
                    className="h-11 bg-zinc-50 border-zinc-200 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-zinc-900 placeholder:text-zinc-400" 
                  />
                </div>
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
                  <Label htmlFor="password" className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Password</Label>
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
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 group shadow-lg shadow-indigo-200 mt-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-zinc-500 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-500 transition-colors">
              Log in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

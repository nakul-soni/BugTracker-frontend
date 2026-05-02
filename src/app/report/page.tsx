"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useTheme } from "next-themes";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function ReportBugPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [description, setDescription] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch("http://localhost:3001/api/projects", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const token = localStorage.getItem("token");
    
    try {
      if (!projects.length) throw new Error("No projects available to assign the bug to.");
      
      const payload = {
        title: formData.get("title"),
        description: formData.get("description"),
        severity: formData.get("severity"),
        priority: formData.get("priority"),
        projectId: formData.get("projectId") || projects[0].id,
      };

      const res = await fetch("http://localhost:3001/api/bugs", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create bug");
      
      toast.success("Bug reported successfully!");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-2 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">Report Issue</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Provide comprehensive details for the engineering team.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 shadow-xl backdrop-blur-sm">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold">Bug Title</Label>
                <Input id="title" name="title" required className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus-visible:ring-indigo-500 h-12 shadow-sm text-lg font-medium" placeholder="Brief summary of the issue..." />
              </div>
              
              <div className="space-y-2 flex-1">
                <Label className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold">Detailed Description</Label>
                <div data-color-mode={resolvedTheme === "dark" ? "dark" : "light"} className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm h-full">
                  <MDEditor value={description} onChange={(val) => setDescription(val || "")} height={500} />
                </div>
                <input type="hidden" name="description" value={description} required />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 shadow-xl backdrop-blur-sm sticky top-8">
            <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800/50 mb-4">
              <CardTitle className="text-zinc-900 dark:text-zinc-50">Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="projectId" className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold">Target Project</Label>
                <select id="projectId" name="projectId" className="flex h-11 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:ring-indigo-500 shadow-sm cursor-pointer">
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity" className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold">Severity</Label>
                <select id="severity" name="severity" className="flex h-11 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:ring-indigo-500 shadow-sm cursor-pointer">
                  <option value="LOW">Low</option>
                  <option value="MINOR">Minor</option>
                  <option value="MAJOR">Major</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="BLOCKER">Blocker</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold">Priority</Label>
                <select id="priority" name="priority" className="flex h-11 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:ring-indigo-500 shadow-sm cursor-pointer">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-8 h-12 shadow-md shadow-indigo-500/20 text-md font-bold transition-all">
                {loading ? "Submitting..." : "Submit Bug Report"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

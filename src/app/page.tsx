"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Bug, AlertCircle, Loader2 } from "lucide-react";

export default function BugsDashboard() {
  const router = useRouter();
  const [bugs, setBugs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("http://localhost:3001/api/bugs", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => {
        setBugs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        router.push("/login");
      });
  }, [router]);

  const severityColors: Record<string, string> = {
    CRITICAL: "bg-red-500 hover:bg-red-600",
    MAJOR: "bg-orange-500 hover:bg-orange-600",
    MINOR: "bg-yellow-500 hover:bg-yellow-600",
    LOW: "bg-blue-500 hover:bg-blue-600",
  };

  const statusColors: Record<string, string> = {
    OPEN: "bg-zinc-800",
    IN_PROGRESS: "bg-blue-600",
    FIXED: "bg-green-600",
    CLOSED: "bg-gray-600",
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        <header className="flex items-center justify-between pb-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
              Global Overview
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage, track, and resolve issues across all your projects.</p>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 shadow-xl backdrop-blur-sm hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Bugs</CardTitle>
              <Bug className="w-4 h-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{bugs.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 shadow-xl backdrop-blur-sm hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Open Issues</CardTitle>
              <AlertCircle className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500 dark:text-red-400">
                {bugs.filter((b: any) => b.status === "OPEN").length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 shadow-xl backdrop-blur-sm hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">In Progress</CardTitle>
              <Loader2 className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500 dark:text-blue-400">
                {bugs.filter((b: any) => b.status === "IN_PROGRESS").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl backdrop-blur-sm">
          <CardHeader className="pb-6 border-b border-zinc-100 dark:border-zinc-800/50 mb-4">
            <CardTitle className="text-zinc-900 dark:text-zinc-100">Recent Bugs</CardTitle>
            <CardDescription className="text-zinc-500 dark:text-zinc-400">
              A list of recent bugs reported across your projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bugs.length === 0 ? (
               <p className="text-zinc-500 dark:text-zinc-400 italic">No bugs found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <TableHead className="text-zinc-500 dark:text-zinc-400 font-semibold">Title</TableHead>
                    <TableHead className="text-zinc-500 dark:text-zinc-400 font-semibold">Status</TableHead>
                    <TableHead className="text-zinc-500 dark:text-zinc-400 font-semibold">Severity</TableHead>
                    <TableHead className="text-zinc-500 dark:text-zinc-400 font-semibold">Reporter</TableHead>
                    <TableHead className="text-zinc-500 dark:text-zinc-400 font-semibold text-right">Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bugs.map((bug: any) => (
                    <TableRow key={bug.id} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer" onClick={() => router.push(`/bug/${bug.id}`)}>
                      <TableCell className="font-medium text-indigo-600 dark:text-indigo-400">{bug.title}</TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[bug.status]} border-none text-white shadow-sm`}>
                          {bug.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${severityColors[bug.severity]} border-none text-white shadow-sm`}>
                          {bug.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-600 dark:text-zinc-400">{bug.reporter?.name || "Unknown"}</TableCell>
                      <TableCell className="text-right text-zinc-500 dark:text-zinc-400">
                        {new Date(bug.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
    </div>
  );
}

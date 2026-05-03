"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AlertCircle, Activity, CheckCircle2, Loader2, Bug } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/api";

function BugsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusParam = searchParams.get("status") || "ALL";
  
  const [bugs, setBugs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${API_BASE_URL}/api/bugs`, {
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

  const getStatusDetails = () => {
    switch (statusParam) {
      case "OPEN": return { title: "Open Bugs", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10" };
      case "IN_PROGRESS": return { title: "In Progress Bugs", icon: Activity, color: "text-yellow-500", bg: "bg-yellow-500/10" };
      case "RESOLVED": return { title: "Resolved Bugs", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" };
      default: return { title: "All Bugs", icon: Bug, color: "text-indigo-500", bg: "bg-indigo-500/10" };
    }
  };

  const { title, icon: Icon, color, bg } = getStatusDetails();

  const filteredBugs = bugs.filter(bug => {
    if (statusParam === "ALL") return true;
    if (statusParam === "RESOLVED") return bug.status === "RESOLVED" || bug.status === "FIXED" || bug.status === "CLOSED";
    return bug.status === statusParam;
  });

  const severityColors: Record<string, string> = {
    CRITICAL: "bg-rose-500 hover:bg-rose-600",
    MAJOR: "bg-orange-500 hover:bg-orange-600",
    MINOR: "bg-yellow-500 hover:bg-yellow-600",
    LOW: "bg-blue-500 hover:bg-blue-600",
  };

  const statusBadgeColors: Record<string, string> = {
    OPEN: "bg-rose-500 hover:bg-rose-600 text-white border-none",
    IN_PROGRESS: "bg-yellow-500 hover:bg-yellow-600 text-white border-none",
    FIXED: "bg-emerald-500 hover:bg-emerald-600 text-white border-none",
    RESOLVED: "bg-emerald-500 hover:bg-emerald-600 text-white border-none",
    CLOSED: "bg-zinc-600 hover:bg-zinc-700 text-white border-none",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col gap-1 mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
          <div className={`p-2 rounded-xl ${bg}`}>
            <Icon className={`w-8 h-8 ${color}`} />
          </div>
          {title}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">View and manage issues filtered by their current status.</p>
      </header>

      <div className="bg-white dark:bg-[#151923] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="text-sm font-medium">Loading bugs...</span>
          </div>
        ) : filteredBugs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className={`w-16 h-16 rounded-2xl ${bg} flex items-center justify-center mb-4`}>
              <Icon className={`w-8 h-8 ${color}`} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">No bugs found</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
              There are currently no bugs matching the status "{statusParam.replace('_', ' ')}".
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/80 overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                <TableRow className="border-zinc-200 dark:border-zinc-800/80 hover:bg-transparent">
                  <TableHead className="text-zinc-500 dark:text-zinc-400 font-semibold h-10">Title</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400 font-semibold h-10">Status</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400 font-semibold h-10">Severity</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400 font-semibold h-10">Reporter</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400 font-semibold h-10 text-right">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBugs.map((bug: any) => (
                  <TableRow 
                    key={bug.id} 
                    className="border-zinc-200 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group" 
                    onClick={() => router.push(`/bug/${bug.id}`)}
                  >
                    <TableCell className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors py-3">
                      {bug.title}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge className={`${statusBadgeColors[bug.status] || "bg-zinc-500"} shadow-sm`}>
                        {bug.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge className={`${severityColors[bug.severity] || "bg-zinc-500 text-white"} border-none shadow-sm`}>
                        {bug.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-400 py-3 text-sm">
                      {bug.reporter?.name || "Unknown"}
                    </TableCell>
                    <TableCell className="text-right text-zinc-500 dark:text-zinc-400 py-3 text-sm">
                      {new Date(bug.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BugsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-zinc-500">Loading...</div>}>
      <BugsContent />
    </Suspense>
  );
}

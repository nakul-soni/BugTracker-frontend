"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bug, AlertCircle, Activity as ActivityIcon, CheckCircle2, MoreHorizontal, Settings, User, ArrowRight, ShieldAlert } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export default function BugsDashboard() {
  const router = useRouter();
  const [bugs, setBugs] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([
      fetch(`${API_BASE_URL}/api/bugs`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_BASE_URL}/api/bugs/activity/all`, { headers: { Authorization: `Bearer ${token}` } })
    ])
      .then(async ([bugsRes, activityRes]) => {
        if (!bugsRes.ok) throw new Error("Unauthorized");
        const bugsData = await bugsRes.json();
        setBugs(Array.isArray(bugsData) ? bugsData : []);
        
        if (activityRes.ok) {
          const activityData = await activityRes.json();
          setActivities(Array.isArray(activityData) ? activityData : []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        router.push("/login");
      });
  }, [router]);

  if (loading) return <div className="flex items-center justify-center h-full text-zinc-500">Loading dashboard...</div>;

  const openCount = bugs.filter((b: any) => b.status === "OPEN").length;
  const inProgressCount = bugs.filter((b: any) => b.status === "IN_PROGRESS").length;
  const inReviewCount = bugs.filter((b: any) => b.status === "IN_REVIEW").length;
  const resolvedCount = bugs.filter((b: any) => b.status === "RESOLVED" || b.status === "FIXED" || b.status === "CLOSED").length;
  const totalBugs = bugs.length;

  const getDonutSegments = () => {
    if (totalBugs === 0) return null;
    let currentOffset = 0;
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    
    return [
      { count: openCount, color: "#f43f5e" },       // rose-500
      { count: inProgressCount, color: "#eab308" }, // yellow-500
      { count: inReviewCount, color: "#3b82f6" },   // blue-500
      { count: resolvedCount, color: "#22c55e" }    // green-500
    ].map((segment, i) => {
      if (segment.count === 0) return null;
      const strokeDasharray = `${(segment.count / totalBugs) * circumference} ${circumference}`;
      const strokeDashoffset = -currentOffset;
      currentOffset += (segment.count / totalBugs) * circumference;
      return (
        <circle
          key={i}
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke={segment.color}
          strokeWidth="8"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          transform="rotate(-90 50 50)"
        />
      );
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header Section */}
      <header className="flex flex-col gap-1 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-500 tracking-wider uppercase">Global Overview</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 font-instrument">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage, track, and resolve issues across all your projects.</p>
      </header>

      {/* Status Banner */}
      <div className="w-full bg-[#f0fdf4] dark:bg-[#064e3b]/20 border border-[#bbf7d0] dark:border-[#065f46] rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm shadow-sm">
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          All systems operational — No incidents reported
        </div>
        <div className="text-emerald-600/70 dark:text-emerald-500/70 text-xs mt-1 sm:mt-0 font-medium">
          Last checked 2 min ago
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Bugs */}
        <div className="bg-white dark:bg-[#151923] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500/50 to-indigo-500/0 opacity-50" />
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Bugs</h3>
            <div className="w-6 h-6 rounded bg-indigo-50 dark:bg-indigo-500/10 grid place-items-center">
              <Bug className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">{totalBugs}</div>
          <div className="mt-auto">
            {totalBugs === 0 ? (
              <span className="inline-flex px-2 py-1 bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[10px] rounded-full font-medium">No data yet</span>
            ) : (
              <span className="inline-flex px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] rounded-full font-medium">Updated just now</span>
            )}
          </div>
        </div>

        {/* Open Issues */}
        <div className="bg-white dark:bg-[#151923] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500/50 to-rose-500/0 opacity-50" />
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Open Issues</h3>
            <div className="w-6 h-6 rounded bg-rose-50 dark:bg-rose-500/10 grid place-items-center">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <div className="text-4xl font-bold text-rose-600 dark:text-rose-500 mb-4">{openCount}</div>
          <div className="mt-auto">
            {openCount === 0 ? (
              <span className="inline-flex px-2 py-1 bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[10px] rounded-full font-medium">No data yet</span>
            ) : (
              <span className="inline-flex px-2 py-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] rounded-full font-medium">Requires attention</span>
            )}
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-[#151923] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500/50 to-yellow-500/0 opacity-50" />
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400">In Progress</h3>
            <div className="w-6 h-6 rounded bg-yellow-50 dark:bg-yellow-500/10 grid place-items-center">
              <ActivityIcon className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-500 mb-4">{inProgressCount}</div>
          <div className="mt-auto">
            {inProgressCount === 0 ? (
              <span className="inline-flex px-2 py-1 bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[10px] rounded-full font-medium">No data yet</span>
            ) : (
              <span className="inline-flex px-2 py-1 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[10px] rounded-full font-medium">Currently active</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left Col (2/3) - Recent Bugs */}
        <div className="lg:col-span-2 bg-white dark:bg-[#151923] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <h2 className="font-bold text-sm text-zinc-900 dark:text-white">Recent Bugs</h2>
            </div>
            <Link href="/bugs" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:opacity-80 transition-opacity">
              View all →
            </Link>
          </div>

          {bugs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 grid place-items-center mb-4">
                <Bug className="w-6 h-6 text-indigo-500" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">No bugs reported yet</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[200px] leading-relaxed mb-6">
                Once your team starts reporting issues, they'll appear here.
              </p>
              <Button 
                onClick={() => router.push("/report")}
                className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-xs font-semibold h-8 rounded-lg shadow-none border-none"
              >
                + Report your first bug
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {[...bugs]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
                .map(bug => (
                <Link href={`/bug/${bug.id}`} key={bug.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#1A1F2B] hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bug className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">{bug.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="font-mono text-[10px]">BUG-{bug.id.substring(0, 4)}</span>
                        <span>•</span>
                        <span className="truncate max-w-[150px]">{bug.project?.name || "Unknown Project"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 sm:mt-0">
                    <Badge variant="secondary" className="bg-zinc-200 dark:bg-zinc-800 text-[10px] uppercase font-bold tracking-wider border-none text-zinc-600 dark:text-zinc-300 px-2 py-0.5">{bug.status.replace("_", " ")}</Badge>
                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px]" title={bug.assignee?.name || "Unassigned"}>
                       {bug.assignee?.name?.charAt(0) || "U"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Col (1/3) - Issue Breakdown & Activity */}
        <div className="flex flex-col gap-4">
          {/* Issue Breakdown */}
          <div className="bg-white dark:bg-[#151923] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              <h2 className="font-bold text-sm text-zinc-900 dark:text-white">Issue Breakdown</h2>
            </div>

            <div className="flex flex-col items-center justify-center mb-6 relative">
              <div className="w-32 h-32 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                  {/* Background track */}
                  <circle cx="50" cy="50" r="36" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-zinc-100 dark:text-zinc-800/50" />
                  {/* Data segments */}
                  {totalBugs > 0 ? getDonutSegments() : (
                    <circle cx="50" cy="50" r="36" fill="transparent" stroke="#3b82f6" strokeWidth="8" strokeDasharray="1 226" strokeDashoffset="0" strokeLinecap="round" />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-zinc-900 dark:text-white leading-none">{totalBugs}</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">total</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Open</div>
                <span className="font-bold text-zinc-900 dark:text-white">{openCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> In Progress</div>
                <span className="font-bold text-zinc-900 dark:text-white">{inProgressCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> In Review</div>
                <span className="font-bold text-zinc-900 dark:text-white">{inReviewCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Resolved</div>
                <span className="font-bold text-zinc-900 dark:text-white">{resolvedCount}</span>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white dark:bg-[#151923] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex-1 min-h-[150px] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h2 className="font-bold text-sm text-zinc-900 dark:text-white">Activity</h2>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
              {activities.length === 0 ? (
                <div className="flex items-center justify-center h-full text-xs text-zinc-500 dark:text-zinc-400 italic">
                  No recent activity
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.slice(0, 5).map((log: any) => {
                    const changes = log.metadata?.changes || [];
                    if (changes.length === 0) return null;
                    return (
                      <div key={log.id} className="text-sm">
                        <div className="flex items-center justify-between mb-1 text-xs">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{log.userName}</span>
                          <span className="text-zinc-500 dark:text-zinc-500">{new Date(log.createdAt).toLocaleString([], { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
                          {log.action === 'CREATED' ? 'Reported new bug ' : log.action === 'COMMENTED' ? 'Commented on ' : 'Updated '}
                          <Link href={`/bug/${log.metadata?.bugId}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{log.bugTitle}</Link>
                        </div>
                        <div className="space-y-2">
                          {log.action === 'CREATED' && (
                            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                              Initial report submitted
                            </div>
                          )}
                          {log.action === 'COMMENTED' && (
                            <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/50 text-[10px] text-zinc-600 dark:text-zinc-300 italic line-clamp-2">
                              New feedback added to this issue
                            </div>
                          )}
                          {changes.slice(0, 2).map((change: any, i: number) => {
                            let Icon = Settings;
                            if (change.field === 'status') Icon = CheckCircle2;
                            if (change.field === 'severity') Icon = ShieldAlert;
                            if (change.field === 'priority') Icon = AlertCircle;
                            if (change.field === 'assignedTo') Icon = User;
                            return (
                              <div key={i} className="flex flex-col gap-1 p-2 rounded-lg bg-zinc-50 dark:bg-[#0B0E14] border border-zinc-100 dark:border-zinc-800/50">
                                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                                  <Icon className="w-3 h-3" /> {change.field}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs">
                                  <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium line-through decoration-zinc-400/50 truncate max-w-[80px]">
                                    {change.field === 'assignedTo' ? change.oldName : (change.old || 'None')}
                                  </span>
                                  <ArrowRight className="w-3 h-3 text-zinc-400 shrink-0" />
                                  <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold truncate max-w-[80px]">
                                    {change.field === 'assignedTo' ? change.newName : (change.new || 'None')}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          {changes.length > 2 && (
                            <div className="text-[10px] text-zinc-500 text-center italic">+ {changes.length - 2} more changes</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

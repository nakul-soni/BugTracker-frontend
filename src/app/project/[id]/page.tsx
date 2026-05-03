"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { KanbanBoard } from "@/components/kanban-board";
import { LayoutGrid, List, Search, Filter, UserPlus, Bug as BugIcon, Users, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

export default function ProjectBugsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [bugs, setBugs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRole, setMyRole] = useState<string>("");
  const [myUserId, setMyUserId] = useState<string>("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("TESTER");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterSeverity, setFilterSeverity] = useState("ALL");
  const [filterAssignee, setFilterAssignee] = useState("ALL");

  const filteredBugs = bugs.filter(bug => {
    const matchesSearch = bug.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || bug.status === filterStatus;
    const matchesSeverity = filterSeverity === "ALL" || bug.severity === filterSeverity;
    const matchesAssignee = filterAssignee === "ALL" || (filterAssignee === "UNASSIGNED" ? !bug.assignedTo : bug.assignedTo === filterAssignee);
    return matchesSearch && matchesStatus && matchesSeverity && matchesAssignee;
  });

  const handleStatusChange = async (bugId: string, newStatus: string) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_BASE_URL}/api/bugs/${bugId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      const [bugsRes, meRes, memRes, usersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/bugs?projectId=${resolvedParams.id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/projects/${resolvedParams.id}/members`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const bugsData = await bugsRes.json();
      const meData = await meRes.json();
      const memData = await memRes.json();
      const usersData = await usersRes.json();
      
      setBugs(Array.isArray(bugsData) ? bugsData : []);
      setAllUsers(Array.isArray(usersData) ? usersData : []);
      setMembers(Array.isArray(memData) ? memData : []);
      if (meData?.userId && Array.isArray(memData)) {
        setMyUserId(meData.userId);
        const member = memData.find(m => m.userId === meData.userId);
        if (member) setMyRole(member.role);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [resolvedParams.id]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${resolvedParams.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      });
      if (res.ok) {
        toast.success("Member invited successfully!");
        setInviteEmail("");
        fetchData();
      } else {
        const errorData = await res.json();
        toast.error(`Failed to invite: ${errorData.message || "Are you a MANAGER?"}`);
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    if (targetUserId === myUserId) return toast.error("You cannot remove yourself!");
    if (!confirm("Are you sure you want to remove this member?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${resolvedParams.id}/members/${targetUserId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Member removed successfully!");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(`Failed to remove: ${err.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const severityColors: Record<string, string> = { CRITICAL: "bg-rose-500 text-white", MAJOR: "bg-orange-500 text-white", MINOR: "bg-yellow-500 text-white", LOW: "bg-blue-500 text-white" };
  const statusColors: Record<string, string> = { OPEN: "bg-rose-500 text-white", IN_PROGRESS: "bg-yellow-500 text-white", FIXED: "bg-emerald-500 text-white", CLOSED: "bg-zinc-600 text-white", VERIFIED: "bg-teal-600 text-white", REOPENED: "bg-purple-600 text-white", ASSIGNED: "bg-blue-400 text-white" };

  if (loading) return <div className="flex items-center justify-center h-full text-zinc-500">Loading project...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
        {/* Header Section */}
        <header className="flex flex-col gap-1 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-500 tracking-wider uppercase">Project Dashboard</span>
                <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border-none shadow-sm ml-2 font-bold uppercase tracking-wider">{myRole}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                Issues Overview
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Manage, track, and resolve issues mapped to this project.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800">
                <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-md flex items-center transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('table')} className={`p-2 rounded-md flex items-center transition-all ${viewMode === 'table' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>
              <Link href="/report" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium shadow-sm transition-all h-9 flex items-center">
                Report Issue
              </Link>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="bg-white dark:bg-[#151923] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input 
              placeholder="Search bugs by title..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus-visible:ring-indigo-500 h-10 shadow-none" 
            />
          </div>
          <div className="flex gap-4 flex-wrap md:flex-nowrap">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 shadow-none cursor-pointer min-w-[140px]">
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="VERIFIED">Verified</option>
              <option value="FIXED">Fixed</option>
              <option value="CLOSED">Closed</option>
            </select>
            <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 shadow-none cursor-pointer min-w-[140px]">
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="MAJOR">Major</option>
              <option value="MINOR">Minor</option>
              <option value="LOW">Low</option>
            </select>
            <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)} className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 shadow-none cursor-pointer min-w-[150px]">
              <option value="ALL">All Assignees</option>
              <option value="UNASSIGNED">Unassigned</option>
              {members.filter(m => m.role !== 'TESTER').map(m => (
                <option key={m.userId} value={m.userId}>{m.user?.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {myRole === 'MANAGER' && (
              <div className="bg-white dark:bg-[#151923] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
                <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <label className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-bold mb-2 flex items-center gap-2"><UserPlus className="w-4 h-4"/> Invite New Member</label>
                    <select required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="w-full h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-sm px-3 text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-500 shadow-none cursor-pointer transition-all">
                      <option value="">Select a user...</option>
                      {allUsers.filter(u => !members.some(m => m.user?.email === u.email)).map(u => (
                        <option key={u.id} value={u.email}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full md:w-auto">
                    <label className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-bold mb-2 block">Role</label>
                    <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="w-full md:w-auto min-w-[120px] h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-sm px-3 text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-500 shadow-none cursor-pointer transition-all">
                      <option value="DEVELOPER">Developer</option>
                      <option value="TESTER">Tester</option>
                    </select>
                  </div>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 h-10 px-8 rounded-lg text-white font-semibold shadow-sm w-full md:w-auto transition-all border-none">Send Invite</Button>
                </form>
              </div>
            )}

            <div className="bg-white dark:bg-[#151923] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm min-h-[400px]">
              {filteredBugs.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-16 text-center h-full">
                   <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4">
                     <BugIcon className="w-8 h-8 text-indigo-500" />
                   </div>
                   <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">No bugs found</h3>
                   <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">No issues match your current filters. Try adjusting your search or report a new bug.</p>
                 </div>
              ) : (
                viewMode === 'table' ? (
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/80 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                        <TableRow className="border-zinc-200 dark:border-zinc-800/80 hover:bg-transparent">
                          <TableHead className="text-zinc-500 dark:text-zinc-400 font-semibold h-10">Title</TableHead>
                          <TableHead className="text-zinc-500 dark:text-zinc-400 font-semibold h-10">Status</TableHead>
                          <TableHead className="text-zinc-500 dark:text-zinc-400 font-semibold h-10">Severity</TableHead>
                          <TableHead className="text-zinc-500 dark:text-zinc-400 font-semibold h-10">Assignee</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBugs.map((bug: any) => (
                          <TableRow key={bug.id} className="border-zinc-200 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group" onClick={() => router.push(`/bug/${bug.id}`)}>
                            <TableCell className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 py-3">{bug.title}</TableCell>
                            <TableCell className="py-3"><Badge className={`${statusColors[bug.status] || "bg-zinc-500"} border-none shadow-sm`}>{bug.status.replace("_", " ")}</Badge></TableCell>
                            <TableCell className="py-3"><Badge className={`${severityColors[bug.severity] || "bg-zinc-500"} border-none shadow-sm`}>{bug.severity}</Badge></TableCell>
                            <TableCell className="text-zinc-600 dark:text-zinc-400 py-3 text-sm">{bug.assignee?.name || <span className="italic text-zinc-400 dark:text-zinc-600">Unassigned</span>}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <KanbanBoard bugs={filteredBugs} onStatusChange={handleStatusChange} myRole={myRole} myUserId={myUserId} />
                )
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-[#151923] border border-zinc-200 dark:border-zinc-800/80 shadow-sm rounded-2xl sticky top-8">
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/50">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Team Roster</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Project members and roles.</p>
              </div>
              <div className="p-4 space-y-2">
                {members.map(m => (
                  <div key={m.userId} className="group flex flex-col gap-1 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-all border border-transparent dark:border-zinc-800/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xs">{m.user?.name?.charAt(0)?.toUpperCase() || "U"}</div>
                         <div>
                           <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{m.user?.name || "Unknown User"}</p>
                           <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate max-w-[100px]" title={m.user?.email}>{m.user?.email}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-none text-[9px] uppercase font-bold tracking-wider px-2 py-0.5">{m.role}</Badge>
                        {myRole === 'MANAGER' && m.userId !== myUserId && (
                          <button 
                            onClick={() => handleRemoveMember(m.userId)}
                            className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

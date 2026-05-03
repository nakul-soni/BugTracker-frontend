"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building, ArrowRight, Plus, FolderHeart, Users, Trash2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export default function OrganizationsPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [newOrgName, setNewOrgName] = useState("");

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      const [orgsRes, meRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/organizations`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const orgsData = await orgsRes.json();
      const meData = await meRes.json();
      
      setOrgs(Array.isArray(orgsData) ? orgsData : []);
      if (meData?.userId) setUserId(meData.userId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/organizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newOrgName })
      });
      if (res.ok) {
        toast.success("Organization created successfully!");
        setNewOrgName("");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(`Failed to create organization: ${err.message}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while creating the organization.");
    }
  };

  const handleDeleteOrg = async (id: string) => {
    if (!confirm("Are you sure you want to delete this organization? All projects and bugs within it will be permanently lost.")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/organizations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Organization deleted successfully!");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(`Failed to delete: ${err.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;

  const myOrgs = orgs.filter(o => o.ownerId === userId);
  const invitedOrgs = orgs.filter(o => o.ownerId !== userId);

  return (
    <div className="space-y-8">
        <header className="flex items-center justify-between pb-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
              Organizations
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage your workspaces and collaborate with your team.</p>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 shadow-xl h-full flex flex-col backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800/50">
                <CardTitle className="text-xl text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-500" /> My Organizations
                </CardTitle>
                <CardDescription className="text-zinc-500 dark:text-zinc-400">Workspaces you own and manage.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <div className="flex-1 p-6">
                  {myOrgs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800/50 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/30">
                      <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800/80 rounded-full flex items-center justify-center mb-3">
                        <FolderHeart className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-300 text-sm font-medium">No organizations found.</p>
                      <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1">Create one below to get started.</p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {myOrgs.map(org => (
                        <li key={org.id} className="group bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-zinc-800/50 shadow-sm hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer overflow-hidden">
                          <Link href={`/org/${org.id}`} className="flex items-center justify-between p-4 text-zinc-900 dark:text-zinc-100 font-medium">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-500/20 dark:to-purple-500/20 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-lg shadow-inner ring-1 ring-white/50 dark:ring-white/10">{org.name.charAt(0)?.toUpperCase()}</div>
                              <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{org.name}</span>
                            </div>
                             <div className="flex items-center gap-2">
                               <button 
                                 onClick={(e) => { e.preventDefault(); handleDeleteOrg(org.id); }}
                                 className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                               <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1" />
                             </div>
                           </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <form onSubmit={handleCreateOrg} className="p-6 bg-zinc-50/80 dark:bg-zinc-900/30 border-t border-zinc-200 dark:border-zinc-800/50 mt-auto">
                  <div className="space-y-4">
                    <Label className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-bold flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Create New Organization
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input required value={newOrgName} onChange={e => setNewOrgName(e.target.value)} className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 h-11 shadow-sm transition-all focus-visible:ring-indigo-500 flex-1" placeholder="e.g. Acme Corp" />
                      <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-6 shadow-md shadow-indigo-500/20 font-semibold w-full sm:w-auto shrink-0">Create</Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 shadow-xl h-full flex flex-col backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800/50">
                <CardTitle className="text-xl text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-500" /> Invited Organizations
                </CardTitle>
                <CardDescription className="text-zinc-500 dark:text-zinc-400">Workspaces you've been invited to.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-6">
                {invitedOrgs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800/50 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/30">
                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800/80 rounded-full flex items-center justify-center mb-3">
                      <Users className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300 text-sm font-medium">No invitations yet.</p>
                    <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1">When someone invites you to their org, it will appear here.</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {invitedOrgs.map(org => (
                      <li key={org.id} className="group bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-zinc-800/50 shadow-sm hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer overflow-hidden">
                        <Link href={`/org/${org.id}`} className="flex items-center justify-between p-4 text-zinc-900 dark:text-zinc-100 font-medium">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 font-bold text-lg shadow-inner">{org.name.charAt(0)?.toUpperCase()}</div>
                            <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{org.name}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}

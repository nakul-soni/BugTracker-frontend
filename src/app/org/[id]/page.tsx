"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Folder, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

export default function OrganizationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [org, setOrg] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [newProjectName, setNewProjectName] = useState("");

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      const [orgRes, projRes, meRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/organizations/${resolvedParams.id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/projects?orgId=${resolvedParams.id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const orgData = await orgRes.json();
      const projData = await projRes.json();
      const meData = await meRes.json();

      setOrg(orgData);
      setProjects(Array.isArray(projData) ? projData : []);
      if (meData?.userId) setUserId(meData.userId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [resolvedParams.id]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newProjectName, organizationId: resolvedParams.id })
      });
      if (res.ok) {
        toast.success("Project created successfully!");
        setNewProjectName("");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(`Failed to create project: ${err.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project? All bugs and data will be permanently lost.")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Project deleted successfully!");
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
  if (!org) return <div className="flex items-center justify-center h-full text-zinc-500">Organization not found.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        <header className="flex flex-col gap-2 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-2xl shadow-inner border border-indigo-100 dark:border-indigo-500/20">{org.name.charAt(0)}</div>
             <div>
               <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">{org.name}</h1>
               <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Organization Workspace</p>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(proj => (
            <Link key={proj.id} href={`/project/${proj.id}`}>
              <Card className="bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full backdrop-blur-sm group relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl text-zinc-900 dark:text-zinc-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{proj.name}</CardTitle>
                    {proj.members?.find((m: any) => m.userId === userId)?.role === 'MANAGER' && (
                      <button 
                        onClick={(e) => { e.preventDefault(); handleDeleteProject(proj.id); }}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <CardDescription className="text-zinc-500 dark:text-zinc-400 flex items-center justify-between mt-4">
                    <span className="text-sm">Manage projects & bugs</span>
                    <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-none shadow-sm">{proj.members?.[0]?.role || 'MEMBER'}</Badge>
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
        
        {projects.length === 0 && (
           <div className="p-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/20">
             <Folder className="w-12 h-12 mb-4 text-zinc-300 dark:text-zinc-700" />
             <p className="font-medium text-lg text-zinc-600 dark:text-zinc-300">No projects found</p>
             <p className="text-sm mt-1">Create one to get started.</p>
           </div>
        )}

        {org.ownerId === userId && (
          <Card className="bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 shadow-xl mt-12 max-w-2xl backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-zinc-900 dark:text-zinc-100">Create New Project</CardTitle>
              <CardDescription className="text-zinc-500 dark:text-zinc-400">Since you own this organization, you can create new projects.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <Label className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold">New Project Name</Label>
                  <div className="flex gap-4 mt-2">
                    <Input required value={newProjectName} onChange={e => setNewProjectName(e.target.value)} className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 h-11 shadow-sm flex-1 focus-visible:ring-indigo-500" placeholder="e.g. iOS App MVP" />
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-8 shadow-md shadow-indigo-500/20">Create</Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
    </div>
  );
}

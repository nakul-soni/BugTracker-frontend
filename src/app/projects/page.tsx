"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, Building, ArrowRight, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/lib/api";

export default function ProjectsListPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOrg, setFilterOrg] = useState("ALL");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${API_BASE_URL}/api/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => {
        setProjects(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;

  const uniqueOrgs = Array.from(new Set(projects.map(p => p.organization?.name).filter(Boolean)));

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOrg = filterOrg === "ALL" || p.organization?.name === filterOrg;
    return matchesSearch && matchesOrg;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        <header className="flex items-center justify-between pb-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
              All Projects
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">View and manage all projects you have access to.</p>
          </div>
        </header>

        <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm backdrop-blur-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input 
              placeholder="Search projects by name..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus-visible:ring-indigo-500 h-10 shadow-sm" 
            />
          </div>
          <div className="flex gap-4">
            <select value={filterOrg} onChange={e => setFilterOrg(e.target.value)} className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 shadow-sm cursor-pointer min-w-[180px]">
              <option value="ALL">All Organizations</option>
              {uniqueOrgs.map(orgName => (
                <option key={orgName as string} value={orgName as string}>{orgName as string}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-16 text-center animate-in zoom-in duration-300">
             <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 border border-zinc-200 dark:border-zinc-700">
               <Folder className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
             </div>
             <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No projects found</h3>
             <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">No projects match your current filters.</p>
           </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project: any) => {
              const myRole = project.members?.[0]?.role || "MEMBER";
              return (
              <Card key={project.id} className="bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 shadow-xl backdrop-blur-sm hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer group" onClick={() => router.push(`/project/${project.id}`)}>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
                      <Folder className="w-5 h-5" />
                    </div>
                    <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-none text-[10px] uppercase font-bold shadow-sm tracking-wider px-2 py-0.5">{myRole}</Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{project.name}</CardTitle>
                  <CardDescription className="text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 min-h-[40px]">
                    {project.description || "No description provided."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                    <Building className="w-4 h-4" />
                    <span className="truncate">Org: <span className="font-medium text-zinc-700 dark:text-zinc-300">{project.organization?.name || "Unknown"}</span></span>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/30 rounded-b-xl">
                  <span className="text-xs text-zinc-400">Created {new Date(project.createdAt).toLocaleDateString()}</span>
                  <Button variant="ghost" size="sm" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-2 -mr-2">
                    View Board <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
              );
            })}
          </div>
        )}
    </div>
  );
}

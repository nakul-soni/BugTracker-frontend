"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { LogOut, Moon, Sun, Bug, Folder, Building, Menu, X, LayoutDashboard, AlertCircle, Activity, CheckCircle2, Settings2, SlidersHorizontal, Search, Bell } from "lucide-react";
import { Button } from "./ui/button";
import { API_BASE_URL } from "@/lib/api";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
    
    if (isAuthRoute) {
      setAuthLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push('/login');
      return;
    }

    if (!user) {
      fetch(`${API_BASE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => { 
          if (data.email) {
            setUser(data);
            setAuthLoading(false);
          } else {
            localStorage.removeItem("token");
            router.push('/login'); 
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          router.push('/login');
        });
    } else {
      setAuthLoading(false);
    }
  }, [pathname, router, user]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  if (!mounted || (authLoading && !pathname.startsWith('/login') && !pathname.startsWith('/register'))) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#fafafa] dark:bg-[#0b0e14]">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 grid place-items-center shadow-lg shadow-indigo-500/20 animate-pulse">
          <Bug className="h-6 w-6 text-white" />
        </div>
      </div>
    );
  }

  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const NavItem = ({ href, icon: Icon, label, badge, activePath }: { href: string, icon: any, label: string, badge?: number, activePath?: string }) => {
    const isActive = pathname === href || (activePath && pathname.startsWith(activePath));
    return (
      <Link href={href} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700 dark:bg-[#1a2133] dark:text-zinc-100 font-medium shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 hover:text-zinc-900 dark:hover:text-zinc-200'}`}>
        <div className="flex items-center">
          <Icon className={`h-4 w-4 mr-3 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'opacity-70'}`} /> 
          {label}
        </div>
        {badge !== undefined && badge > 0 && (
          <span className="bg-rose-500/10 text-rose-500 dark:bg-rose-500/20 dark:text-rose-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
            {badge}
          </span>
        )}
      </Link>
    );
  };

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 tracking-wider uppercase px-3 mt-6 mb-2">
      {children}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#fafafa] dark:bg-[#0b0e14] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 border-r border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-[#0b0e14] flex flex-col transition-transform duration-300 shadow-xl md:shadow-none`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 grid place-items-center shadow-lg shadow-indigo-500/20">
              <Bug className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight leading-tight">BugTracker</span>
              <span className="text-[10px] text-zinc-500 font-medium">SaaS Platform</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden -mr-2 text-zinc-500" onClick={() => setIsMobileOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <SectionTitle>Workspace</SectionTitle>
          <div className="space-y-0.5">
            <NavItem href="/" icon={LayoutDashboard} label="Dashboard" />
            <NavItem href="/organizations" activePath="/org" icon={Building} label="Organizations" />
            <NavItem href="/projects" activePath="/project" icon={Folder} label="All Projects" />
          </div>

          <SectionTitle>Issues</SectionTitle>
          <div className="space-y-0.5">
            <NavItem href="/bugs?status=OPEN" icon={AlertCircle} label="Open Bugs" badge={0} />
            <NavItem href="/bugs?status=IN_PROGRESS" icon={Activity} label="In Progress" />
            <NavItem href="/bugs?status=RESOLVED" icon={CheckCircle2} label="Resolved" />
          </div>

          <SectionTitle>Settings</SectionTitle>
          <div className="space-y-0.5">
            <NavItem href="/settings/integrations" icon={Settings2} label="Integrations" />
            <NavItem href="/settings/preferences" icon={SlidersHorizontal} label="Preferences" />
          </div>
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 truncate pr-2">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-600 flex items-center justify-center text-indigo-700 dark:text-white font-bold text-xs">
                  {user?.name?.[0] || user?.email?.[0] || "?"}
                </div>
              )}
              <div className="flex flex-col truncate">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate leading-tight">{user?.name || "User"}</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-500 truncate">{user?.email || "Loading..."}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-md transition-colors flex-shrink-0">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#fafafa] dark:bg-[#0b0e14]">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-zinc-200 dark:border-zinc-800/50 bg-white/80 dark:bg-[#0b0e14]/80 backdrop-blur z-10">
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setIsMobileOpen(true)}>
              <Menu className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
            </Button>
            <div className="hidden md:flex items-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
              <span className="hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer transition-colors">Workspace</span>
              <span className="mx-2 opacity-50">›</span>
              <span className="text-zinc-900 dark:text-zinc-100">Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex relative group">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search" 
                className="h-8 w-48 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-md pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500"
              />
            </div>
            
            <button className="relative p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-md border border-zinc-200 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/50 transition-colors">
              <Bell className="w-4 h-4" />
            </button>

            {mounted && (
              <button onClick={toggleTheme} className="relative p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-md border border-zinc-200 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/50 transition-colors">
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-[1200px] mx-auto w-full h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

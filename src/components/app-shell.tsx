"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { LogOut, Moon, Sun, Bug, Folder, Building, Menu, X, LayoutDashboard } from "lucide-react";
import { Button } from "./ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    if (token && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
      fetch("http://localhost:3001/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => { if (data.email) setUser(data); else router.push('/login'); })
        .catch(() => router.push('/login'));
    }
  }, [pathname, router]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const toggleTheme = (e: React.MouseEvent) => {
    const isDark = theme === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';

    // @ts-ignore - View Transitions API is not yet in TypeScript types
    if (!document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // @ts-ignore
    const transition = document.startViewTransition(() => {
      setTheme(nextTheme);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 500,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-[#09090b]">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 border-r border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-[#09090b]/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 flex flex-col transition-transform duration-300 shadow-xl md:shadow-sm`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800/50">
          <div className="flex items-center">
            <Bug className="h-6 w-6 text-indigo-600 dark:text-indigo-500 mr-2" />
            <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-100">BugTracker</span>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden -mr-2 text-zinc-500" onClick={() => setIsMobileOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <Link href="/" className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${pathname === '/' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>
            <LayoutDashboard className="h-4 w-4 mr-3" /> Dashboard
          </Link>
          <Link href="/organizations" className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${pathname.startsWith('/org') ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>
            <Building className="h-4 w-4 mr-3" /> Organizations
          </Link>
          <Link href="/projects" className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${pathname.startsWith('/project') ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>
            <Folder className="h-4 w-4 mr-3" /> All Projects
          </Link>
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 truncate pr-2">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                  {user?.name?.[0] || user?.email?.[0] || "?"}
                </div>
              )}
              <div className="flex flex-col truncate">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{user?.name || "User"}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user?.email || "Loading..."}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 text-zinc-500 hover:text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex-shrink-0">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between md:justify-end px-4 md:px-8 border-b border-zinc-200 dark:border-zinc-800/50 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur z-10 shadow-sm">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileOpen(true)}>
            <Menu className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
          </Button>

          <div className="flex items-center gap-4">
            {mounted && (
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-7xl mx-auto w-full h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

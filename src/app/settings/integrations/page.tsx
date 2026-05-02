"use client";

import { Settings2 } from "lucide-react";

export default function IntegrationsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col gap-1 mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
          <Settings2 className="w-8 h-8 text-indigo-500" />
          Integrations
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Connect BugTracker with your favorite tools and services.</p>
      </header>

      <div className="bg-white dark:bg-[#151923] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-12 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center mb-4">
          <Settings2 className="w-8 h-8 text-zinc-400" />
        </div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Integrations Coming Soon</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
          We are currently working on integrations with GitHub, Slack, Jira, and more. Stay tuned for updates!
        </p>
      </div>
    </div>
  );
}

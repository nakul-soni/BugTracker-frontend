"use client";

import { SlidersHorizontal, Moon, Sun, Laptop, Bell, Mail, Smartphone } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function PreferencesPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Mock states for toggles
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="flex items-center justify-center h-full text-zinc-500">Loading preferences...</div>;
  }

  const ThemeOption = ({ value, icon: Icon, label }: { value: string, icon: any, label: string }) => {
    const isActive = theme === value;
    return (
      <button
        onClick={() => setTheme(value)}
        className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
          isActive 
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10' 
            : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-zinc-900/50'
        }`}
      >
        <div className={`p-3 rounded-full ${isActive ? 'bg-indigo-500 text-white shadow-md' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-sm font-semibold ${isActive ? 'text-indigo-700 dark:text-indigo-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
          {label}
        </span>
      </button>
    );
  };

  const ToggleRow = ({ icon: Icon, title, desc, state, setter }: any) => (
    <div className="flex items-center justify-between py-4 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 grid place-items-center text-zinc-500">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{desc}</p>
        </div>
      </div>
      <button 
        onClick={() => setter(!state)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-[#0b0e14] ${state ? 'bg-indigo-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${state ? 'translate-x-6 shadow-sm' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col gap-1 mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10">
            <SlidersHorizontal className="w-8 h-8 text-indigo-500" />
          </div>
          Preferences
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Customize your workspace appearance and notification settings.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Appearance Section */}
        <div className="bg-white dark:bg-[#151923] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Appearance</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Select your preferred theme for the dashboard.</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <ThemeOption value="light" icon={Sun} label="Light" />
            <ThemeOption value="dark" icon={Moon} label="Dark" />
            <ThemeOption value="system" icon={Laptop} label="System" />
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white dark:bg-[#151923] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Notifications</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Control how you receive alerts and updates.</p>
          </div>

          <div className="flex flex-col">
            <ToggleRow 
              icon={Mail} 
              title="Email Notifications" 
              desc="Receive emails when you are assigned to a bug." 
              state={emailNotifs} 
              setter={setEmailNotifs} 
            />
            <ToggleRow 
              icon={Bell} 
              title="Push Notifications" 
              desc="Get browser push notifications for urgent alerts." 
              state={pushNotifs} 
              setter={setPushNotifs} 
            />
            <ToggleRow 
              icon={Smartphone} 
              title="Weekly Digest" 
              desc="Receive a weekly summary of your project's health." 
              state={weeklyDigest} 
              setter={setWeeklyDigest} 
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-lg shadow-sm">
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

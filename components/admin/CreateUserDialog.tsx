"use client"

import { useState } from "react";
import { adminCreateUser } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconUserPlus, IconX, IconLoader2, IconCirclePlus } from "@tabler/icons-react";

export default function CreateUserDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await adminCreateUser(formData);
      if (result.success) {
        setIsOpen(false);
        // We could use a toast here if available, but staying simple for now
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="group relative flex items-center gap-2 bg-primary-500 hover:bg-primary-500/90 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all duration-300 shadow-xl shadow-primary-500/20 active:scale-95"
      >
        <IconUserPlus size={18} className="group-hover:rotate-12 transition-transform" />
        <span>Add New Account</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          {/* Main Dialog Box */}
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800/50 rounded-[2rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            {/* Design Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500/20 via-primary-500 to-primary-500/20" />
            
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all active:scale-90"
            >
              <IconX size={18} />
            </button>

            <div className="p-8 sm:p-10">
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-500 mb-4">
                   <IconCirclePlus size={28} />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">Onboard Member</h3>
                <p className="text-zinc-500 text-sm mt-1">Create a new user account with administrative or standard privileges.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/5 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold leading-relaxed animate-in shake-in">
                  ❌ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="grid gap-2">
                    <Label htmlFor="admin-name" className="text-zinc-500 text-[10px] uppercase font-black tracking-widest pl-1">Full Name</Label>
                    <Input id="admin-name" name="name" placeholder="John Wick" required className="h-11 bg-zinc-900/50 border-zinc-800 focus:border-primary-500/50 focus:ring-primary-500/10 rounded-xl transition-all" />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="admin-username" className="text-zinc-500 text-[10px] uppercase font-black tracking-widest pl-1">Username</Label>
                    <Input id="admin-username" name="username" placeholder="johnny" required className="h-11 bg-zinc-900/50 border-zinc-800 focus:border-primary-500/50 focus:ring-primary-500/10 rounded-xl transition-all" />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="admin-email" className="text-zinc-500 text-[10px] uppercase font-black tracking-widest pl-1">Email Address</Label>
                  <Input id="admin-email" name="email" type="email" placeholder="john@example.com" required className="h-11 bg-zinc-900/50 border-zinc-800 focus:border-primary-500/50 focus:ring-primary-500/10 rounded-xl transition-all" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="admin-password" title="password" className="text-zinc-500 text-[10px] uppercase font-black tracking-widest pl-1">Temporary Password</Label>
                  <Input id="admin-password" name="password" type="password" placeholder="••••••••" required className="h-11 bg-zinc-900/50 border-zinc-800 focus:border-primary-500/50 focus:ring-primary-500/10 rounded-xl transition-all" />
                </div>

                <div className="grid gap-2 pb-2">
                  <Label htmlFor="admin-role" className="text-zinc-500 text-[10px] uppercase font-black tracking-widest pl-1">System Privilege</Label>
                  <select 
                    id="admin-role" 
                    name="role" 
                    className="w-full h-11 px-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all appearance-none cursor-pointer hover:bg-zinc-900"
                  >
                    <option value="user">Standard User</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary-500 hover:bg-primary-500/90 text-white h-12 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-xl shadow-primary-500/20"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <IconLoader2 className="animate-spin" size={18} />
                      <span>Syncing...</span>
                    </div>
                  ) : (
                    "Authorize & Create"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

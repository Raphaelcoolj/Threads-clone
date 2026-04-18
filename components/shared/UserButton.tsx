"use client"

import { signOut } from "next-auth/react";
import { 
  IconUser, 
  IconSettings, 
  IconLogout, 
  IconShield, 
  IconActivity,
  IconFingerprint,
  IconMail
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function UserButton({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger: The Profile Picture */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative group focus:outline-none"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
        <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-zinc-900 overflow-hidden bg-zinc-800">
           <Image 
             src={user.image || "/assets/profile.svg"} 
             alt="Profile" 
             fill
             className="object-cover"
           />
        </div>
      </button>

      {/* Premium Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop to close */}
          <div 
            className="fixed inset-0 z-40 bg-black/5" 
            onClick={() => setIsOpen(false)} 
          />
          
          <div className="absolute right-0 mt-3 w-64 bg-zinc-950 border border-zinc-800/50 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
             
             {/* Header: User Overview */}
             <div className="p-4 border-b border-zinc-900 mb-2">
                <p className="text-sm font-black text-white truncate">{user.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <p className="text-[10px] text-zinc-500 truncate lowercase">{user.email}</p>
                   {user.role === 'admin' && (
                     <span className="px-1.5 py-0.5 rounded bg-primary-500/10 text-primary-500 text-[8px] font-black uppercase tracking-tighter border border-primary-500/20">
                        Admin
                     </span>
                   )}
                </div>
             </div>

             {/* Menu Items */}
             <div className="space-y-1">
                <Link 
                  href="/profile" 
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all"
                >
                   <IconUser size={16} stroke={1.5} />
                   <span>My Profile</span>
                </Link>

                <Link 
                  href="/profile/edit" 
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all"
                >
                   <IconSettings size={16} stroke={1.5} />
                   <span>Manage Account</span>
                </Link>

                {/* Additional simulated sections to match the desired "Clerk-like" depth */}
                <div className="px-3 py-1 text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-2 underline decoration-zinc-800 underline-offset-4">
                  Security
                </div>
                
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-zinc-600 cursor-not-allowed rounded-xl group/item">
                   <IconFingerprint size={16} stroke={1.5} />
                   <span>Active Devices</span>
                   <span className="ml-auto text-[8px] bg-zinc-800 px-1 rounded">Soon</span>
                </button>

                {user.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-primary-400 hover:text-primary-300 hover:bg-primary-500/5 rounded-xl transition-all"
                  >
                     <IconShield size={16} stroke={1.5} />
                     <span>Admin Console</span>
                  </Link>
                )}

                <div className="pt-2 mt-2 border-t border-zinc-900">
                    <button 
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-bold"
                    >
                       <IconLogout size={16} stroke={1.5} />
                       <span>Sign Out</span>
                    </button>
                </div>
             </div>

             {/* Footer Info */}
             <div className="p-3 text-center">
                <p className="text-[9px] text-zinc-700 font-medium">Session ID: {user.id?.slice(0, 10)}...</p>
             </div>
          </div>
        </>
      )}
    </div>
  );
}

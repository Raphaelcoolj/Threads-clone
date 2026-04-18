"use client"

import { useState } from "react";
import Image from "next/image";
import { IconSelector, IconPlus, IconUserCircle } from "@tabler/icons-react";
import { useSession } from "next-auth/react";

const OrganizationSwitcher = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  // These will be replaced with real data from your Community models later
  const currentOrganization = null; 

  return (
    <div className="relative">
      {/* 
        The Trigger: Optimized for responsiveness.
        - py-2 px-4 as requested.
        - Text hidden on small screens to show only image and dropdown.
      */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-2 rounded-lg bg-dark-3 py-2 px-3 sm:px-4 hover:bg-dark-4 transition-all border border-dark-4/50"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden bg-primary-500/10 flex items-center justify-center">
             <Image
               src={currentOrganization ? "/assets/community.svg" : (session?.user?.image || "/assets/user.svg")}
               alt="org_logo"
               fill
               className="object-cover"
             />
          </div>
          <p className="text-light-1 text-small-semibold hidden sm:block">
            {currentOrganization ? "Organization Name" : "Personal Account"}
          </p>
        </div>
        
        <IconSelector size={16} className="text-zinc-500" />
      </button>

      {/* Dropdown Menu & Backdrop */}
      {isOpen && (
        <>
          {/* Backdrop: Darker on mobile for focus, transparent on desktop */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 md:bg-transparent backdrop-blur-[2px] md:backdrop-blur-none" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* 
            Responsive Container:
            - Mobile: Centered at the top, wider.
            - Desktop: Absolute right-aligned to the trigger.
          */}
          <div className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 top-20 md:top-full mt-2 md:w-[280px] bg-dark-2 border border-dark-4 rounded-2xl md:rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-3 py-3 border-b border-dark-4/50 mb-2">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                Account Switcher
                </p>
            </div>

            <div className="space-y-1">
                {/* Personal Account Option */}
                <div className="flex items-center justify-between p-3 md:p-2 rounded-xl hover:bg-dark-3 cursor-pointer transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 md:w-8 md:h-8 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center text-primary-500">
                        {session?.user?.image ? (
                          <Image 
                            src={session.user.image} 
                            alt="user_avatar" 
                            width={32} 
                            height={32} 
                            className="object-cover"
                          />
                        ) : (
                          <IconUserCircle size={20} />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-light-1 text-small-semibold">Personal Account</span>
                        <span className="text-zinc-500 text-[10px]">Active Session</span>
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(135,126,255,0.8)]" />
                </div>

                <div className="h-[1px] bg-dark-4 my-2 mx-2" />

                <div className="px-3 py-1 mb-1">
                    <p className="text-zinc-600 text-[9px] font-black uppercase tracking-tight">Your Communities</p>
                </div>

                {/* Create Organization Button */}
                <button 
                  className="w-full flex items-center gap-3 p-3 md:p-2 rounded-xl hover:bg-primary-500/10 text-zinc-400 hover:text-primary-500 transition-all text-left"
                  onClick={() => {
                    console.log("Create Community logic goes here");
                    setIsOpen(false);
                  }}
                >
                  <div className="w-9 h-9 md:w-8 md:h-8 rounded-lg border border-dashed border-dark-4 flex items-center justify-center">
                    <IconPlus size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-small-medium">Create Community</span>
                    <span className="text-[10px] text-zinc-600">Start a new group</span>
                  </div>
                </button>
            </div>
            
            {/* Logic for mapping through communities will be added here */}
            <div className="mt-4 p-3 bg-dark-3/30 rounded-xl md:hidden text-center">
                <p className="text-[10px] text-zinc-500 italic">Tip: You can switch between your personal profile and communities here.</p>
            </div>
~          </div>
        </>
      )}
    </div>
  );
};

export default OrganizationSwitcher;

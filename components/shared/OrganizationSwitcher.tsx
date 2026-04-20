"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { IconSelector, IconPlus, IconUserCircle } from "@tabler/icons-react";
import { Session } from "next-auth";
import Link from "next/link";
import { fetchUser } from "@/lib/actions/user";
import { useOrganization } from "@/context/OrganizationContext";

interface Props {
  session: Session | null;
}

const OrganizationSwitcher = ({ session }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { activeCommunity, setActiveCommunity } = useOrganization();
  const [communities, setCommunities] = useState<any[]>([]);

  useEffect(() => {
    if (session?.user?.id) {
       fetchUser(session.user.id).then((userData) => {
         if (userData?.communities) {
            setCommunities(userData.communities);
         }
       });
    }
  }, [session?.user?.id]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-2 rounded-lg bg-dark-3 py-2 px-3 sm:px-4 hover:bg-dark-4 transition-all border border-dark-4/50"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden bg-primary-500/10 flex items-center justify-center">
             <Image
               src={activeCommunity ? (activeCommunity.image || "/assets/community.svg") : (session?.user?.image || "/assets/user.svg")}
               alt="org_logo"
               fill
               className="object-cover"
             />
          </div>
          <p className="text-light-1 text-small-semibold hidden sm:block">
            {activeCommunity ? activeCommunity.name : "Personal Account"}
          </p>
        </div>
        
        <IconSelector size={16} className="text-zinc-500" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/20 md:bg-transparent backdrop-blur-[2px] md:backdrop-blur-none" 
            onClick={() => setIsOpen(false)} 
          />
          
          <div className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 top-20 md:top-full mt-2 md:w-[280px] bg-dark-2 border border-dark-4 rounded-2xl md:rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-3 py-3 border-b border-dark-4/50 mb-2">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                Account Switcher
                </p>
            </div>

            <div className="space-y-1">
                <div 
                    onClick={() => { setActiveCommunity(null); setIsOpen(false); }}
                    className="flex items-center justify-between p-3 md:p-2 rounded-xl hover:bg-dark-3 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 md:w-8 md:h-8 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center text-primary-500">
                        {session?.user?.image ? (
                          <Image 
                            src={session.user.image} 
                            alt={session.user.name || "User Avatar"} 
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
                    </div>
                  </div>
                  {!activeCommunity && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                </div>

                <div className="h-[1px] bg-dark-4 my-2 mx-2" />

                <div className="px-3 py-1 mb-1">
                    <p className="text-zinc-600 text-[9px] font-black uppercase tracking-tight">Your Communities</p>
                </div>

                {communities.map((community) => (
                    <div 
                        key={community._id} 
                        onClick={() => { setActiveCommunity(community); setIsOpen(false); }}
                        className="flex items-center justify-between p-3 md:p-2 rounded-xl hover:bg-dark-3 cursor-pointer transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 md:w-8 md:h-8 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
                                <Image 
                                    src={(community.image && community.image.trim() !== "") ? community.image : "/assets/community.svg"} 
                                    alt={community.name || "Community logo"} 
                                    width={32} 
                                    height={32} 
                                    className="object-cover" 
                                />
                            </div>
                            <span className="text-light-1 text-small-semibold">{community.name}</span>
                        </div>
                        {activeCommunity?._id === community._id && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                    </div>
                ))}

                <Link href={`/create-community`}>
                <button 
                  className="w-full flex items-center gap-3 p-3 md:p-2 rounded-xl hover:bg-primary-500/10 text-zinc-400 hover:text-primary-500 transition-all text-left"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="w-9 h-9 md:w-8 md:h-8 rounded-lg border border-dashed border-dark-4 flex items-center justify-center">
                    <IconPlus size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-small-medium">Create Community</span>
                  </div>
                </button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrganizationSwitcher;

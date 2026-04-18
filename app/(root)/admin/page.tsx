import { getSession } from "@/lib/getSessions";
import { redirect } from "next/navigation";
import { fetchAllUsers } from "@/lib/actions/admin";
import AdminUserTable from "@/components/admin/UserTable";
import CreateUserDialog from "@/components/admin/CreateUserDialog";
import { IconUsers, IconShieldLock, IconDatabase } from "@tabler/icons-react";

export default async function AdminPage() {
  const data = await getSession();

  // 🛡️ SECURITY BOUNCER
  if (!data?.session || data?.user?.role !== "admin") {
     redirect("/");
  }

  const allUsers = await fetchAllUsers();
  const adminCount = allUsers.filter((u: any) => u.role === "admin").length;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 text-white min-h-screen animate-in fade-in duration-700">
      {/* Premium Header */}
      <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-zinc-800/50 pb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-[10px] font-bold uppercase tracking-widest mb-2">
             <IconShieldLock size={12} />
             Administrator Restricted Area
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-white via-white to-zinc-600 bg-clip-text text-transparent">
            Management Console
          </h1>
          <p className="text-zinc-400 max-w-lg text-sm sm:text-base">
            Oversee your Threads ecosystem, manage user privileges, and monitor system-wide statistics in real-time.
          </p>
        </div>
        
        <CreateUserDialog />
      </header>

      {/* Glassmorphism Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="relative group p-6 rounded-2xl bg-dark-2 border border-zinc-800 transition-all duration-300 hover:border-primary-500/30 shadow-xl">
           <div className="absolute top-0 right-0 p-4 text-zinc-900 group-hover:text-primary-500/10 transition-colors">
              <IconUsers size={64} />
           </div>
           <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Users</p>
           <h3 className="text-4xl font-black text-white">{allUsers.length}</h3>
           <div className="mt-4 flex items-center gap-2 text-[10px] text-green-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Users are active
           </div>
        </div>

        <div className="relative group p-6 rounded-2xl bg-dark-2 border border-zinc-800 transition-all duration-300 hover:border-primary-500/30 shadow-xl">
           <div className="absolute top-0 right-0 p-4 text-zinc-900 group-hover:text-primary-500/10 transition-colors">
              <IconShieldLock size={64} />
           </div>
           <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Admins</p>
           <h3 className="text-4xl font-black text-white">{adminCount}</h3>
           <div className="mt-4 text-[10px] text-zinc-500 font-medium">
              Privileged access accounts
           </div>
        </div>

        <div className="sm:col-span-2 lg:col-span-1 relative group p-6 rounded-2xl bg-dark-2 border border-zinc-800 transition-all duration-300 hover:border-primary-500/30 shadow-xl">
           <div className="absolute top-0 right-0 p-4 text-zinc-900 group-hover:text-primary-500/10 transition-colors">
              <IconDatabase size={64} />
           </div>
           <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Cloud Engine</p>
           <h3 className="text-4xl font-black text-white">Online</h3>
           <div className="mt-4 flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
              MongoDB Atlas Healthy
           </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <section className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
        <div className="flex items-center justify-between px-2">
           <div className="space-y-1">
              <h2 className="text-xl font-bold text-zinc-100">User Directory</h2>
              <p className="text-xs text-zinc-500">Search and manage existing users in your system.</p>
           </div>
        </div>
        
        <AdminUserTable initialUsers={allUsers} />
      </section>
      
      <footer className="mt-24 pt-8 border-t border-zinc-800/30 text-center text-zinc-600 text-[10px] uppercase tracking-[0.2em] font-medium">
         Threads Enterprise Management Cluster • Secure Session Active
      </footer>
    </div>
  );
}

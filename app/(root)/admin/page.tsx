import { getSession } from "@/lib/getSessions";
import { redirect } from "next/navigation";
import { fetchAllUsers, fetchAllThreads, fetchAllCommunities } from "@/lib/actions/admin";
import AdminUserTable from "@/components/admin/UserTable";
import CreateUserDialog from "@/components/admin/CreateUserDialog";
import { IconUsers, IconShieldLock, IconDatabase, IconMessage2, IconUsersGroup } from "@tabler/icons-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThreadTable from "@/components/admin/ThreadTable";
import CommunityTable from "@/components/admin/CommunityTable";

export default async function AdminPage() {
  const data = await getSession();

  // 🛡️ SECURITY BOUNCER
  if (!data?.session || data?.user?.role !== "admin") {
     redirect("/");
  }

  const allUsers = await fetchAllUsers();
  const allThreads = await fetchAllThreads();
  const allCommunities = await fetchAllCommunities();
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="relative group p-6 rounded-2xl bg-dark-2 border border-zinc-800 transition-all duration-300 hover:border-primary-500/30 shadow-xl">
           <div className="absolute top-0 right-0 p-4 text-zinc-900 group-hover:text-primary-500/10 transition-colors">
              <IconUsers size={64} />
           </div>
           <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Users</p>
           <h3 className="text-4xl font-black text-white">{allUsers.length}</h3>
        </div>

        <div className="relative group p-6 rounded-2xl bg-dark-2 border border-zinc-800 transition-all duration-300 hover:border-primary-500/30 shadow-xl">
           <div className="absolute top-0 right-0 p-4 text-zinc-900 group-hover:text-primary-500/10 transition-colors">
              <IconMessage2 size={64} />
           </div>
           <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Threads</p>
           <h3 className="text-4xl font-black text-white">{allThreads.length}</h3>
        </div>

        <div className="relative group p-6 rounded-2xl bg-dark-2 border border-zinc-800 transition-all duration-300 hover:border-primary-500/30 shadow-xl">
           <div className="absolute top-0 right-0 p-4 text-zinc-900 group-hover:text-primary-500/10 transition-colors">
              <IconUsersGroup size={64} />
           </div>
           <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Communities</p>
           <h3 className="text-4xl font-black text-white">{allCommunities.length}</h3>
        </div>

        <div className="relative group p-6 rounded-2xl bg-dark-2 border border-zinc-800 transition-all duration-300 hover:border-primary-500/30 shadow-xl">
           <div className="absolute top-0 right-0 p-4 text-zinc-900 group-hover:text-primary-500/10 transition-colors">
              <IconShieldLock size={64} />
           </div>
           <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Admins</p>
           <h3 className="text-4xl font-black text-white">{adminCount}</h3>
        </div>
      </div>
      
      {/* Main Content Area */}
      <section className="space-y-6">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="bg-dark-2 border border-zinc-800 p-1 mb-6">
            <TabsTrigger value="users" className="data-[state=active]:bg-zinc-800">Users</TabsTrigger>
            <TabsTrigger value="threads" className="data-[state=active]:bg-zinc-800">Threads</TabsTrigger>
            <TabsTrigger value="communities" className="data-[state=active]:bg-zinc-800">Communities</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <AdminUserTable initialUsers={allUsers} />
          </TabsContent>

          <TabsContent value="threads">
            <ThreadTable threads={allThreads} />
          </TabsContent>

          <TabsContent value="communities">
            <CommunityTable communities={allCommunities} />
          </TabsContent>
        </Tabs>
      </section>
      
      <footer className="mt-24 pt-8 border-t border-zinc-800/30 text-center text-zinc-600 text-[10px] uppercase tracking-[0.2em] font-medium">
         Threads Enterprise Management Cluster • Secure Session Active
      </footer>
    </div>
  );
}

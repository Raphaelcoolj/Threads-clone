"use client"

import { useState, useMemo } from "react";
import { updateUserRole, deleteUser } from "@/lib/actions/admin";
import { 
  IconShieldCheck, 
  IconUser, 
  IconMail, 
  IconArrowUpCircle, 
  IconArrowDownCircle, 
  IconSearch,
  IconTrash,
  IconAlertTriangle,
  IconLoader2
} from "@tabler/icons-react";

interface UserListItem {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  onboarded: boolean;
}

export default function AdminUserTable({ initialUsers }: { initialUsers: UserListItem[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingUser, setDeletingUser] = useState<{ id: string, name: string } | null>(null);

  // 🔍 Dynamic Search Logic
  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return users;
    
    return users.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }, [searchQuery, users]);

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    setLoadingId(userId);

    try {
      await updateUserRole(userId, newRole);
    } catch (error) {
      alert("Failed to update user role.");
      setUsers(users.map(u => u._id === userId ? { ...u, role: currentRole } : u));
    } finally {
      setLoadingId(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (!deletingUser) return;
    
    setLoadingId(deletingUser.id);
    try {
      await deleteUser(deletingUser.id);
      setUsers(users.filter(u => u._id !== deletingUser.id));
      setDeletingUser(null);
    } catch (error) {
      alert("Failed to delete user.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar Block */}
      <div className="relative group max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-primary-500 transition-colors">
          <IconSearch size={18} />
        </div>
        <input 
          type="text"
          placeholder="Search by name, username, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-dark-3 border border-zinc-800 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all duration-300"
        />
      </div>

      <div className="w-full overflow-hidden rounded-2xl border border-zinc-800 bg-dark-2 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-dark-3 text-zinc-500 border-b border-zinc-800 uppercase text-[10px] font-bold tracking-[0.15em]">
              <tr>
                <th className="px-6 py-5">User Detail</th>
                <th className="px-6 py-5">Permission</th>
                <th className="px-6 py-5">Onboarding</th>
                <th className="px-6 py-5 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="group hover:bg-white/[0.03] transition-all duration-300">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center font-bold text-zinc-300 border border-zinc-700/50 shadow-inner group-hover:scale-105 transition-transform duration-300">
                        {user.name[0]}
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-bold text-zinc-100 group-hover:text-white transition-colors">
                          {user.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-medium">
                          <span className="text-zinc-600">@{user.username}</span>
                          <span className="w-1 h-1 rounded-full bg-zinc-700" />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black tracking-tighter uppercase border transition-all duration-300 ${
                      user.role === 'admin' 
                        ? 'bg-primary-500/10 text-primary-400 border-primary-500/30' 
                        : 'bg-zinc-900/50 text-zinc-500 border-zinc-800'
                    }`}>
                      {user.role === 'admin' ? <IconShieldCheck size={12}/> : <IconUser size={12}/>}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-6 font-mono text-[10px]">
                     <span className={`px-2 py-0.5 rounded border ${
                       user.onboarded 
                        ? 'text-green-500 bg-green-500/5 border-green-500/10' 
                        : 'text-zinc-600 bg-zinc-900/30 border-zinc-800'
                     }`}>
                        {user.onboarded ? "COMPLETED" : "PENDING"}
                     </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex justify-end items-center gap-2">
                      {/* ROLE TOGGLE */}
                      <button 
                        onClick={() => handleRoleToggle(user._id, user.role)}
                        disabled={loadingId === user._id}
                        title={user.role === 'admin' ? "Demote to User" : "Promote to Admin"}
                        className={`p-2 rounded-lg transition-all ${
                          loadingId === user._id 
                            ? 'opacity-30' 
                            : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-primary-500'
                        }`}
                      >
                        {user.role === 'admin' ? <IconArrowDownCircle size={18}/> : <IconArrowUpCircle size={18}/>}
                      </button>

                      {/* DELETE USER */}
                      <button 
                        onClick={() => setDeletingUser({ id: user._id, name: user.name })}
                        className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all"
                        title="Delete User"
                      >
                        <IconTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🧩 DELETE CONFIRMATION MODAL */}
      {deletingUser && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-[2rem] shadow-2xl p-8 relative animate-in zoom-in-95 duration-500">
             <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-6 mx-auto">
                <IconAlertTriangle size={28} />
             </div>
             <h3 className="text-xl font-bold text-white text-center mb-2">Delete Account?</h3>
             <p className="text-zinc-500 text-sm text-center mb-8">
                Are you sure you want to permanently remove <span className="text-white font-bold">{deletingUser.name}</span> and all their data? This action cannot be undone.
             </p>
             <div className="flex gap-4">
                <button 
                  onClick={() => setDeletingUser(null)}
                  className="flex-1 py-3 rounded-xl bg-zinc-900 text-zinc-400 text-xs font-bold hover:text-white transition-all"
                >
                   Cancel
                </button>
                <button 
                  onClick={handlePermanentDelete}
                  disabled={loadingId === deletingUser.id}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                   {loadingId === deletingUser.id ? <IconLoader2 className="animate-spin mx-auto" size={18} /> : "Yes, Delete"}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

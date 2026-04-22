"use client";

import { deleteCommunityAdmin } from "@/lib/actions/admin";
import { IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface Props {
  communities: any[];
}

const CommunityTable = ({ communities }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this community? All threads within it will also be deleted.")) return;

    startTransition(async () => {
      try {
        await deleteCommunityAdmin(id);
        router.refresh();
      } catch (error: any) {
        alert(error.message);
      }
    });
  };

  return (
    <div className="bg-dark-2 rounded-xl border border-zinc-800 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-zinc-900/50 border-b border-zinc-800">
          <tr>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Name</th>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Handle</th>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Creator</th>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Members</th>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {communities.map((community: any) => (
            <tr key={community._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
              <td className="p-4 text-sm font-medium">{community.name}</td>
              <td className="p-4 text-sm text-primary-500">@{community.username}</td>
              <td className="p-4 text-sm text-zinc-400">{community.createdBy?.name || "Unknown"}</td>
              <td className="p-4 text-sm text-zinc-500">{community.members?.length || 0}</td>
              <td className="p-4">
                <button
                  onClick={() => handleDelete(community._id)}
                  disabled={isPending}
                  className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                >
                  <IconTrash size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CommunityTable;

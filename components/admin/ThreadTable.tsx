"use client";

import { deleteThreadAdmin } from "@/lib/actions/admin";
import { IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface Props {
  threads: any[];
}

const ThreadTable = ({ threads }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this thread?")) return;

    startTransition(async () => {
      try {
        await deleteThreadAdmin(id);
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
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Author</th>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Content</th>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Community</th>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Date</th>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {threads.map((thread: any) => (
            <tr key={thread._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
              <td className="p-4 text-sm font-medium">{thread.author?.name || "Unknown"}</td>
              <td className="p-4 text-sm text-zinc-400 truncate max-w-xs">{thread.text}</td>
              <td className="p-4 text-sm text-zinc-400">{thread.community?.name || "None"}</td>
              <td className="p-4 text-sm text-zinc-500">{new Date(thread.createdAt).toLocaleDateString()}</td>
              <td className="p-4">
                <button
                  onClick={() => handleDelete(thread._id)}
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

export default ThreadTable;

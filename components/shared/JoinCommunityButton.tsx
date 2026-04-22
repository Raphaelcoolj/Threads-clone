"use client";

import { useTransition } from "react";
import { requestToJoinCommunity } from "@/lib/actions/community.actions";
import { useRouter } from "next/navigation";

interface Props {
  communityId: string;
  userId: string;
  isMember: boolean;
  type: 'public' | 'private';
}

export default function JoinCommunityButton({ communityId, userId, isMember, type }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleJoin = () => {
    startTransition(async () => {
      await requestToJoinCommunity(communityId, userId);
      router.refresh();
    });
  };

  if (isMember) {
    return <p className="text-small-regular text-gray-1">Already a member</p>;
  }

  return (
    <button
      onClick={handleJoin}
      disabled={isPending}
      className="bg-primary-500 px-4 py-2 rounded-lg text-small-semibold text-white hover:bg-primary-500/80"
    >
      {isPending ? "Processing..." : type === 'public' ? "Join Community" : "Request to Join"}
    </button>
  );
}

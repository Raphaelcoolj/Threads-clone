"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptJoinRequest } from "@/lib/actions/community.actions";
import Image from "next/image";

interface Props {
  communityId: string;
  creatorId: string;
  requests: {
    _id: string;
    name: string;
    username: string;
    image: string;
  }[];
}

export default function JoinRequests({ communityId, creatorId, requests }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAccept = (userId: string) => {
    startTransition(async () => {
      await acceptJoinRequest(communityId, userId, creatorId);
      router.refresh();
    });
  };

  if (requests.length === 0) {
    return <p className="text-small-regular text-gray-1">No pending requests.</p>;
  }

  return (
    <div className="mt-9 flex flex-col gap-6">
      {requests.map((user) => (
        <div key={user._id} className="flex items-center justify-between bg-dark-2 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <Image
              src={user.image || "/assets/user.svg"}
              alt={user.name}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <p className="text-body-semibold text-light-1">{user.name}</p>
              <p className="text-small-regular text-gray-1">@{user.username}</p>
            </div>
          </div>
          <button
            onClick={() => handleAccept(user._id)}
            disabled={isPending}
            className="bg-primary-500 px-4 py-2 rounded-lg text-small-semibold text-white hover:bg-primary-500/80"
          >
            {isPending ? "Accepting..." : "Accept"}
          </button>
        </div>
      ))}
    </div>
  );
}

import { fetchUserPosts } from "@/lib/actions/user";
import { redirect } from "next/navigation";

import React from "react";
import ThreadCard from "../cards/ThreadCard";

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

const ThreadsTab = async ({ currentUserId, accountId, accountType }: Props) => {
  let result = await fetchUserPosts(accountId);

  if (!result) redirect("/");

  return (
    <section className="mt-9 flex flex-col gap-10">
      {result.threads.map((thread: any) => {
        if (!thread) return null;

        return (
          <ThreadCard
            key={thread._id.toString()}
            id={thread._id.toString()}
            currentUserId={currentUserId}
            parentId={thread.parentId}
            content={thread.text}
            author={
              accountType === "User"
                ? { name: result.name, image: result.image, _id: result._id.toString() }
                : {
                    name: thread.author.name,
                    image: thread.author.image,
                    _id: thread.author._id.toString(),
                  }
            }
            community={thread.community}
            createdAt={thread.createdAt}
            comments={thread.children}
          />
        );
      })}
    </section>
  );
};

export default ThreadsTab;

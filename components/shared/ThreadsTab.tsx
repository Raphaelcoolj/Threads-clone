import { fetchUserPosts } from "@/lib/actions/user";
import { redirect } from "next/navigation";

import React from "react";
import ThreadCard from "../cards/ThreadCard";
import { fetchCommunityPosts } from "@/lib/actions/community.actions";

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

const ThreadsTab = async ({ currentUserId, accountId, accountType }: Props) => {
  let result: any

  if(accountType === "Community") {
    result = await fetchCommunityPosts(accountId);
  } else {
    result = await fetchUserPosts(accountId);
  }


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
          community={
            accountType === "Community"
              ? {
                  name: result.name,
                  _id: result._id.toString(),
                  image: result.image,
                }
              : thread.community
          }
          createdAt={thread.createdAt}
          comments={thread.children}
          />        );
      })}
    </section>
  );
};

export default ThreadsTab;

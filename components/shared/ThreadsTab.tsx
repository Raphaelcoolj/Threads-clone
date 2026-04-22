import { fetchUserPosts, fetchUserComments } from "@/lib/actions/user";
import { redirect } from "next/navigation";

import React from "react";
import ThreadCard from "../cards/ThreadCard";
import { fetchCommunityPosts } from "@/lib/actions/community.actions";

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
  tabValue?: string;
}

const ThreadsTab = async ({ currentUserId, accountId, accountType, tabValue }: Props) => {
  let result: any;

  if (accountType === "Community") {
    result = await fetchCommunityPosts(accountId);
  } else {
    if (tabValue === "replies") {
      result = await fetchUserComments(accountId);
    } else {
      result = await fetchUserPosts(accountId);
    }
  }

  if (!result) redirect("/");

  // Sanitize the entire result object to plain JSON
  const plainResult = JSON.parse(JSON.stringify(result));

  return (
    <section className="mt-9 flex flex-col gap-10">
      {plainResult.threads.map((thread: any) => {
        if (!thread) return null;

        const isRepost = accountType === "User" && tabValue !== "replies" && thread.author._id.toString() !== accountId;

        return (
          <div key={thread._id.toString()} className="flex flex-col">
            {isRepost && (
              <p className="text-subtle-medium text-gray-1 mb-2 ml-2">
                Reposted
              </p>
            )}
            <ThreadCard
              id={thread._id.toString()}
              currentUserId={currentUserId}
              parentId={thread.parentId}
              content={thread.text}
              author={
                thread.author && typeof thread.author === 'object' 
                  ? {
                      name: thread.author.name,
                      image: thread.author.image,
                      _id: thread.author._id.toString(),
                    }
                  : {
                      name: plainResult.name,
                      image: plainResult.image,
                      _id: plainResult._id.toString(),
                    }
              }
              community={
                accountType === "Community"
                  ? {
                      name: plainResult.name,
                      _id: plainResult._id.toString(),
                      image: plainResult.image,
                    }
                  : thread.community
              }
              createdAt={thread.createdAt}
              comments={thread.children}
              likes={thread.likes?.map((id: any) => id.toString()) || []}
              reposts={thread.reposts?.map((id: any) => id.toString()) || []}
              isComment={tabValue === "replies"}
            />
          </div>
        );
      })}
    </section>
  );
};

export default ThreadsTab;

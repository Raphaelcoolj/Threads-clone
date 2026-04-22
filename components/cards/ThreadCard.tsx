"use client";

import { useState, useTransition } from "react";
import { formatDateString } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { toggleLikeThread, repostThread } from "@/lib/actions/thread.actions";

interface Props {
  id: string;
  currentUserId: string;
  parentId?: string | null;
  content: string;
  author: { name: string; image: string; _id: string };
  community: { name: string; _id: string; image: string } | null;
  createdAt: string;
  comments: { author: { image: string } }[];
  isComment?: boolean;
  likes?: string[];
  reposts?: string[];
}

const ThreadCard = ({
  id,
  currentUserId,
  parentId,
  content,
  author,
  community,
  createdAt,
  comments,
  isComment,
  likes = [],
  reposts = [],
}: Props) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const handleLike = () => {
    startTransition(async () => {
      await toggleLikeThread(id, currentUserId, pathname);
      router.refresh();
    });
  };

  const handleRepost = () => {
    startTransition(async () => {
      await repostThread(id, currentUserId, pathname);
      router.refresh();
    });
  };

  const isLiked = likes.includes(currentUserId);

  return (
    <article
      className={` flex w-full flex-col rounded-xl ${isComment ? "px-0 xs:px-7" : "bg-dark-2 p-7"}`}
    >
      <div className=" flex items-start justify-between">
        <div className="flex w-full flex-1 flex-row gap-4">
          <div className="flex flex-col items-center">
            <Link
              href={`/profile/${author._id}`}
              className="relative h-11 w-11 "
            >
              <Image
                src={author.image || "/assets/user.svg"}
                alt="Profile Picture"
                fill
                className="rounded-full cursor-pointer"
              />
            </Link>
            <div className=" thread-card_bar " />
          </div>

          <div className="flex w-full flex-col gap-1">
            <Link href={`/profile/${author._id}`} className="w-fit">
              <h4 className=" cursor-pointer text-base-semibold text-light-1">
                {author.name}
              </h4>
            </Link>
            <p className="mt-2 text-small-regular text-light-2">{content}</p>

            <div className={`${isComment && "mb-10"} mt-5 flex flex-col gap-3`}>
              <div className="flex gap-3.5 ">
                <div className="flex items-center gap-1">
                  <Image
                    src={
                      isLiked ? "/assets/heart-filled.svg" : "/assets/heart-gray.svg"
                    }
                    alt="Likes"
                    width={24}
                    height={24}
                    className="cursor-pointer object-contain"
                    onClick={handleLike}
                  />
                  {likes.length > 0 && (
                    <p className="text-subtle-medium text-gray-1">{likes.length}</p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Link href={`/thread/${id}`}>
                    <Image
                      src="/assets/reply.svg"
                      alt="reply"
                      width={24}
                      height={24}
                      className="cursor-pointer object-contain"
                    />
                  </Link>
                  {comments.length > 0 && (
                    <p className="text-subtle-medium text-gray-1">
                      {comments.length}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Image
                    src="/assets/repost.svg"
                    alt="repost"
                    width={24}
                    height={24}
                    className="cursor-pointer object-contain"
                    onClick={handleRepost}
                  />
                  {reposts.length > 0 && (
                    <p className="text-subtle-medium text-gray-1">
                      {reposts.length}
                    </p>
                  )}
                </div>

                <Image
                  src="/assets/share.svg"
                  alt="share"
                  width={24}
                  height={24}
                  className="cursor-pointer object-contain"
                  onClick={() =>
                    navigator.share({
                      title: "Check out this thread",
                      url: window.location.origin + `/thread/${id}`,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isComment && community ? (
        <Link
          href={`/communities/${community._id.toString()}`}
          className="mt-5 flex items-center"
        >
          <p className="text-subtle-medium text-gray-1">
            {formatDateString(createdAt)} {""} - {""} {community.name} Community
          </p>

          <Image
            src={
              community.image && community.image.trim() !== ""
                ? community.image
                : "/assets/community.svg"
            }
            alt={community.name || "Community"}
            width={14}
            height={14}
            className="ml-1 object-cover rounded-full"
          />
        </Link>
      ) : (
        <p className="mt-5 text-subtle-medium text-gray-1">
          {formatDateString(createdAt)}
        </p>
      )}
    </article>
  );
};

export default ThreadCard;

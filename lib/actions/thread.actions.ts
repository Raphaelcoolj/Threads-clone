"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import Thread from "../models/threads.model";
import { User } from "../models/User";
import Community from "../models/community";
import { connectDB } from "../mongoose";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  communityId,
  author,
  path,
}: Params) {
  try {
    await connectDB();

    let userId = author;
    if (!mongoose.isValidObjectId(author)) {
      const user = await User.findOne({ authProviderId: author });
      if (user) userId = user._id.toString();
    }

    let communityObjectId = communityId
      ? new mongoose.Types.ObjectId(communityId)
      : null;

    const createdThread = await Thread.create({
      text,
      author: userId,
      community: communityObjectId,
    });

    await User.findByIdAndUpdate(userId, {
      $push: { threads: createdThread._id },
    });

    if (communityObjectId) {
      await Community.findByIdAndUpdate(communityObjectId, {
        $push: { threads: createdThread._id },
      });
    }

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  try {
    await connectDB();
    const skipAmount = (pageNumber - 1) * pageSize;

    const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({ path: "author", model: User })
      .populate({ path: "community", model: Community })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id name parentId image",
        },
      })
      .lean();

    const totalPostsCount = await Thread.countDocuments({
      parentId: { $in: [null, undefined] },
    });

    const posts = await postsQuery.exec();
    const isNext = totalPostsCount > skipAmount + posts.length;

    // Serialize plain objects for Client Components
    return { posts: JSON.parse(JSON.stringify(posts)), isNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }
}

export async function fetchThreadById(threadId: string) {
  await connectDB();
  try {
    const thread = await Thread.findById(threadId)
      .populate({ path: "author", model: User, select: "_id name image" })
      .populate({
        path: "children",
        populate: [
          { path: "author", model: User, select: "_id name parentId image" },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id name parentId image",
            },
          },
        ],
      })
      .lean()
      .exec();

    return JSON.parse(JSON.stringify(thread));
  } catch (err) {
    console.error("Error while fetching thread:", err);
    throw new Error("Unable to fetch thread");
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  await connectDB();
  try {
    let authorId = userId;
    if (!mongoose.isValidObjectId(userId)) {
      const user = await User.findOne({ authProviderId: userId });
      if (user) authorId = user._id.toString();
    }

    const originalThread = await Thread.findById(threadId);
    if (!originalThread) throw new Error("Original thread not found");

    const commentThread = new Thread({
      text: commentText,
      author: authorId,
      parentId: threadId,
    });

    const savedCommentThread = await commentThread.save();
    originalThread.children.push(savedCommentThread._id);
    await originalThread.save();
    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}

export async function toggleLikeThread(
  threadId: string,
  userId: string,
  path: string
) {
  try {
    await connectDB();
    const thread = await Thread.findById(threadId);
    if (!thread) throw new Error("Thread not found");

    const isLiked = (thread.likes || []).includes(userId);

    if (isLiked) {
      await Thread.findByIdAndUpdate(threadId, { $pull: { likes: userId } });
    } else {
      await Thread.findByIdAndUpdate(threadId, { $addToSet: { likes: userId } });
    }
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to like thread: ${error.message}`);
  }
}

export async function repostThread(
  threadId: string,
  userId: string,
  path: string
) {
  try {
    await connectDB();
    await Thread.findByIdAndUpdate(threadId, {
      $addToSet: { reposts: userId },
    });
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to repost: ${error.message}`);
  }
}

async function fetchAllChildThreads(threadId: string): Promise<any[]> {
  const childThreads = await Thread.find({ parentId: threadId });

  const descendantThreads = [];
  for (const childThread of childThreads) {
    const descendants = await fetchAllChildThreads(childThread._id);
    descendantThreads.push(childThread, ...descendants);
  }

  return descendantThreads;
}

export async function deleteThread(id: string, path: string): Promise<void> {
  try {
    await connectDB();

    // Find the thread to be deleted (the main thread)
    const mainThread = await Thread.findById(id).populate("author community");

    if (!mainThread) {
      throw new Error("Thread not found");
    }

    // Fetch all child threads and their descendants recursively
    const descendantThreads = await fetchAllChildThreads(id);

    // Get all descendant thread IDs including the main thread ID and child thread IDs
    const descendantThreadIds = [
      id,
      ...descendantThreads.map((thread) => thread._id),
    ];

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        mainThread.author?._id?.toString(), // Use optional chaining to handle possible undefined
        ...descendantThreads.map((thread) => thread.author?._id?.toString()),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        mainThread.community?._id?.toString(), // Use optional chaining to handle possible undefined
        ...descendantThreads.map((thread) => thread.community?._id?.toString()),
      ].filter((id) => id !== undefined)
    );

    // Recursively delete child threads and their descendants
    await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

    // Update User model
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    // Update Community model
    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
}

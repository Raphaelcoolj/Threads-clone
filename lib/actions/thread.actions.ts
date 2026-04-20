"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import Thread from "../models/threads.model";
import { User } from "../models/User";
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

    // Resolve the real MongoDB _id if a Google UUID was passed
    let userId = author;
    if (!mongoose.isValidObjectId(author)) {
      const user = await User.findOne({ authProviderId: author });
      if (user) userId = user._id.toString();
    }

    const createdThread = await Thread.create({
      text,
      author: userId,
      communityId: null,
    });

    // Update User model
    await User.findByIdAndUpdate(userId, {
      $push: { threads: createdThread._id },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  try {
    await connectDB();

    //calculate the number of posts to skip
    const skipAmount = (pageNumber - 1) * pageSize;

    //fetch posts that have no parents(top-level threads)
    const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({ path: "author", model: User })
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
    return { posts, isNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }
}

export async function fetchThreadById(threadId: string) {
  connectDB();

  try {
    const thread = await Thread.findById(threadId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      }) // Populate the author field with _id and username
      .populate({
        path: "children", // Populate the children field
        populate: [
          {
            path: "author", // Populate the author field within children
            model: User,
            select: "_id id name parentId image", // Select only _id and username fields of the author
          },
          {
            path: "children", // Populate the children field within children
            model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
            populate: {
              path: "author", // Populate the author field within nested children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
          },
        ],
      })
      .lean()
      .exec();

    return thread;
  } catch (err) {
    console.error("Error while fetching thread:", err);
    throw new Error("Unable to fetch thread");
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string,
) {
  await connectDB();
  try {
    // Resolve the real MongoDB _id if a Google UUID was passed
    let authorId = userId;
    if (!mongoose.isValidObjectId(userId)) {
      const user = await User.findOne({ authProviderId: userId });
      if (user) authorId = user._id.toString();
    }

    //find original thread by ID
    const originalThread = await Thread.findById(threadId);
    if (!originalThread) {
      throw new Error("Original thread not found");
    }
    //create new thread as a comment
    const commentThread = new Thread({
      text: commentText,
      author: authorId,
      parentId: threadId,
    })

    //save new thread
    const savedCommentThread = await commentThread.save();

    //update original thread with new comment
    originalThread.children.push(savedCommentThread._id);
    //save it
    await originalThread.save();
    revalidatePath(path);
    
  }catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}

"use server"

import { connectDB } from "@/lib/mongoose";
import { User } from "@/lib/models/User";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import Thread from "@/lib/models/threads.model";
import Community from "@/lib/models/community";
import { deleteThread } from "./thread.actions";
import { deleteCommunity } from "./community.actions";

/**
 * Fetches all users from the database.
 * Excludes sensitive data like passwords.
 */
export async function fetchAllUsers() {
  try {
    await connectDB();
    
    // Fetch all users, sorted by creation date
    const users = await User.find({}).sort({ createdAt: -1 });

    // POJO-ify for Next.js Server-to-Client transport
    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    console.error("Fetch Users Error:", error);
    throw new Error("Failed to retrieve user list.");
  }
}

/**
 * Updates a user's role.
 */
export async function updateUserRole(userId: string, newRole: string) {
  try {
    await connectDB();
    
    await User.findByIdAndUpdate(userId, { role: newRole });
    
    // Revalidate the admin dashboard to show fresh data
    revalidatePath("/admin");
    
    return { success: true };
  } catch (error) {
    console.error("Update Role Error:", error);
    throw new Error("Failed to update user role.");
  }
}

/**
 * Admin action to manually create a user.
 */
export async function adminCreateUser(formData: FormData) {
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string || "user";

  if (!name || !username || !email || !password) {
    throw new Error("Missing required fields");
  }

  try {
    await connectDB();

    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (userExists) {
        throw new Error("User with that email or username already exists");
    }

    const hashedPassword = await hash(password, 10);

    await User.create({
      name,
      username: username.toLowerCase(),
      email,
      password: hashedPassword,
      role,
      onboarded: true, // Admin-created users are pre-onboarded
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Failed to create user");
  }
}

/**
 * Permanently deletes a user account.
 */
export async function deleteUser(userId: string) {
  try {
    await connectDB();
    await User.findByIdAndDelete(userId);
    
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Delete User Error:", error);
    throw new Error("Failed to delete user account.");
  }
}

/**
 * Fetches all threads.
 */
export async function fetchAllThreads() {
  try {
    await connectDB();
    const threads = await Thread.find({})
      .populate({ path: "author", model: User, select: "name username image _id" })
      .populate({ path: "community", model: Community, select: "name _id" })
      .sort({ createdAt: -1 });

    return JSON.parse(JSON.stringify(threads));
  } catch (error) {
    console.error("Fetch Threads Error:", error);
    throw new Error("Failed to retrieve threads.");
  }
}

/**
 * Admin action to delete a thread.
 */
export async function deleteThreadAdmin(threadId: string) {
  try {
    await deleteThread(threadId, "/admin");
    return { success: true };
  } catch (error: any) {
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
}

/**
 * Admin action to delete a community.
 */
export async function deleteCommunityAdmin(communityId: string) {
  try {
    await deleteCommunity(communityId);
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    throw new Error(`Failed to delete community: ${error.message}`);
  }
}

/**
 * Fetches all communities.
 */
export async function fetchAllCommunities() {
  try {
    await connectDB();
    const communities = await Community.find({})
      .populate("createdBy", "name username")
      .sort({ createdAt: -1 });

    return JSON.parse(JSON.stringify(communities));
  } catch (error) {
    console.error("Fetch Communities Error:", error);
    throw new Error("Failed to retrieve communities.");
  }
}

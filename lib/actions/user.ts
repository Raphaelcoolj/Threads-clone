"use server";

import mongoose, { FilterQuery, SortOrder } from "mongoose"
import { connectDB } from "../mongoose";
import { User } from "../models/User";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
;
import Thread from "../models/threads.model";

export async function signUp(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = (formData.get("password") as string)?.trim();

  if (!username || !email || !password) {
    throw new Error("Username, Email, and Password are required");
  }

  await connectDB();

  // 1. Check if user already exists
  const userExists = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (userExists) {
    throw new Error("User already exists with that email or username");
  }

  // 2. Hash the password
  const hashedPassword = await hash(password, 10);

  // 3. Create the user with a consistent ID
  const generatedId = new mongoose.Types.ObjectId();

  try {
    await User.create({
      _id: generatedId,
      name: name || "",
      username: username,
      email,
      password: hashedPassword,
      onboarded: false,
    });
  } catch (error: any) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  // 4. Redirect to login
  redirect("/login");
}

// Standard industry login action
export async function login(prevState: any, formData: FormData) {
  const emailOrUsername = (formData.get("emailOrUsername") as string)
    ?.trim()
    .toLowerCase();
  const password = (formData.get("password") as string)?.trim();

  try {
    // 1. Check onboarding status BEFORE signing in to decide redirect
    await connectDB();
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    const redirectPath = user?.onboarded ? "/" : "/onboarding";

    await signIn("credentials", {
      emailOrUsername,
      password,
      redirectTo: redirectPath,
    });
  } catch (error) {
    // AuthError covers all auth failures (CredentialsSignin, CallbackRouteError, etc.)
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    // IMPORTANT: Next.js redirects throw an error internally — re-throw to allow navigation.
    throw error;
  }
}

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  bio,
  name,
  path,
  username,
  image,
}: Params): Promise<void> {
  console.log(`[SERVER] updateUser started for: ${userId}`);
  try {
    await connectDB();

    console.log(`[SERVER] Updating DB for ${userId}...`);

    // Safety Net: Try to find by 'id' first (Adrian's style),
    // but if not found, fallback to 'username' to catch inconsistent test accounts.
    const isMongoId = mongoose.isValidObjectId(userId);
    const user = await User.findOne({
      $or: [
        isMongoId ? { _id: userId } : null,
        { authProviderId: userId },
        { email: username.toLowerCase() }, // Some users accidentally type email
        { username: username.toLowerCase() },
      ].filter(Boolean) as any[],
    });

    if (user) {
      user.username = username.toLowerCase();
      user.name = name;
      user.bio = bio || ""; // Optional
      user.image = image;
      user.onboarded = true;
      await user.save();
      console.log(`[SERVER] DB Update Success for ${userId}`);
    } else {
      // Create new if truly doesn't exist
      await User.create({
        authProviderId: userId,
        username: username.toLowerCase(),
        name,
        bio: bio || "",
        image,
        onboarded: true,
      });
      console.log(`[SERVER] New User Created for ${userId}`);
    }

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    console.error(`[SERVER] updateUser Error: ${error.message}`);
    throw new Error(`Failed to update user: ${error.message}`);
  }
}

export async function fetchUser(userId: string) {
  try {
    await connectDB();
    
    const query = mongoose.isValidObjectId(userId) 
      ? { _id: userId } 
      : { authProviderId: userId };

    const user = await User.findOne(query)
      .populate({
        path: "threads",
        model: Thread,
        select: "_id", 
      })
      .populate({
        path: "communities",
        model: "Community",
      })
      .lean();

    if (user && user.threads) {
      user.threads = user.threads.filter((thread: any) => thread !== null);
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function fetchUserPosts(userId: string) {
  try {
    await connectDB();
    
    const query = mongoose.isValidObjectId(userId) 
      ? { _id: userId } 
      : { authProviderId: userId };

    //find all threads authored by user
    const userWithPosts = await User.findOne(query)
      .populate({
        path: "threads",
        model: Thread,
        populate: [
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "name image _id",
            },
          },
          {
            path: "community",
            model: "Community",
          },
        ],
      })
      .lean();

    // Filter out threads that were deleted manually from the database 
    // but are still referenced in the user's threads array.
    if (userWithPosts && userWithPosts.threads) {
      userWithPosts.threads = userWithPosts.threads.filter((thread: any) => thread !== null);
    }

    return userWithPosts;
  } catch (error: any) {
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }
}


export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    await connectDB();

    const skipAmount = (pageNumber - 1) * pageSize;
    const regex = new RegExp(searchString, "i");

    const query: FilterQuery<typeof User> = {
      _id: { $ne: userId },
    };

    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const sortOptions ={ createdAt: sortBy};

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize)
      .lean();

    const totalUsersCount = await User.countDocuments(query);
    const users = await usersQuery.exec();
    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };

  } catch (error: any) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
}

export async function getActivity(userId: string){
  try {
    await connectDB();

    //find all threads created by user
    const userThreads = await Thread.find({ author: userId});

    //collect all the child thread ids (replies) from 'children' field
    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children)
    }, [])

    const replies = await Thread.find({
      _id: {$in: childThreadIds},
      author: {$ne: userId}
    }).populate({
      path: 'author',
      model: User,
      select: 'name image _id'
    }).lean();

    return replies

  } catch (error: any) {
    throw new Error(`failed to get activities: ${error.message}`)
  }
}
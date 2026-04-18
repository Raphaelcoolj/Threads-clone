"use server";

import { connectDB } from "../mongoose";
import { User } from "../User";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import mongoose from "mongoose";

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
    return await User
      .findOne({ _id: userId })
      // .populate({
      //   path: "communities",
      //   model: "Community"
      // });
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

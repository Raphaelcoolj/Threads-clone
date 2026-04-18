import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/lib/User";
import { fetchUser } from "@/lib/actions/user";
import PostThread from "@/components/forms/PostThread";
// If you create PostThread component later, you would import it here:
// import PostThread from "@/components/forms/PostThread";

export default async function Page() {
  // 1. Equivalent of Clerk's currentUser()
  const session = await auth();

  if (!session?.user) {
    return redirect("/login");
  }

  // 2. Fetch the user info from db (Adrian's fetchUser equivalent)
  await connectDB();

  //my check from adrain's code
    const userInfo = await fetchUser(session.user.id);
    if (!userInfo?.onboarded) {
      redirect("/onboarding");
    }

  return (
    <>
      <h1 className="head-text">Create Thread</h1>
       <PostThread userId={userInfo._id.toString()} /> 
    </>
  );
}
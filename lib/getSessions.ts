
//protected routes
import { auth } from "@/auth";
import { cache } from "react";
import { connectDB } from "./mongoose";
import { User } from "./models/User";

export const getSession = cache(async () => {
    const session = await auth();
    
    // If there's no session, we can't look up a user
    if (!session?.user?.email) return null;

    await connectDB();
    
    // Look up the full user profile including the 'onboarded' status
    const user = await User.findOne({ email: session.user.email });
    
    return {
        session,
        user: user ? JSON.parse(JSON.stringify(user)) : null
    };
});

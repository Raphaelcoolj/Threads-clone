import { auth } from "@/auth";
import { redirect } from "next/navigation";
import OnboardingForm from "@/components/forms/OnboardingForm";
import { User } from "@/lib/User";
import { connectDB } from "@/lib/mongoose";

export default async function OnboardingPage() {
  const session = await auth();
  
  if (!session?.user) redirect("/login");

  // Only redirect to Home if the SESSION says they are onboarded.
  // This prevents the loop where the DB says 'true' but the JWT cookie still says 'false'.
  if (session.user.onboarded) redirect("/");

  // Get full user data from DB to prepopulate form
  await connectDB();
  const isMongoId = session.user.id.match(/^[0-9a-fA-F]{24}$/); // ensure it's valid
  const dbUser = await User.findOne({ 
     $or: [
       isMongoId ? { _id: session.user.id } : null,
       { authProviderId: session.user.id }
     ].filter(Boolean) as any[]
  });

  const userData = {
    id: session.user.id,
    name: dbUser?.name || session.user.name || "",
    username: dbUser?.username || session.user.username || "",
    image: dbUser?.image || session.user.image || "",
    bio: dbUser?.bio || "",
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col justify-start px-10 sm:px-10 py-20 bg-dark-1 min-h-screen">
      <div className="space-y-2 text-center sm:text-left">
        <p className="mt-3 text-base-regular text-light-2">
          Complete your profile now to use Threads
        </p>
      </div>

      <section className="mt-9 bg-dark-9 border border-zinc-900 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl shadow-primary-500/5">
         <OnboardingForm user={userData} />
      </section>
    </main>
  );
}

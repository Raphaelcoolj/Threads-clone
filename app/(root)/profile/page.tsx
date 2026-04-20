// app/(root)/profile/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();

  // If they aren't logged in, send to login
  if (!session?.user?.id) redirect("/login");

  // Redirect to the dynamic route using their ID
  redirect(`/profile/${session.user.id}`);
}

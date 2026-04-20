import { auth } from "@/auth";
import { fetchUser } from "@/lib/actions/user";
import { redirect } from "next/navigation";
import CommunityForm from "@/components/forms/CommunityForm";

async function Page() {
  const session = await auth();
  if (!session) return null;

  const user = session.user;
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  return (
    <>
      <h1 className="head-text">Create Community</h1>

      <section className="mt-9 bg-dark-2 p-10">
        <CommunityForm userId={userInfo._id.toString()} />
      </section>
    </>
  );
}

export default Page;

import { auth } from "@/auth";
import { fetchUser } from "@/lib/actions/user";
import { redirect } from "next/navigation";
import OnboardingForm from "@/components/forms/OnboardingForm";

async function Page() {
  const session = await auth();
  if (!session) return null;

  const userInfo = await fetchUser(session.user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const userData = {
    id: session.user.id,
    name: userInfo ? userInfo?.name : session.user.name,
    username: userInfo ? userInfo?.username : session.user.username,
    bio: userInfo ? userInfo?.bio : "",
    image: userInfo ? userInfo?.image : session.user.image,
  };

  return (
    <>
      <h1 className='head-text'>Edit Profile</h1>
      <p className='mt-3 text-base-regular text-light-2'>
        Make any changes you want to your profile.
      </p>

      <section className='mt-12'>
        <OnboardingForm user={userData} />
      </section>
    </>
  );
}

export default Page;

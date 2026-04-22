import { auth } from "@/auth";
import { fetchUser } from "@/lib/actions/user";
import { redirect } from "next/navigation";
import CommunityForm from "@/components/forms/CommunityForm";
import { fetchCommunityDetails } from "@/lib/actions/community.actions";

async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return null;

  const user = session.user;
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const communityDetails = await fetchCommunityDetails(id);
  if (!communityDetails) return <p className="text-light-1">Community not found.</p>;

  // Check if current user is the creator
  if (communityDetails.createdBy._id.toString() !== userInfo._id.toString()) {
     redirect(`/communities/${id}`);
  }

  const communityData = {
    id: communityDetails._id.toString(),
    name: communityDetails.name,
    username: communityDetails.username,
    image: communityDetails.image,
    bio: communityDetails.bio,
    type: communityDetails.type,
  };

  return (
    <>
      <h1 className="head-text">Edit Community</h1>

      <section className="mt-9 bg-dark-2 p-6 sm:p-10">
        <CommunityForm 
          userId={userInfo._id.toString()} 
          communityDetails={communityData}
        />
      </section>
    </>
  );
}

export default Page;

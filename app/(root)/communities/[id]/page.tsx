import { auth } from "@/auth";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { communityTabs } from "@/constants";
import ThreadsTab from "@/components/shared/ThreadsTab";
import { redirect } from "next/navigation";
import { fetchCommunityDetails } from "@/lib/actions/community.actions";
import UserCard from "@/components/cards/UserCard";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  if (!id) return null;
  const session = await auth();
  console.log("[PAGE] Session check:", session);
  if (!session) redirect("/login");
  const userId = session?.user?.id;

  const communityDetails = await fetchCommunityDetails(id);
  if(!communityDetails){
    return <p className="text-light-2">Not Found</p>
  }

  const safeCommunityImg = (communityDetails.image && communityDetails.image.trim() !== "") 
    ? communityDetails.image 
    : "/assets/community.svg";
  
  return (
    <section>
      <ProfileHeader
        accountId={communityDetails._id.toString()}
        authUserId={communityDetails._id.toString()}
        name={communityDetails.name || "Community"}
        username={communityDetails.username || "unknown"}
        imgURL={safeCommunityImg}
        bio={communityDetails.bio || "No description provided."}
        type="Community"
      />

      <div className="mt-9">
        <Tabs defaultValue="threads" className="w-full">
          <TabsList className="tab">
            {communityTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className="tab">
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className="object-contain"
                />
                <p className="max-sm:hidden">{tab.label}</p>
                {tab.label === "Threads" && (
                  <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                    {communityDetails?.threads?.length || 0}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="threads" className="w-full text-light-1">
            <ThreadsTab
              currentUserId={userId}
              accountId={communityDetails._id.toString()}
              accountType="Community"
            />
          </TabsContent>

          <TabsContent value="members" className="w-full text-light-1">
            <section className="mt-9 flex flex-col gap-10">
              {communityDetails?.members.map((member: any) => (
                <UserCard
                  key={member._id.toString()}
                  id={member._id.toString()}
                  name={member.name || "Unknown User"}
                  username={member.username || "unknown"}
                  imgURL={(member.image && member.image.trim() !== "") ? member.image : "/assets/user.svg"}
                  personType="User"
                />
              ))}
            </section>
          </TabsContent>

          <TabsContent value="requests" className="w-full text-light-1">
            <ThreadsTab
              currentUserId={userId}
              accountId={communityDetails._id.toString()}
              accountType="Community"
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default page;

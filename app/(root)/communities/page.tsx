import { redirect } from "next/navigation";
import { auth } from "@/auth";

import { fetchUser, fetchUsers } from "@/lib/actions/user";


import Image from "next/image";
import { profileTabs } from "@/constants";
import ThreadsTab from "@/components/shared/ThreadsTab";
import CommunityCard from "@/components/cards/CommunityCard";
import { fetchCommunities } from "@/lib/actions/community.actions";
import Searchbar from "@/components/shared/Searchbar";



const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const session = await auth();
  if (!session) redirect("/login");

  const userInfo = await fetchUser(session.user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const { q } = await searchParams;

  //fetch communitiescommunities
  const result = await fetchCommunities({
    searchString: q || "",
    pageNumber: 1,
    pageSize: 25,
  })


  return (
    <section>
        <h1 className="head-text mt-10">
            Communities
        </h1>

        <div className='mt-5'>
          <Searchbar routeType='communities' />
        </div>

        <div className="mt-14 flex flex-col gap-9">
            {result.communities.length === 0 ? (
                <p className="no-result">No communities yet</p>
            ):(
                <>
                  {result.communities.map((community) => (
                    <CommunityCard 
                      key={community._id.toString()}
                      id={community._id.toString()}
                      name={community.name}
                      username={community.username}
                      imgUrl={community.image}
                      bio={community.bio}
                      members={community.members}
                    />
                  ))}
                </>
            )}
        </div>
    </section>
  )
}


export default page
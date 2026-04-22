import { redirect } from "next/navigation";
import { auth } from "@/auth";

import { fetchUser, fetchUsers } from "@/lib/actions/user";


import Image from "next/image";
import { profileTabs } from "@/constants";
import ThreadsTab from "@/components/shared/ThreadsTab";
import UserCard from "@/components/cards/UserCard";
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

  //fetch all users
  const result = await fetchUsers({
    userId: session.user.id,
    searchString: q || "",
    pageNumber: 1,
    pageSize: 25,
  })


  return (
    <section>
        <h1 className="head-text mt-10">
            Search
        </h1>

        <div className='mt-5'>
          <Searchbar routeType='search' />
        </div>

        <div className="mt-14 flex flex-col gap-9">
            {result.users.length === 0 ? (
                <p className="no-result">No users</p>
            ):(
                <>
                  {result.users.map((person) => (
                    <UserCard 
                      key={person._id.toString()}
                      id={person._id.toString()}
                      name={person.name}
                      username={person.username}
                      imgURL={person.image}
                      personType='User'
                    />
                  ))}
                </>
            )}
        </div>
    </section>
  )
}

export default page
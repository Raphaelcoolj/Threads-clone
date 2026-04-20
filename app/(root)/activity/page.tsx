import { redirect } from "next/navigation";
import { auth } from "@/auth";

import { fetchUser, fetchUsers, getActivity } from "@/lib/actions/user";


import Image from "next/image";
import Link from "next/link";

const page = async () => {

  //logged in checks/ protected routes
  const session = await auth();
  if (!session) redirect("/login");
  const userInfo = await fetchUser(session.user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");


  //get activity
  const activity = await getActivity(userInfo._id);

  return (
    <section>
        <h1 className="head-text mt-10">
            Activity
        </h1>

        <section className="mt-10 flex flex-col gap-5">
          {activity.length > 0 ? (
            <>
              {activity.map((activity) => (
                <Link key={activity._id} href={`/thread/${activity.parentId}`}>
                  <article className="activity-card">
                    <Image
                      src={activity.author.image || 'assets/user.svg'}
                      alt='Profile Image'
                      width={20}
                      height={20}
                      className='rounded-full object-cover'
                    />
                    <p className='!text-small-regular text-light-1'>
                      <span className='mr-1 text-primary-500'>
                        {activity.author.name}
                      </span> {' '}
                      replied to your thread
                    </p>
                  </article>
                </Link>
              ))}
            </>
          ): 
          <p className='!text-base-regular text-light-3 '>No Activity yet</p>}
        </section>
    </section>
  )
}

export default page
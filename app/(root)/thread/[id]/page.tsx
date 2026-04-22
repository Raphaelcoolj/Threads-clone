import ThreadCard from "@/components/cards/ThreadCard";
import { auth } from "@/auth";
import { fetchUser } from "@/lib/actions/user";
import { redirect } from "next/navigation";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import Comment from "@/components/forms/Comment";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  if (!id) return null;
  const session = await auth();
  const userId = session?.user?.id;

  const userInfo = await fetchUser(userId || "");
  if (!userInfo?.onboarded) redirect("/onboarding");

  const thread = await fetchThreadById(id);
  if (!thread) return <p className="no-result">Thread not found.</p>;

  return (
    <section className="relative">
      <div>
        <ThreadCard
          key={thread._id}
          id={thread._id}
          currentUserId={userId || ""}
          parentId={thread.parentId}
          content={thread.text}
          author={thread.author}
          community={thread.community}
          createdAt={thread.createdAt}
          comments={thread.children}
          likes={thread.likes?.map((id: any) => id.toString()) || []}
          reposts={thread.reposts?.map((id: any) => id.toString()) || []}
        />
      </div>

      {/* adding reply */}
      <div className="mt-7">
        <Comment 
        threadId={thread._id.toString()}
        currentUserImg={userInfo?.image}
        currentUserId={JSON.stringify(userId)}
        />
      </div>

      <div className="mt-10">
        {thread.children.map((childItem: any) =>(
          <ThreadCard
          key={childItem._id}
          id={childItem._id}
          currentUserId={userId || ""}
          parentId={childItem.parentId}
          content={childItem.text}
          author={childItem.author}
          community={childItem.community}
          createdAt={childItem.createdAt}
          comments={childItem.children}
          likes={childItem.likes?.map((id: any) => id.toString()) || []}
          reposts={childItem.reposts?.map((id: any) => id.toString()) || []}
          isComment
        />
        ))}
      </div>
    </section>


  );
};

export default page;

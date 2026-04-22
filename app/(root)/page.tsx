import { auth } from "@/auth";
import ThreadCard from "@/components/cards/ThreadCard";
import { fetchPosts } from "@/lib/actions/thread.actions";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (!session) redirect("/login");
  const userId = session?.user?.id;

  const result = await fetchPosts(1, 30);

  return (
    <>
      <h1 className="head-text text-left">Home</h1>
      <section className=" mt-9 flex flex-col gap-10">
        {result.posts.length === 0 ? (
          <p className="no-result">No threads yet. Be the first to post!</p>
        ) : (
          <>
            {result.posts.map((post: any) => (
              <ThreadCard
                key={post._id.toString()}
                id={post._id.toString()}
                currentUserId={userId || ""}
                parentId={post.parentId}
                content={post.text}
                author={post.author}
                community={post.community}
                createdAt={post.createdAt}
                comments={post.children}
                likes={post.likes?.map((id: any) => id.toString()) || []}
                reposts={post.reposts?.map((id: any) => id.toString()) || []}
              />
            ))}
          </>
        )}
      </section>
    </>
  );
}

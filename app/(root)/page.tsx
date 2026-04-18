// import { auth } from "@/auth";
// import UserButton from "@/components/shared/UserButton";

export default async function Home() {
  // const session = await auth();
  // const user = session?.user;

  return (
    <>
      {/* {user && <UserButton user={user} />} */}
      <h1 className="head-text text-left">Home</h1>
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { signOut } from "@/auth";
import OrganizationSwitcher from "./OrganizationSwitcher";

// Auth.js equivalent of Clerk's <SignedIn>:
// We fetch the session server-side and conditionally render children.
const Topbar = async () => {
  const session = await auth();
  const isSignedIn = !!session?.user;

  return (
    <nav className="topbar">
      <Link href="/" className="flex items-center gap-4">
        <Image src="/assets/logo.svg" alt="logo" width={28} height={28} />

        <p className="text-heading-3-bold text-light-1 hidden sm:block">
          Threads
        </p>
      </Link>

      <div className="flex items-center gap-1">
        <div className="flex items-center gap-4">
          {/* 🔒 Auth.js SignedIn equivalent — only renders when user is logged in */}
          {isSignedIn && (
            <>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
                className="md:hidden"
              >
                <button type="submit" className="flex cursor-pointer">
                  <Image
                    src="/assets/logout.svg"
                    alt="logout"
                    width={24}
                    height={24}
                  />
                </button>
              </form>
              
              <OrganizationSwitcher />
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Topbar;

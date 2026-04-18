import { getSession } from "@/lib/getSessions";
import { redirect } from "next/navigation";
import SignUpForm from "@/components/forms/SignUpForm";

export default async function SignUpPage() {
  const session = await getSession();
  const user = session?.user;

  // Protect the sign-up page: If user is already logged in, send them to home
  if (user) redirect("/");
  
  return <SignUpForm />;
}

import { getSession } from "@/lib/getSessions";
import { redirect } from "next/navigation";
import LoginForm from "@/components/forms/LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  const user = session?.user;

  // Protect the login page: If user is already logged in, send them to home
  if (user) redirect("/");
  
  return <LoginForm />;
}

import { auth } from "@/auth";

export default async function OnboardingLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // We remove the server-side redirect loop here.
  // In Auth.js, the middleware (proxy.ts) and the server component session
  // can occasionally desync. By letting only the middleware handle redirections,
  // we break the infinite 307 "Ping-Pong" loop.
  
  return <>{children}</>;
}

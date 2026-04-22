"use client"

import { login } from "@/lib/actions/user";
import { signIn } from "next-auth/react"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { IconBrandGoogle, IconAlertCircle, IconLoader2 } from "@tabler/icons-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

// 🚀 Submit Button Component to handle loading state
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="w-full bg-primary-500 hover:bg-primary-500/90 text-white h-10 sm:h-11 transition-all duration-300 shadow-lg shadow-primary-500/20 font-semibold mt-1"
    >
      {pending ? (
        <IconLoader2 className="animate-spin h-5 w-5 mx-auto" />
      ) : (
        "Sign In"
      )}
    </Button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useActionState(login, undefined);

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#000000] px-4 py-8 selection:bg-primary-500/30">
      {/* Background Glow Effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-500/5 blur-[120px] rounded-full pointer-events-none" />

      <Card className="w-full sm:max-w-md lg:max-w-xl bg-zinc-950/50 border-zinc-800/50 backdrop-blur-xl text-light-1 shadow-2xl animate-in fade-in duration-500">
        <CardHeader className="space-y-1 pb-4 sm:pb-6">
          <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent text-center lg:text-left">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-zinc-400 text-center lg:text-left text-sm">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:gap-6">
          
          {/* 🛑 Display Error Message if it exists */}
          {state?.error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl animate-in slide-in-from-top-2 duration-300">
              <IconAlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-xs font-semibold uppercase tracking-wider">{state.error}</p>
            </div>
          )}

          <form action={formAction} className="grid gap-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="grid gap-1.5 sm:gap-2">
                <Label htmlFor="emailOrUsername" className="text-zinc-400 text-[10px] uppercase tracking-widest font-semibold">Email or Username</Label>
                <Input 
                  id="emailOrUsername" 
                  name="emailOrUsername" 
                  type="text" 
                  placeholder="John Doe" 
                  autoComplete="username"
                  className="bg-zinc-900/50 border-zinc-800 focus:border-primary-500 focus:ring-primary-500/20 transition-all duration-300 h-10 sm:h-11 text-sm text-white font-medium" 
                  required 
                />
              </div>
              <div className="grid gap-1.5 sm:gap-2">
                <Label htmlFor="password" title="password" className="text-zinc-400 text-[10px] uppercase tracking-widest font-semibold">Password</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  autoComplete="current-password"
                  className="bg-zinc-900/50 border-zinc-800 focus:border-primary-500 focus:ring-primary-500/20 transition-all duration-300 h-10 sm:h-11 text-sm text-white font-medium" 
                  required 
                />
              </div>
            </div>
            
            <SubmitButton />
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-[10px] sm:text-xs uppercase">
              <span className="bg-[#09090b] px-2 text-zinc-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="flex items-center justify-center gap-3 w-full h-10 sm:h-11 rounded-lg border border-zinc-800 bg-transparent text-zinc-200 hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-300 group"
            type="button"
          >
            <IconBrandGoogle className="h-5 w-5 transition-transform group-hover:scale-110" />
            <span className="font-medium text-sm sm:text-base tracking-tight">Sign in with Google</span>
          </button>

          <p className="text-center text-xs sm:text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-primary-500 hover:text-primary-400 font-medium transition-colors">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

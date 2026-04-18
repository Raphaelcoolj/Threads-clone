"use client"

import { signUp } from "@/lib/actions/user";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { IconBrandGoogle } from "@tabler/icons-react";

export default function SignUpForm() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#000000] px-4 py-8 selection:bg-primary-500/30">
      {/* Background Glow Effect */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/5 blur-[120px] rounded-full pointer-events-none" />

      <Card className="w-full sm:max-w-md lg:max-w-2xl bg-zinc-950/50 border-zinc-800/50 backdrop-blur-xl text-light-1 shadow-2xl animate-in fade-in duration-500">
        <CardHeader className="space-y-1 pb-4 sm:pb-6">
          <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent text-center lg:text-left">
            Create Account
          </CardTitle>
          <CardDescription className="text-zinc-400 text-center lg:text-left text-sm">
            Join the Threads community today
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:gap-6">
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="flex items-center justify-center gap-3 w-full h-10 sm:h-11 rounded-lg border border-zinc-800 bg-transparent text-zinc-200 hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-300 group"
            type="button"
          >
            <IconBrandGoogle className="h-5 w-5 transition-transform group-hover:scale-110" />
            <span className="font-medium text-sm sm:text-base">Sign up with Google</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-[10px] sm:text-xs uppercase">
              <span className="bg-[#09090b] px-2 text-zinc-500">Or continue with</span>
            </div>
          </div>

          <form action={signUp} className="grid gap-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="grid gap-1.5 sm:gap-2">
                <Label htmlFor="name" className="text-zinc-400 text-[10px] uppercase tracking-widest font-semibold">Full Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="John Doe" 
                  autoComplete="name"
                  className="bg-zinc-900/50 border-zinc-800 focus:border-primary-500 focus:ring-primary-500/20 h-10 sm:h-11 transition-all duration-300 text-sm text-white" 
                  required 
                />
              </div>
              <div className="grid gap-1.5 sm:gap-2">
                <Label htmlFor="username" className="text-zinc-400 text-[10px] uppercase tracking-widest font-semibold">Username</Label>
                <Input 
                  id="username" 
                  name="username" 
                  placeholder="johndoe" 
                  autoComplete="username"
                  className="bg-zinc-900/50 border-zinc-800 focus:border-primary-500 focus:ring-primary-500/20 h-10 sm:h-11 transition-all duration-300 text-sm text-white" 
                  required 
                />
              </div>
              <div className="grid gap-1.5 sm:gap-2">
                <Label htmlFor="email" className="text-zinc-400 text-[10px] uppercase tracking-widest font-semibold">Email Address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="johndoe@example.com" 
                  autoComplete="email"
                  className="bg-zinc-900/50 border-zinc-800 focus:border-primary-500 focus:ring-primary-500/20 h-10 sm:h-11 transition-all duration-300 text-sm text-white" 
                  required 
                />
              </div>
              <div className="grid gap-1.5 sm:gap-2">
                <Label htmlFor="password" title="password" className="text-zinc-400 text-[10px] uppercase tracking-widest font-semibold">Password</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  autoComplete="new-password"
                  className="bg-zinc-900/50 border-zinc-800 focus:border-primary-500 focus:ring-primary-500/20 h-10 sm:h-11 transition-all duration-300 text-sm text-white" 
                  required 
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary-500 hover:bg-primary-500/90 text-white h-10 sm:h-11 transition-all duration-300 shadow-lg shadow-primary-500/20 font-semibold mt-1">
              Create Account
            </Button>
          </form>

          <p className="text-center text-xs sm:text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="text-primary-500 hover:text-primary-400 font-medium transition-colors">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

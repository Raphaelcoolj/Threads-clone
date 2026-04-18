import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Threads",
  description: "A clone of Threads built with Next.js",
  
};

import { Providers } from "@/components/shared/Providers";
import Topbar from "@/components/shared/Topbar";
import LeftSideBar from "@/components/shared/LeftSideBar";
import RightSideBar from "@/components/shared/RightSideBar";
import Bottombar from "@/components/shared/Bottombar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body >
        <Providers>
          <Topbar />
          <main className="flex flex-row">
            <LeftSideBar />
            <section className="main-container">
              <div className='w-full max-w-4xl'>{children}</div>
            </section>
            <RightSideBar />
          </main>
          <Bottombar />
        </Providers>
      </body>
    </html>
  );
}

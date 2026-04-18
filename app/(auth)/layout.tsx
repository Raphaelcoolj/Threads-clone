import { Inter } from "next/font/google";
import "../globals.css";
export const metadata = {
  title: "Threads",
  description: "A clone of Threads built with Next.js",
};

const inter = Inter({ subsets: ["latin"] });

import { Providers } from "@/components/shared/Providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className = {`${inter.className} bg-dark-1`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

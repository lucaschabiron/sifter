import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "sifter",
  description:
    "Sifter uses AI to create personalized newsletters, sifting through content to deliver only what matters to you.",
};

export const favicon = {
  href: "/favicon.png",
  type: "image/png",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

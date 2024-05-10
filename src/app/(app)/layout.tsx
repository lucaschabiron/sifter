import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/themeProvider";
import { Sidebar } from "@/components/dashboard/sidebar";
import DashboardHeader from "@/components/dashboard/header";
import { createClient } from "@/lib/db/server";
import { redirect } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "sifter",
  description:
    "Sifter uses AI to create personalized newsletters, sifting through content to deliver only what matters to you.",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/login");
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
        >
          <div className="flex min-h-screen w-full flex-col bg-muted">
            <Sidebar />
            <div className="flex flex-col sm:py-4 sm:pl-14">
              <DashboardHeader />
              {children}
            </div>
          </div>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}

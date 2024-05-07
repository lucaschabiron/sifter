"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import Image from "next/image";
import {
  File,
  Home,
  LineChart,
  ListFilter,
  MoreHorizontal,
  Package,
  FileText,
  Package2,
  PanelLeft,
  PlusCircle,
  Search,
  Settings,
  ShoppingCart,
  Users2,
} from "lucide-react";
import { usePathname } from "next/navigation";
import logo from "@/components/marketing/logo.png";
import SidebarLink from "./sidebarLink";
import { ThemeSwitch } from "../themeSwitch";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/dashboard"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Image src={logo} alt="Sifter" width={30} height={30} />
          <span className="sr-only">Sifter</span>
        </Link>
        <TooltipProvider>
          <SidebarLink
            href="/dashboard"
            icon={<Home className="h-5 w-5" />}
            active={pathname === "/dashboard"}
          >
            Home
          </SidebarLink>
          <SidebarLink
            href="/sifts"
            icon={<FileText className="h-5 w-5" />}
            active={pathname === "/sifts"}
          >
            Sifts
          </SidebarLink>
        </TooltipProvider>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <ThemeSwitch />
            </TooltipTrigger>
            <TooltipContent side="right">Theme</TooltipContent>
          </Tooltip>
          <SidebarLink
            href="/settings"
            icon={<Settings className="h-5 w-5" />}
            active={pathname === "/settings"}
          >
            Settings
          </SidebarLink>
        </TooltipProvider>
      </nav>
    </aside>
  );
}

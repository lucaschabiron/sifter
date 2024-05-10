import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Home, FileText, Settings, TestTubeDiagonal, Menu } from "lucide-react";
import { AccountDropdown } from "./accountDropdown";
import { ThemeSwitch } from "../themeSwitch";
import { DashboardBreadcrumb } from "./dashboardBreadcrumb";
import { HeaderLink } from "./headerLink";

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <HeaderLink href="/dashboard" icon={<Home />} active={true}>
              Home
            </HeaderLink>
            <HeaderLink href="/sifts" icon={<FileText />} active={false}>
              Sifts
            </HeaderLink>
            <ThemeSwitch />
          </nav>
        </SheetContent>
      </Sheet>
      <DashboardBreadcrumb />

      <div className="ml-auto">
        <AccountDropdown />
      </div>
    </header>
  );
}
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LaunchAppButton } from "./launchAppButton";
import Image from "next/image";
import logo from "./logo.png";

export function Header() {
  return (
    <header className=" w-screen fixed px-6 h-20 flex items-center">
      <Link className="flex items-center justify-center" href="/">
        <Image alt="sifter logo" src={logo} width={40} height={40} />
        <span className="ml-2 text-xl text-white font-bold">sifter</span>
      </Link>
      <div className="ml-auto">
        <LaunchAppButton />
      </div>
    </header>
  );
}

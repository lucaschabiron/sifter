import { Landing } from "@/components/marketing/landing";
import { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "black",
};

export default function Page() {
  return <Landing />;
}

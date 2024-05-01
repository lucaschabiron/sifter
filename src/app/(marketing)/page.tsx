import { Landing } from "@/components/landing";
import { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "black",
};

export default function Page() {
  return <Landing />;
}

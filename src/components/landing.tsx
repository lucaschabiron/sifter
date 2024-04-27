"use client";
import { Button } from "@/components/ui/button";
import { Header } from "./header";
import { Waitlist } from "./waitlist";
import { Footer } from "./footer";
import Image from "next/image";

export function Landing() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Header />
      <div className="flex-1 "></div>
      <main className="flex-1">
        <section className="w-full bg-[url(/reading.jpg)] bg-cover bg-bottom">
          <div className="py-60 px-[5%] bg-gradient-to-b from-black/70 via-black/70 to-black bg-cover w-full h-full">
            <div className="container px-4 md:px-6 text-center">
              <div className="max-w-3xl mx-auto space-y-6">
                <h1 className="gradient-text text-5xl font-bold tracking-tight text-center text-gray-50 sm:text-5xl md:text-7xl">
                  Sift Through the Noise, Stay in the Know.
                </h1>
                <Button
                  className="w-full sm:w-auto bg-gray-300"
                  variant="outline"
                  onClick={() =>
                    document
                      .getElementById("waitlist")!
                      .scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Join our Waitlist
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mt-40">
              <div className="border-l my-6 pl-6 border-white/50">
                <h3 className="text-4xl gradient-text font-bold w-fit tracking-tight text-balance">
                  Tailored News, Just for You
                </h3>
                <p className="text-gray-300 mt-2">
                  Choose from a wide range of topics and receive a personalized
                  newsletter with the latest news and insights that matter to
                  you.
                </p>
              </div>
              <div className="border-l my-6 pl-6 border-white/50">
                <h3 className="text-4xl gradient-text font-bold w-fit tracking-tight text-balance">
                  AI-Driven Insights at Your Fingertips
                </h3>
                <p className="text-gray-300 mt-2">
                  Our AI-powered system analyzes the news and delivers concise,
                  insightful summaries that help you stay informed.
                </p>
              </div>
              <div className="border-l my-6 pl-6 border-white/50">
                <h3 className="text-4xl gradient-text font-bold w-fit tracking-tight text-balance">
                  Your News, Your Way
                </h3>
                <p className="text-gray-300 mt-2">
                  Customize your newsletter preferences, give feedback to your
                  assistant, and enjoy a personalized news experience tailored
                  to your wants and needs.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full pb-12 md:pb-24 lg:pb-32 bg-black">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <Image
                  alt="AI Newsletter"
                  className="rounded-xl"
                  height="400"
                  src="/newsletter.jpg"
                  style={{
                    aspectRatio: "500/400",
                    objectFit: "cover",
                  }}
                  width="700"
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-2 border-l border-gray-800 pl-4">
                  <h2 className="text-5xl gradient-text font-bold tracking-tight text-gray-50">
                    Tailored to Your Interests
                  </h2>
                  <p className="text-gray-400">
                    Our AI-powered newsletter curation system analyzes your
                    preferences and delivers content that is relevant and
                    engaging to you.
                  </p>
                </div>
                <div className="space-y-2 border-l border-gray-800 pl-4">
                  <h2 className="text-5xl gradient-text font-bold tracking-tight text-gray-50">
                    Stay Informed, Effortlessly
                  </h2>
                  <p className="text-gray-400">
                    Receive a daily or weekly newsletter packed with the latest
                    news, insights, and trends in your areas of interest,
                    without the hassle of sifting through endless content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Waitlist />
        <Footer />
      </main>
    </div>
  );
}



import type { Metadata } from "next";
import HomeContent from "@/components/HomeContent";

export const metadata: Metadata = {
  title: "MIP Land — Interactive Monad Improvement Proposals",
  description:
    "Interactive explainers for Monad Improvement Proposals. Understand MIPs through visualizations, not just specs.",
  openGraph: {
    title: "MIP Land — Interactive Monad Improvement Proposals",
    description:
      "Interactive explainers for Monad Improvement Proposals. Understand MIPs through visualizations, not just specs.",
  },
};

export default function HomePage() {
  return <HomeContent />;
}

import type { Metadata } from "next";
import { ExplainModeProvider } from "@/components/bte/ExplainModeContext";
import ModeToggle from "@/components/bte/ModeToggle";
import BteHeroSection from "@/components/bte/BteHeroSection";
import WhatIsBteSection from "@/components/bte/WhatIsBteSection";
import EncryptedMempoolSection from "@/components/bte/EncryptedMempoolSection";
import ComparisonSection from "@/components/bte/ComparisonSection";
import PropertiesSection from "@/components/bte/PropertiesSection";
import ConstructionSection from "@/components/bte/ConstructionSection";
import BenchmarksSection from "@/components/bte/BenchmarksSection";
import BteFooterSection from "@/components/bte/BteFooterSection";

export const metadata: Metadata = {
  title: "BTX: Batched Threshold Encryption",
  description:
    "An interactive overview of BTX, Category Labs' new Batched Threshold Encryption scheme. Shortest ciphertext, collision-free, epochless, and fast enough for encrypted mempools.",
  openGraph: {
    title: "BTX: Batched Threshold Encryption",
    description:
      "Category Labs' new BTE scheme: shortest ciphertext, collision-free, epochless, and fast enough for encrypted mempools.",
  },
};

export default function BtePage() {
  return (
    <ExplainModeProvider>
      <ModeToggle />
      <main>
        <BteHeroSection />
        <WhatIsBteSection />
        <EncryptedMempoolSection />
        <ComparisonSection />
        <PropertiesSection />
        <ConstructionSection />
        <BenchmarksSection />
        <BteFooterSection />
      </main>
    </ExplainModeProvider>
  );
}

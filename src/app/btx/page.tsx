import type { Metadata } from "next";
import { ExplainModeProvider } from "@/components/btx/ExplainModeContext";
import ModeToggle from "@/components/btx/ModeToggle";
import BteHeroSection from "@/components/btx/BteHeroSection";
import WhatIsBteSection from "@/components/btx/WhatIsBteSection";
import EncryptedMempoolSection from "@/components/btx/EncryptedMempoolSection";
import ComparisonSection from "@/components/btx/ComparisonSection";
import PropertiesSection from "@/components/btx/PropertiesSection";
import ConstructionSection from "@/components/btx/ConstructionSection";
import BenchmarksSection from "@/components/btx/BenchmarksSection";
import BteFooterSection from "@/components/btx/BteFooterSection";

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

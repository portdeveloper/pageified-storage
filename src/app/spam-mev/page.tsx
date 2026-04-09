import type { Metadata } from "next";
import SpamHeroSection from "@/components/spam-mev/SpamHeroSection";
import WhatIsSpamSection from "@/components/spam-mev/WhatIsSpamSection";
import EquilibriumSection from "@/components/spam-mev/EquilibriumSection";
import DesignLeversSection from "@/components/spam-mev/DesignLeversSection";
import SpamFooterSection from "@/components/spam-mev/SpamFooterSection";

export const metadata: Metadata = {
  title: "Spam MEV: Blockspace Under Pressure",
  description:
    "An interactive explainer for the Spam MEV equilibrium model. Explore how block capacity, gas price floors, and transaction ordering shape spam volumes on high-throughput blockchains.",
  openGraph: {
    title: "Spam MEV: Blockspace Under Pressure",
    description:
      "An interactive explainer for the Spam MEV equilibrium model. Explore how block capacity, gas price floors, and transaction ordering shape spam volumes.",
  },
};

export default function SpamMevPage() {
  return (
    <main>
      <SpamHeroSection />
      <WhatIsSpamSection />
      <EquilibriumSection />
      <DesignLeversSection />
      <SpamFooterSection />
    </main>
  );
}

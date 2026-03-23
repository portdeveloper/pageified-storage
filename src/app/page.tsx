import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import PageMappingSection from "@/components/PageMappingSection";
import MerkleTreeSection from "@/components/MerkleTreeSection";
import GasCalculatorSection from "@/components/GasCalculatorSection";
import TakeawaysSection from "@/components/TakeawaysSection";
import CompatibilitySection from "@/components/CompatibilitySection";
import FooterSection from "@/components/FooterSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <PageMappingSection />
      <MerkleTreeSection />
      <GasCalculatorSection />
      <TakeawaysSection />
      <CompatibilitySection />
      <FooterSection />
    </main>
  );
}

import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import PageMappingSection from "@/components/PageMappingSection";
import MerkleTreeSection from "@/components/MerkleTreeSection";
import GasCalculatorSection from "@/components/GasCalculatorSection";
import UniswapV2Section from "@/components/UniswapV2Section";
import CherryPickedSection from "@/components/CherryPickedSection";
import StepperSection from "@/components/StepperSection";
import TakeawaysSection from "@/components/TakeawaysSection";
import CompatibilitySection from "@/components/CompatibilitySection";
import FooterSection from "@/components/FooterSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <UniswapV2Section />
      <CherryPickedSection />
      <ProblemSection />
      <SolutionSection />
      <PageMappingSection />
      <MerkleTreeSection />
      <GasCalculatorSection />
      <StepperSection />
      <TakeawaysSection />
      <CompatibilitySection />
      <FooterSection />
    </main>
  );
}

import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import PageMappingSection from "@/components/PageMappingSection";
import GasCalculatorSection from "@/components/GasCalculatorSection";
import CherryPickedSection from "@/components/CherryPickedSection";
import StepperSection from "@/components/StepperSection";
import TakeawaysSection from "@/components/TakeawaysSection";
import CompatibilitySection from "@/components/CompatibilitySection";
import FooterSection from "@/components/FooterSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <GasCalculatorSection />
      <StepperSection />
      <CherryPickedSection />
      <PageMappingSection />
      <TakeawaysSection />
      <CompatibilitySection />
      <FooterSection />
    </main>
  );
}

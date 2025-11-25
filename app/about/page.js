import PageShell from "../../components/PageShell";
import SectionHeader from "../../components/SectionHeader";
import AboutSection from "../../components/AboutSection";

export const metadata = {
  title: "About Us | Vidhatha Society",
  description:
    "Learn about the mission, values, and dedicated team behind Vidhatha Society.",
};

export default function About() {
  return (
    <PageShell>
      <SectionHeader
        eyebrow="About us"
        title="The story of"
        highlight="Vidhatha Society"
        description="Vidhatha Society is a community-driven organisation focused on education, women’s empowerment, health, and humanitarian aid."
      />

      {/* Whatever you already have inside AboutSection will now sit in this styled shell */}
      <div className="rounded-2xl bg-white border border-[#F2C41133] shadow-sm p-5 md:p-6">
        <AboutSection />
      </div>
    </PageShell>
  );
}

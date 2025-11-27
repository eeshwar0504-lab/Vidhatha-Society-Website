import PageShell from "../../components/PageShell";
import SectionHeader from "../../components/SectionHeader";

export const metadata = {
  title: "About Us | Vidhatha Society",
  description:
    "Learn about the mission, values, and dedicated team behind Vidhatha Society.",
};

export default function About() {
  // 👇 Real team members
  const president = {
    name: "Geeni Srilatha",
    title: "President",
    description:
      "Provides leadership and vision to ensure Vidhatha Society’s initiatives stay rooted in compassion, transparency, and long-term community impact.",
  };

  const otherMembers = [
    {
      name: "Jangam Sulochana",
      title: "Vice President",
      description:
        "Supports strategic planning, oversees on-ground execution of key programmes, and strengthens partnerships with communities and supporters.",
    },
    {
      name: "J E Keyura Manvi",
      title: "General Secretary",
      description:
        "Manages coordination, documentation, and communication so that all activities and records are organised and transparent.",
    },
    {
      name: "J E Hardhek Palguna Sakka",
      title: "Joint Secretary",
      description:
        "Assists in programme execution, reporting, and administration to ensure timely and effective implementation of initiatives.",
    },
    {
      name: "J J Maheshwar",
      title: "Treasurer",
      description:
        "Oversees financial planning and utilisation of funds with integrity, ensuring every contribution reaches the right cause.",
    },
    {
      name: "Mangapally Srikala",
      title: "Executive Member",
      description:
        "Actively supports events, outreach, and welfare activities to strengthen engagement with beneficiaries and volunteers.",
    },
    {
      name: "Harivanam Shashi Rekha",
      title: "Executive Member",
      description:
        "Works closely with the team to support welfare programmes and ensure timely assistance to those in need.",
    },
  ];

  return (
    <PageShell>
      <SectionHeader
        eyebrow="About us"
        title="The story of"
        highlight="Vidhatha Society"
        description="Vidhatha Society is a community-driven organisation focused on education, women’s empowerment, health, and humanitarian aid."
      />

      {/* 1️⃣ About Us */}
      <section className="mt-10 mb-10">
        <div className="container mx-auto px-4 max-w-5xl text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            About Us
          </h2>
          <p className="text-sm md:text-base text-gray-700 max-w-3xl mx-auto">
            Behind every successful initiative at Vidhatha Society is a team of
            passionate and dedicated individuals.
          </p>
        </div>
      </section>

      {/* 2️⃣ Our Vision */}
      <section className="mb-10 bg-gradient-to-b from-[#FFFDF5] via-[#FFF7E0] to-[#FFEEC2] py-8 md:py-10 rounded-2xl border border-yellow-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#D62828] mb-2">
            Our Vision
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Vision
          </h2>
          <p className="text-sm md:text-base leading-relaxed text-gray-700 max-w-3xl">
            To build a compassionate and sustainable society where every person
            has access to nutritious food, clean water, quality education,
            healthcare, and a safe environment — enabling them to live with
            dignity, equality, and limitless opportunity.
          </p>
        </div>
      </section>

      {/* 3️⃣ Our Mission */}
      <section className="mb-10 py-8 md:py-10 bg-white rounded-2xl border border-gray-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#D62828] mb-2">
            Our Mission
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Mission
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Serving the Needy */}
            <div className="rounded-2xl border border-yellow-100 bg-[#FFFBF2] p-5 shadow-sm">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                Serving the Needy
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                To support homeless individuals, daily-wage earners,
                underprivileged families, and the elderly by providing
                nutritious food, essential resources, and timely assistance
                during crises.
              </p>
            </div>

            {/* Promoting Education */}
            <div className="rounded-2xl border border-blue-100 bg-[#F4F7FF] p-5 shadow-sm">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                Promoting Education
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                To empower children and youth with access to quality education
                through academic support, digital learning, and
                skill-development programs that prepare them for a brighter
                future.
              </p>
            </div>

            {/* Environmental Protection */}
            <div className="rounded-2xl border border-green-100 bg-[#F3FBF5] p-5 shadow-sm">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                Environmental Protection
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                To protect and preserve the environment through seed-ball
                initiatives, plantation drives, cleanliness campaigns, and
                sustainable living awareness — reducing pollution and plastic
                usage.
              </p>
            </div>

            {/* Community Welfare */}
            <div className="rounded-2xl border border-purple-100 bg-[#F8F5FF] p-5 shadow-sm">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                Community Welfare
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                To enhance the well-being of vulnerable communities by
                organizing health camps, women &amp; child welfare programs,
                and awareness initiatives that foster a healthier, safer
                society.
              </p>
            </div>

            {/* Encouraging Volunteerism */}
            <div className="rounded-2xl border border-pink-100 bg-[#FFF5FA] p-5 shadow-sm md:col-span-2">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                Encouraging Volunteerism
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                To cultivate a strong community of compassionate volunteers by
                encouraging social participation, fostering empathy, and
                inspiring collective action for meaningful change.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4️⃣ Our Mission & Values + Our Commitment */}
      <section className="mb-10">
        <div className="container mx-auto px-4 max-w-5xl text-center space-y-4">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900">
            Our Mission &amp; Values
          </h3>
          <p className="text-sm md:text-base text-gray-700 max-w-3xl mx-auto">
            Our team comprises diverse talents, each contributing unique skills
            and perspectives. Together, we collaborate harmoniously to implement
            projects that address pressing issues, striving to leave a lasting
            positive impact on the communities we serve.
            <br />
            <br />
            Explore the history of Vidhatha Society, understand our unwavering
            values, and meet the incredible individuals who form our dedicated
            team.
          </p>

          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mt-6">
            Our Commitment
          </h3>
          <p className="text-sm md:text-base text-gray-700 max-w-3xl mx-auto">
            Join us on our journey towards creating a world where collective
            action drives transformative change, and everyone can envision a
            brighter and more equitable future.
            <br />
            <br />
            Thank you for being a part of the Vidhatha Society community.
          </p>
        </div>
      </section>

      {/* 5️⃣ Our Core Team – President full width + others below */}
      <section className="mb-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-6 md:mb-8">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#D62828] mb-2">
              Our Team
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Our Core Team
            </h2>
            <p className="text-sm md:text-base text-gray-700 max-w-3xl mx-auto">
              Vidhatha Society is guided by a committed leadership team that
              ensures every initiative is thoughtfully planned, transparently
              executed, and rooted in service to the community.
            </p>
          </div>

          {/* ⭐ President Full-Width Highlight */}
          <div className="mb-8 rounded-2xl border border-[#F2C411] bg-[#FFF9E6] shadow-md p-6 md:p-7 text-center">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
              {president.name}
            </h3>
            <p className="text-xs md:text-sm font-semibold text-[#B45309] mb-3 uppercase tracking-wide">
              {president.title}
            </p>
            <p className="text-sm md:text-base text-gray-700 max-w-3xl mx-auto leading-relaxed">
              {president.description}
            </p>
          </div>

          {/* 👥 Other Members in Grid */}
          <div className="grid md:grid-cols-3 gap-5">
            {otherMembers.map((member) => (
              <div
                key={member.name}
                className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 flex flex-col h-full"
              >
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-xs font-medium text-gray-500 mb-2">
                  {member.title}
                </p>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

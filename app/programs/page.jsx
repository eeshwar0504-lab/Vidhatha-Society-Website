export const metadata = {
  title: "Programs | Vidhatha Society",
  description: "Explore various programs run by Vidhatha Society for community welfare.",
};

export default function ProgramsPage() {
  const programs = [
    "Free Food Distribution",
    "Funeral Services",
    "Awareness Programs",
    "Health Programs",
    "Health Awareness Programs",
    "Environmental Protection Programs",
    "Culture, Art and Traditional Programs",
    "Disable People Programs",
    "Senior Citizen Programs",
    "Youth Programs",
    "Skill Development Programs",
    "Women & Child Welfare Programs",
    "Rural & Urban Development Programs",
    "Counselling Programs",
    "Special Day Celebrations",
    "Distributions and Donations",
    "Other Programs",
  ];

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
        Our Programs
      </h1>
      <p className="text-gray-600 max-w-2xl mx-auto text-center mb-10">
        Vidhatha Society runs a variety of community-oriented programs dedicated to 
        empowering lives and uplifting society. Explore the different initiatives below.
      </p>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {programs.map((program, index) => (
          <div
            key={index}
            className="border rounded-xl p-4 text-center shadow-sm hover:shadow-md transition bg-white"
          >
            <h3 className="font-medium text-gray-800">{program}</h3>
          </div>
        ))}
      </div>
    </main>
  );
}

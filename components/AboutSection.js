export default function AboutSection() {
  return (
    <div>
      {/* Hero/About Banner */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-6">About Us</h1>
          <p className="text-xl text-primary-100">
            Behind every successful initiative at Vidhatha Society is a team of passionate and dedicated individuals.
          </p>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Our Mission & Values</h2>
          <p className="text-gray-700 mb-6 text-lg text-center">
            Our team comprises diverse talents, each contributing unique skills and perspectives. Together, we collaborate harmoniously to implement projects that address pressing issues, striving to leave a lasting positive impact on the communities we serve.
          </p>
          <p className="text-gray-700 text-lg text-center">
            Explore the history of Vidhatha Society, understand our unwavering values, and meet the incredible individuals who form our dedicated team.
          </p>
        </div>
      </section>

      {/* Team Philosophy */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment</h2>
          <p className="text-gray-700 text-lg mb-6">
            Join us on our journey towards creating a world where collective action drives transformative change, and everyone can envision a brighter and more equitable future.
          </p>
        </div>
      </section>

      {/* Thank You */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4 max-w-xl text-center">
          <p className="text-primary-600 text-lg font-semibold">
            Thank you for being a part of the Vidhatha Society community.
          </p>
        </div>
      </section>
    </div>
  );
}
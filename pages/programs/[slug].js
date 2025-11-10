import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import DonateButton from '../../components/DonateButton';
import Link from 'next/link';
import programsData from '../../data/programs.json';

export default function ProgramDetail() {
  const router = useRouter();
  const { slug } = router.query;

  const program = programsData.find((p) => p.slug === slug);

  if (!program) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Program Not Found</h1>
          <Link href="/programs" className="text-primary-600 hover:underline">
            Back to Programs
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={`${program.title} - Our Programs`}
        description={program.description}
      />

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-4">
            <Link href="/programs" className="text-primary-100 hover:text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Programs
            </Link>
          </div>
          <h1 className="text-5xl font-heading font-bold mb-4">{program.title}</h1>
          <p className="text-xl text-primary-100">{program.subtitle}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="prose prose-lg max-w-none">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">About This Program</h2>
                <p className="text-gray-600 mb-6">{program.description}</p>

                <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What We Do</h3>
                <ul className="space-y-3">
                  {program.activities.map((activity, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-6 h-6 text-primary-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{activity}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Impact</h3>
                <p className="text-gray-600">{program.impact}</p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Program Stats</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-primary-600">{program.stats.beneficiaries}</div>
                    <div className="text-sm text-gray-600">Beneficiaries Served</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary-600">{program.stats.locations}</div>
                    <div className="text-sm text-gray-600">Locations</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary-600">{program.stats.years}</div>
                    <div className="text-sm text-gray-600">Years Active</div>
                  </div>
                </div>
              </div>

              <div className="bg-primary-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Support This Program</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Your donation directly supports {program.title.toLowerCase()} initiatives in our community.
                </p>
                <DonateButton />
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Get Involved</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Join us as a volunteer and make a direct impact.
                </p>
                <Link
                  href="/volunteer"
                  className="block w-full px-4 py-2 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-semibold text-center hover:bg-primary-50 transition-colors"
                >
                  Volunteer Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export async function getStaticPaths() {
  const paths = programsData.map((program) => ({
    params: { slug: program.slug },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  return {
    props: {
      slug: params.slug,
    },
  };
}

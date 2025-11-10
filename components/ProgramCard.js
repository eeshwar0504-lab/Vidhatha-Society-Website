import Link from 'next/link';

export default function ProgramCard({ program }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="h-48 bg-gradient-to-br from-primary-400 to-primary-600"></div>
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{program.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{program.description}</p>
        <Link
          href={`/programs/${program.slug}`}
          className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold"
        >
          Learn More
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

import Link from 'next/link';

export default function DonateButton({ className = '' }) {
  return (
    <Link
      href="/donate"
      className={`inline-block px-8 py-4 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-700 transition-colors ${className}`}
    >
      Donate Now
    </Link>
  );
}

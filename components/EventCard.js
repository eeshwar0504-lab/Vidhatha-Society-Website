import Link from 'next/link';

export default function EventCard({ event, isPast = false }) {
  const eventDate = new Date(event.date);

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow ${isPast ? 'opacity-75' : ''}`}>
      <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600"></div>
      <div className="p-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{event.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{event.time}</span>
          <Link
            href={`/events/${event.slug}`}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            {isPast ? 'View Details' : 'RSVP Now'} →
          </Link>
        </div>
      </div>
    </div>
  );
}

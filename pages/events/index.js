import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import EventCard from '../../components/EventCard';
import eventsData from '../../data/events.json';

export default function Events() {
  const now = new Date();
  const upcomingEvents = eventsData.filter(e => new Date(e.date) >= now);
  const pastEvents = eventsData.filter(e => new Date(e.date) < now);

  return (
    <Layout>
      <SEO
        title="Events - Join Our Community Initiatives"
        description="Discover and participate in our upcoming community events, workshops, and awareness campaigns."
      />

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-5xl font-heading font-bold mb-6">Community Events</h1>
          <p className="text-xl text-primary-100">
            Join us in our mission through workshops, fundraisers, and community gatherings
          </p>
        </div>
      </section>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-8">Upcoming Events</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-8">Past Events</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-75">
              {pastEvents.map((event) => (
                <EventCard key={event.slug} event={event} isPast={true} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* No Events */}
      {upcomingEvents.length === 0 && pastEvents.length === 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <p className="text-gray-600 text-lg">No events scheduled at the moment. Check back soon!</p>
          </div>
        </section>
      )}
    </Layout>
  );
}

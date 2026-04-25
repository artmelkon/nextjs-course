import Head from "next/head";
import { getFeaturedEvents } from "@/utils/api-utils";
import EventList from "@/components/events/EventList";
import NewsletterRegistration from "@/components/input/newsletter-registration";

export type Event = {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  isFeatured: boolean;
  image: string;
}

interface EventsProps {
  events: Event[]
}
const Home: React.FC<EventsProps> = ({events}) => {
  return (
    <div>
      <Head>
        <title>NextJS Course Events</title>
        <meta name="description" content="NextJS framework is a great addition to the skillset" />
      </Head>
      <NewsletterRegistration />
      <EventList items={events} />
    </div>
  );
};

export async function getStaticProps() {
  try {
    const featuredEvents = await getFeaturedEvents();
    return {
      props: {
        events: featuredEvents,
      },
    };
  } catch (err) {
    return { props: { events: [] } };
  }
}

export default Home;

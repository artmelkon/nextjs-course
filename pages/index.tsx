import Head from "next/head";
import { getAllEvents } from "../utils/api-utils";
import EventList from "@/components/events/EventList";

export interface Event {
  events: {
    id: string;
    title: string;
    description: string;
    location: string;
    date: string;
    isFeatured: boolean;
  };
}
const Home: React.FC<Event> = (props) => {
  return (
    <div>
      <Head>
        <title>NextJS Course Events</title>
        <meta name="description" content="NextJS framework is a greate addition to the skillset" />
      </Head>
      <EventList items={props.events} />
    </div>
  );
};

export async function getStaticProps() {
  const featuredEvents = await getAllEvents();

  return {
    props: {
      events: featuredEvents,
    },
  };
}

export default Home;

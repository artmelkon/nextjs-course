import { Fragment } from "react";
import { useRouter } from "next/router";
import { getAllEvents } from "@/utils/api-utils";
import EventList from "@/components/events/EventList";
import Search from "@/components/ui/Search";
import Head from "next/head";
import { Event as EventType } from "@/pages";

interface EventProps {
  event: EventType[]
}

const Events = ({events}: any) => {
  const router = useRouter();

  function findEventHandler(year: string, month: string) {
    const fullPath = `/events/${year}/${month}`;

    router.push(fullPath)
  }

  return (
    <Fragment>
      <Head>
        <title>Events Home</title>
        <meta name="description" content="Events page where we inject event list compoent" />
      </Head>
      <Search onSearch={findEventHandler} />
      <EventList items={events} />
    </Fragment>
  )
}

export async function getStaticProps() {
  try {
    const events = await getAllEvents();
    return {
      props: {
        events,
      },
      revalidate: 60
    };
  } catch (err) {
    return { props: { events: [] } };
  }
}

export default Events;

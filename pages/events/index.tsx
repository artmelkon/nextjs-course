import { Fragment } from "react";
import { useRouter } from "next/router";
import { getAllEvents } from "@/utils/api-utils";
import EventList from "@/components/events/EventList";
import Search from "@/components/ui/Search";
import Head from "next/head";
import { Event as EventType} from "../index";

interface EventProps {
  event: EventType[]
}

const Events = ({events}: any) => {
  const router = useRouter();

  function findEventHandler(year: number, month: number) {
    const fullPath = `/events/${year}/${month}`;

    router.push(fullPath)
  }

  return (
    <Fragment>
      <Head>
        <title>Events Home</title>
        <meta name="descripton" content="Events page where we inject event list compoent" />
      </Head>
      <Search onSearch={findEventHandler} />
      <EventList items={events} />
    </Fragment>
  )
}

export async function getStaticProps() {
  const events = await getAllEvents();

  return {
    props: {
      events,
    },
    revalidate: 60
  }
}

export default Events;

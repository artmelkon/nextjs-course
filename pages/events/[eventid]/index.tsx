import React, { Fragment } from "react";
import Head from "next/head";
import { getEventById, getFeaturedEvents } from "@/utils/api-utils";
import EventSummary from "@component/event-detail/event-summary";
import EventLogistics from "@component/event-detail/event-logistics";
import EventContent from "@component/event-detail/event-content";
import Comments from "@component/input/comments";
import { Event as EventType } from "@/pages";

interface SelectedEventProps {
  selectedEvent: EventType;
}

const SelectedEvent: React.FC<SelectedEventProps> = ({ selectedEvent }) => {
  const event = selectedEvent;

  if (!event) {
    return (
      <div className="center">
        <p>Loading...!</p>
      </div>
    );
  }

  return (
    <Fragment>
      <Head>
        <title>{event.title}</title>
        <meta
          name="description"
          content="Events page where we inject event list compoent"
        />
      </Head>
      <EventSummary title={event.title} />
      <EventLogistics {...event} />
      <EventContent>
        <p>{event.description}</p>
      </EventContent>
      <Comments eventId={event.id} />
    </Fragment>
  );
};

export async function getStaticProps(context: any) {
  const eventId = context.params.eventId;
  const event = await getEventById(eventId);
  return {
    props: {
      selectedEvent: event,
    },
    revalidate: 18000,
    notFound: Boolean(!event ? true : false),
  };
}

export async function getStaticPaths() {
  const events = await getFeaturedEvents();

  const paths = events.map((event) => ({ params: { eventId: event.id } }));

  return {
    paths,
    fallback: "blocking",
  };
}

export default SelectedEvent;

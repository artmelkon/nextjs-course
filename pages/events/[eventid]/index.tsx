import React, { Fragment } from "react";
import Head from "next/head";
import { getEventById, getFeaturedEvents } from "@/utils/api-utils";
import EventSummary from "@/components/event-detail/event-summary";
import EventLogistics from "@/components/event-detail/event-logistics";
import EventContent from "@/components/event-detail/event-content";
import { Event } from "@/pages"; // Event types

const SelectedEvent: React.FC<Event[]> = (props) => {
  const event = props.selectedEvent;

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
        <meta name="descripton" content="Events page where we inject event list compoent" />
      </Head>
      <EventSummary title={event.title} />
      <EventLogistics {...event} />
      <EventContent>
        <p>{event.description}</p>
      </EventContent>
    </Fragment>
  );
};

export async function getStaticProps(context) {
  const eventId = context.params.eventId;
  const event = await getEventById(eventId);
  return {
    props: {
      selectedEvent: event,
    },
    revalidate: 18000,
    notFound: Boolean(!event ? true : false)
  };
}

export async function getStaticPaths() {
  const events = await getFeaturedEvents();

  const paths = events.map((event) => ({ params: { eventId: event.id } }));

  return {
    paths,
    fallback: 'blocking'
  };
}

export default SelectedEvent;

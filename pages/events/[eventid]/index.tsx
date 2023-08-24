import { Fragment } from "react";
import { useRouter } from "next/router";
import { getEventById } from "@/dummy-data";
import EventSummary from "@/components/event-detail/event-summary";
import EventLogistics from "@/components/event-detail/event-logistics";
import EventContent from "@/components/event-detail/event-content";
import ErrorAlert from "@/components/ui/error-alert/error-alert";

const SelectedEvent = (props) => {
  const router = useRouter();
  const event = getEventById(router.query.eventid);
  if (!event) {
    return (
        <ErrorAlert>
          <p>No event found for this selection!</p>
        </ErrorAlert>
    );
  }

  return (
    <Fragment>
      <EventSummary title={event.title} />
      <EventLogistics {...event} />
      <EventContent>
        <p>{event.description}</p>
      </EventContent>
    </Fragment>
  );
};

export default SelectedEvent;

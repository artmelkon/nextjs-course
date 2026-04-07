import React from "react";
import EventItem from "./EventItem";
import classes from "./EventList.module.css";
import { Event as EventType } from "@/pages";

interface EventProps {
  items: EventType[];
}

const EventList: React.FC<EventProps> = ({ items }) => {
  const validEvents = Array.isArray(items)
    ? items.filter((e) => e.id && e.title && e.date)
    : [];

  if (validEvents.length === 0) {
    return <p className="center">No events found.</p>;
  }

  return (
    <ul className={classes.list}>
      {validEvents.map((event: any) => (
        <EventItem key={event.id} {...event} />
      ))}
    </ul>
  );
};

export default EventList;

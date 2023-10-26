import React from "react";
import EventItem from "./EventItem";
import classes from "./EventList.module.css";
import { Event as EventType } from "../../pages";

interface EventProps {
  items: EventType[];
}

const EventList: React.FC<EventProps> = ({ items }) => {
  return (
    <ul className={classes.list}>
      {Array.isArray(items) &&
        items.map((event: any) => <EventItem key={event.id} {...event} />)}
    </ul>
  );
};

export default EventList;

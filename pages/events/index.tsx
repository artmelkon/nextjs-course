import { Fragment } from "react";
import { useRouter } from "next/router";
import { getAllEvents } from "@/dummy-data";
import EventList from "@/components/events/EventList";
import Search from "@/components/ui/Search";

const Events = () => {
  const router = useRouter();
  const allEvents = getAllEvents();
  function findEventHandler(year: number, month: number) {
    console.log(year)
    const fullPath = `/events/${year}/${month}`;

    router.push(fullPath)
  }

  return (
    <Fragment>
      <Search onSearch={findEventHandler} />
      <EventList items={allEvents} />
    </Fragment>
  )
}

export default Events;

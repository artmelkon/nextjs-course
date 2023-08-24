import { Fragment } from "react";
import { useRouter } from "next/router";
import {getFilteredEvents} from '@/dummy-data';
import EventList from "@/components/events/EventList";
import ResultsTitle from "@/components/results-title/results-title";
import Button from "@/components/ui/Button";
import ErrorAlert from "@/components/ui/error-alert/error-alert";

const FilteredEvents = () => {
  const router = useRouter();
  const filterData = router.query.slug
  console.log('filter data ', filterData)
  const numYear = +filterData?.slice(0, 1);
  const numMonth = +filterData?.slice(1, 2);

  if(!filterData) return <p className="center">Loading...!</p>
  if(isNaN(numYear) || isNaN(numMonth) || numYear > 2030 || numYear < 2021 || numMonth < 1 || numMonth > 12) {
    return(
      <Fragment>
        <ErrorAlert>
          <p>Invalid Date Ragen. Adjust you query!</p>
        </ErrorAlert>
        <div className="center">
          <Button url="/events">Shaw All Events</Button>
        </div>
      </Fragment>
    )
  };

  const filteredData = getFilteredEvents({year: numYear, month: numMonth});
  if(!filteredData || filteredData.length === 0) {
    return (
      <Fragment>
        <ErrorAlert>
          <p>No events found!</p>
        </ErrorAlert>
        <div className="center">
          <Button url="/events">Shaw All Events</Button>
        </div>
      </Fragment>
    )
  }

  const date = new Date(numYear, numMonth -1);

  return (
    <Fragment>
      <ResultsTitle date={date} />
      <EventList items={filteredData} />
    </Fragment>
  )
}

export default FilteredEvents;

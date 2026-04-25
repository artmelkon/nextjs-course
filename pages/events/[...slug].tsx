import React, { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import Head from "next/head";
import { url } from "@/utils/api-utils";
import EventList from "@/components/events/EventList";
import ResultsTitle from "@/components/results-title/results-title";
import Button from "@/components/ui/Button";
import ErrorAlert from "@/components/ui/error-alert/error-alert";

const FilteredEvents: React.FC = (props) => {
  const [loadedEvents, setLoadedEvents] = useState([]);
  const router = useRouter();
  const filterData: any = router.query?.slug;

  const fetcher = (url: string) => fetch(url).then(res => { if (!res.ok) throw new Error('Fetch failed'); return res.json(); });
  const { data, error, isLoading } = useSWR(url, fetcher);

  useEffect(() => {
    const events: any = [];
    if (data) {
      for (const key of Object.keys(data)) {
        events.push({
          id: key,
          ...data[key],
        });
      }
    }
    setLoadedEvents(events);
  }, [data]);

  let pageHeadData = (
    <Head>
      <title>Filtered Events</title>
      <meta name="description" content={`A list of filtered event.`} />
    </Head>
  );
  if (!loadedEvents || isLoading) {
    return (
      <Fragment>
        {pageHeadData}
        <p className="center">Loading...!</p>;
      </Fragment>
    );
  }

  const numYear: number = +filterData[0];
  const numMonth: number = +filterData[1];

  pageHeadData = (
    <Head>
      <title>Filtered Events</title>
      <meta
        name="description"
        content={`All event for ${numMonth}/${numYear}`}
      />
    </Head>
  );
  if (error) return <p>Unable to Load</p>;
  if (
    isNaN(numYear) ||
    isNaN(numMonth) ||
    numYear > 2030 ||
    numYear < 2021 ||
    numMonth < 1 ||
    numMonth > 12
  ) {
    return (
      <Fragment>
        {pageHeadData}
        <ErrorAlert>
          <p>Invalid Date Range. Adjust your query!</p>
        </ErrorAlert>
        <div className="center">
          <Button url="/events">Show All Events</Button>
        </div>
      </Fragment>
    );
  }

  const filteredData = loadedEvents.filter((event: any) => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getFullYear() === numYear &&
      eventDate.getMonth() === numMonth - 1
    );
  });

  if (!filteredData || filteredData.length === 0) {
    return (
      <Fragment>
        {pageHeadData}
        <ErrorAlert>
          <p>No events found!</p>
        </ErrorAlert>
        <div className="center">
          <Button url="/events">Show All Events</Button>
        </div>
      </Fragment>
    );
  }

  const date = new Date(numYear, numMonth);

  return (
    <Fragment>
      {pageHeadData}
      <ResultsTitle date={date.toISOString()} />
      <EventList items={filteredData} />
    </Fragment>
  );
};

export default FilteredEvents;

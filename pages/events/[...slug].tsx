import React, { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import { getFilteredEvents, url } from "@/utils/api-utils";
import EventList from "@/components/events/EventList";
import ResultsTitle from "@/components/results-title/results-title";
import Button from "@/components/ui/Button";
import ErrorAlert from "@/components/ui/error-alert/error-alert";

const FilteredEvents: React.FC = (props) => {
  const [loadedEvents, setLoadedEvents] = useState();
  const router = useRouter();
  const filterData = router.query.slug;

  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, error, isLoading } = useSWR(url, fetcher);

  useEffect(() => {
    const events = [];
    if (data) {
      for (var key in data) {
        events.push({
          id: key,
          ...data[key],
        });
      }
    }
    setLoadedEvents(events);
  }, [data]);

  console.log(loadedEvents)

  if (!loadedEvents || isLoading) return <p className="center">Loading...!</p>;
  if (error) return <p>Unable to Load</p>;

  const numYear = +filterData[0];
  const numMonth = +filterData[1];

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
        <ErrorAlert>
          <p>Invalid Date Ragen. Adjust you query!</p>
        </ErrorAlert>
        <div className="center">
          <Button url="/events">Shaw All Events</Button>
        </div>
      </Fragment>
    );
  }

  const filteredData = loadedEvents.filter((event) => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getFullYear() === numYear &&
      eventDate.getMonth() === numMonth - 1
    );
  });

  if (!filteredData || filteredData.length === 0) {
    return (
      <Fragment>
        <ErrorAlert>
          <p>No events found!</p>
        </ErrorAlert>
        <div className="center">
          <Button url="/events">Shaw All Events</Button>
        </div>
      </Fragment>
    );
  }

  const date = new Date(numYear, numMonth);

  return (
    <Fragment>
      <ResultsTitle date={date} />
      <EventList items={filteredData} />
    </Fragment>
  );
};

// export async function getServerSideProps(context) {
//   const { params } = context;
//   const filterData = params.slug;
//   const numYear = +filterData.slice(0, 1);
//   const numMonth = +filterData.slice(1, 2);

//   if (
//     isNaN(numYear) ||
//     isNaN(numMonth) ||
//     numYear > 2030 ||
//     numYear < 2021 ||
//     numMonth < 1 ||
//     numMonth > 12
//   ) {
//     return {
//       props: { hasError: true },
//       // notFound: true
//     };
//   }

//   const filteredData = await getFilteredEvents({
//     year: numYear,
//     month: numMonth,
//   });
//   return {
//     props: {
//       events: filteredData,
//       date: {
//         year: numYear,
//         month: numMonth - 1,
//       },
//     },
//   };
// }

// export async function getStaticProps(context) {
//   const slug = context.params?.slug;
//   console.log(slug)

//   const event = await getFilteredEvents(slug)

//   return {
//     props: {
//       filteredEvent: event
//     },
//     revalidate: 1800
//   }
// }

// export async function getStaticPaths() {
//   const events = await getAllEvents();
//   console.log(events)
//   const paths = events.map(({slug}) => ({params: {slug: [slug]}}));
//   console.log(paths)
//   // const paths = events.map(({slug}) =>( {params: {slug: [slug[0], slug[1]]}}));

//   return {
//     paths,
//     fallback: false
//   }
// }

export default FilteredEvents;

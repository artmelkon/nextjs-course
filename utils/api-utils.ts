
import { Event } from '@/pages/index';

export const url =
  `https://nextjs-course-6e2ac-default-rtdb.firebaseio.com/events.json?auth=${process.env.FIREBASE_SECRET}`;

export async function getAllEvents(): Promise<Event[]> {
  const result = await fetch(url);
  const data = await result.json();

  let eventsList: Event[] = [];
  for (var key in data) {
    eventsList.push({ id: key, ...data[key] });
  }

  return eventsList;
}

export async function getFeaturedEvents(): Promise<Event[]> {
  const allEvents = await getAllEvents();
  return allEvents.filter((event) => event.isFeatured);
}

export async function getEventById(id: string): Promise<Event | undefined> {
  const allEvents = await getAllEvents();
  return allEvents.find(event => event.id === id)
}

export async function getFilteredEvents(dateFilter: { year: number; month: number }): Promise<Event[]> {
  const { year, month } = dateFilter;
  const allEvents = await getAllEvents();

  let filteredEvents = allEvents.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate.getFullYear() === year && eventDate.getMonth() === month - 1;
  });

  return filteredEvents;
}

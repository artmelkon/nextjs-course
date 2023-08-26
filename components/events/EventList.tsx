import React from 'react';
import EventItem from './EventItem';
import classes from './EventList.module.css';

const EventList = ({items}) => {
  console.log(items)
  return (
    <ul className={classes.list}>
      {items.map(event => <EventItem key={event.id} {...event} />)}
    </ul>
  )
}

export default EventList;

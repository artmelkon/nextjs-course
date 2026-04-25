import React from 'react';
import classes from './error-alert.module.css';

function ErrorAlert(props: { children: React.ReactNode }) {
  return <div className={classes.alert}>{props.children}</div>;
}

export default ErrorAlert;

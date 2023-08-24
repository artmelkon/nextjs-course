import Link from 'next/link';
import classes from './Button.module.css';

const Button = (props) => {
  if(props.url) {
    return <Link href={props.url} className={classes.btn}>{props.children}</Link>
  }
  return <button className={classes.btn} onClick={props.onClick}>{props.children}</button>
}

export default Button;

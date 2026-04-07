import Link from "next/link";
import classes from "./Button.module.css";

type ButtonProps =
  | { url: string; onClick?: never; children: React.ReactNode }
  | {
      url?: never;
      onClick?: () => void;
      children: React.ReactNode;
      disabled: boolean;
    };

const Button: React.FC<ButtonProps> = (props) => {
  if (props.url) {
    return (
      <Link href={props.url} className={classes.btn}>
        {props.children}
      </Link>
    );
  }
  return (
    <button type="button" className={classes.btn} onClick={props.onClick}>
      {props.children}
    </button>
  );
};

export default Button;

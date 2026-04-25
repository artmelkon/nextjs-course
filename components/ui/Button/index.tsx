import Link from "next/link";
import classes from "./Button.module.css";

type ButtonProps =
  | {
      url: string;
      onClick?: never;
      children: React.ReactNode;
      disabled?: boolean;
    }
  | {
      url?: never;
      onClick?: () => void;
      
      children: React.ReactNode;
      disabled?: boolean;
    };

const Button: React.FC<ButtonProps> = ({
  url,
  onClick,
  children,
  disabled,
}) => {
  if (url) {
    return (
      <Link href={url} className={classes.btn}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={classes.btn}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;

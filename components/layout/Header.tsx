import Link from 'next/link';
import { useAuth } from '@/store/auth-context';
import classes from './Header.module.css';

export default function Header() {
  const { isLoggedIn } = useAuth();

  return (
    <header className={classes.header}>
      <div className={classes.logo}>
        <Link href="/">Next Events</Link>
      </div>
      <nav className={classes.navigation}>
        <ul>
          <li><Link href="/events">Browse All Events</Link></li>
          {!isLoggedIn && (
            <li><Link href="/auth/signin">Sign In</Link></li>
          )}
          {isLoggedIn && (
            <li>
              <form action="/api/auth/signout" method="POST">
                <button type="submit" className={classes.signOutBtn}>Sign Out</button>
              </form>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

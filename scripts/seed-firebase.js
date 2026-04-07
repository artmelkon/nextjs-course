/**
 * Firebase Realtime Database seed script — populates events data.
 *
 * Prerequisites:
 *   Your Firebase rules must allow unauthenticated writes, at least temporarily.
 *   In the Firebase Console → Realtime Database → Rules, set:
 *
 *     {
 *       "rules": {
 *         ".read": true,
 *         ".write": true
 *       }
 *     }
 *
 *   After seeding, revert the rules to restrict access.
 *
 * Usage:
 *   node scripts/seed-firebase.js
 */

const FIREBASE_URL =
  'https://nextjs-course-6e2ac-default-rtdb.firebaseio.com/events.json';

const events = {
  e1: {
    title: 'Programming for Everyone',
    description:
      'Everyone can learn to code! In this live event we go through all the key basics and get you started with programming.',
    location: '25 Maple Street, San Francisco, CA 94102',
    date: '2024-05-12',
    image: 'images/coding-event.jpg',
    isFeatured: false,
  },
  e2: {
    title: 'Networking for Introverts',
    description:
      "Networking is tough when you're introverted. This event gives you the tools and strategies to connect with confidence.",
    location: '5 New Wall Street, New York, NY 10005',
    date: '2024-06-30',
    image: 'images/introvert-event.jpg',
    isFeatured: true,
  },
  e3: {
    title: 'Networking for Extroverts',
    description:
      'You have the energy — now focus it. Learn how to turn every conversation into a meaningful professional connection.',
    location: '12 Broad Avenue, Austin, TX 78701',
    date: '2024-08-10',
    image: 'images/extrovert-event.jpg',
    isFeatured: true,
  },
  e4: {
    title: 'React & Next.js Deep Dive',
    description:
      'A full-day workshop covering React fundamentals, server components, and building production-ready Next.js applications.',
    location: '200 Tech Boulevard, Seattle, WA 98101',
    date: '2024-09-20',
    image: 'images/coding-event.jpg',
    isFeatured: true,
  },
  e5: {
    title: 'MongoDB for JavaScript Developers',
    description:
      'Hands-on session covering schema design, aggregation pipelines, and integrating MongoDB with Node.js and Next.js.',
    location: '88 Cloud Lane, Denver, CO 80202',
    date: '2024-10-15',
    image: 'images/coding-event.jpg',
    isFeatured: false,
  },
};

async function seed() {
  console.log('Seeding Firebase Realtime Database...');

  const response = await fetch(FIREBASE_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(events),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Failed (${response.status}): ${text}`);
    console.error(
      '\nMake sure your Firebase rules allow unauthenticated writes.\n' +
        'In the Firebase Console → Realtime Database → Rules, set:\n\n' +
        '  { "rules": { ".read": true, ".write": true } }\n\n' +
        'Then re-run this script and revert the rules afterwards.'
    );
    process.exit(1);
  }

  const data = await response.json();
  console.log(`Seeded ${Object.keys(data).length} events successfully.`);
}

seed();

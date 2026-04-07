/**
 * MongoDB seed script — populates the local `events` database with test data.
 *
 * Usage:
 *   node scripts/seed-db.js
 *
 * Requires MongoDB running locally on the default port (27017).
 * Matches the connection used in next.config.js: mongodb://localhost/events
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost/events';

const newsletterEmails = [
  { email: 'alice@example.com' },
  { email: 'bob@example.com' },
  { email: 'carol@example.com' },
];

// eventId values must match keys in the Firebase Realtime Database
const comments = [
  {
    email: 'alice@example.com',
    name: 'Alice',
    text: 'Loved this event! Very informative.',
    eventId: 'e1',
  },
  {
    email: 'bob@example.com',
    name: 'Bob',
    text: 'Great venue and great speakers.',
    eventId: 'e1',
  },
  {
    email: 'carol@example.com',
    name: 'Carol',
    text: 'Looking forward to the next one!',
    eventId: 'e2',
  },
  {
    email: 'dave@example.com',
    name: 'Dave',
    text: 'Really helpful for introverts like me.',
    eventId: 'e2',
  },
  {
    email: 'eve@example.com',
    name: 'Eve',
    text: 'Excellent content, well organized.',
    eventId: 'e3',
  },
];

async function seed() {
  let client;
  try {
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();

    // Clear existing data to avoid duplicates on re-runs
    await db.collection('newsletter').deleteMany({});
    await db.collection('comments').deleteMany({});

    const nlResult = await db.collection('newsletter').insertMany(newsletterEmails);
    console.log(`Inserted ${nlResult.insertedCount} newsletter emails.`);

    const cmResult = await db.collection('comments').insertMany(comments);
    console.log(`Inserted ${cmResult.insertedCount} comments.`);

    console.log('Seed complete.');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    if (client) await client.close();
  }
}

seed();

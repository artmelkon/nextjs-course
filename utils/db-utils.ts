import { MongoClient } from 'mongodb';

export async function connectDatabase() {
  return await MongoClient.connect(`${process.env.MONGODB}`);
}

export async function insertDocument(client: any, collection: string, document: any) {
  const db = client.db();
  return await db.collection(collection).insertOne(document);
}

export async function getAllDocuments(client: any, collection: string, sort: {}, filter = {}) {
  const db = client.db();
  return await db.collection(collection).find(filter).sort(sort).toArray();
}

import { MongoClient } from 'mongodb';

interface CommentType {
  _id?: any
  email: string
  name: string
  text: string
  eventId: string
}

const handler = async (req: any, res: any) => {
  const eventId = req.query.eventId;

  const client = await MongoClient.connect(`${process.env.MONGODB}`)

  if (req.method === 'POST') {
    const { email, name, text } = req.body
    if (!email.includes('@') || !name || name.trim() === '' || !text || text.trim() === '') {
      res.status(422).json({ message: 'Invalid input!' })
      return;
    }

    const newComment: CommentType = {
      email,
      name,
      text,
      eventId
    }

    const db = client.db();
    const result = await db.collection('comments').insertOne(newComment);
    console.log(result)
    newComment._id = result.insertedId;

    res.status(201).json({ message: 'Comment added!', comment: newComment })
  }

  if (req.method === 'GET') {
    const db = client.db();
    const documents = await db.collection('comments').find().sort({ _id: -1 }).toArray();
    res.status(200).json({ comments: documents });
  }

  client.close();
}

export default handler;

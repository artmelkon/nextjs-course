import { connectDatabase, insertDocument, getAllDocuments } from '@/utils/db-utils';

interface CommentType {
  _id?: any
  email: string
  name: string
  text: string
  eventId: string
}

const handler = async (req: any, res: any) => {
  const eventId = req.query.eventId;
  let client;
  try {
    client = await connectDatabase()
  } catch (err) {
    return res.status(500).json({ message: 'Connection to DB failed!' })
  }

  if (req.method === 'POST') {
    const { email, name, text } = req.body
    if (!email.includes('@') || !name || name.trim() === '' || !text || text.trim() === '') {
      res.status(422).json({ message: 'Invalid input!' })
      client.close();
      return;
    }

    const newComment: CommentType = {
      email,
      name,
      text,
      eventId
    }

    let result;
    try {
      result = await insertDocument(client, 'comments', newComment);
      newComment._id = result.insertedId;
      res.status(201).json({ message: 'Comment added!', comment: newComment })
    } catch (err) {
      res.status(500).json({ message: 'Writing data failed!' })
    }
  }

  if (req.method === 'GET') {
    let documents;
    try {
      documents = await getAllDocuments(client, 'comments', { _id: -1 }, { eventId });
      res.status(200).json({ comments: documents });
    } catch (err) {
      res.status(500).json({ message: 'Unable to retrive data!' })
    }
  }

  client.close();
}

export default handler;

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
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let client;
  try {
    client = await connectDatabase();
  } catch (err) {
    return res.status(500).json({ message: 'Connection to DB failed!' });
  }

  try {
    if (req.method === 'POST') {
      const { email, name, text } = req.body;
      if (!email || typeof email !== 'string' || !emailRegex.test(email) || !name || name.trim() === '' || !text || text.trim() === '') {
        return res.status(422).json({ message: 'Invalid input!' });
      }

      const newComment: CommentType = { email, name, text, eventId };
      const result = await insertDocument(client, 'comments', newComment);
      newComment._id = result.insertedId;
      res.status(201).json({ message: 'Comment added!', comment: newComment });
    } else if (req.method === 'GET') {
      const documents = await getAllDocuments(client, 'comments', { _id: -1 }, { eventId });
      res.status(200).json({ comments: documents });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Operation failed!' });
  } finally {
    client.close();
  }
};

export default handler;

import { connectDatabase, insertDocument } from "@/utils/db-utils";

async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    const userEmail = req.body.email;
    if (!userEmail || !userEmail.includes('@')) {
      res.status(422).json({ message: 'Invalid email address!' })
      return;
    };

    let client;
    try {
      client = await connectDatabase();
    } catch (err) {
      return res.status(500).json({ message: 'Connection to DB failed!' });
    }
    try {
      await insertDocument(client, 'newsletter', { email: userEmail })
      client.close();
    } catch (err) {
      return res.status(500).json({ message: 'Writing data failed!' });
    }

    res.status(201).json({ message: 'Success!' })
  }
}

export default handler;

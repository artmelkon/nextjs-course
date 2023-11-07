import {MongoClient} from 'mongodb';

async function handler(req: any, res: any) {
  if(req.method === 'POST') {
    const userEmail = req.body.email;
    if(!userEmail || !userEmail.includes('@')) {
      res.status(422).json({message: 'Invalid email address!'})
      return;
    };

    const client = await MongoClient.connect('mongodb://localhost/events')
    const db = client.db();
    await db.collection('newsletters').insertOne({email: userEmail});

    client.close();

    res.status(201).json({message: 'Success!'})
  }
}

export default handler;

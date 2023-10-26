const handler = (req: any, res: any) => {
  const eventId = req.query.eventId;

  if (req.method === 'POST') {
    const { email, name, text } = req.body
    if (email.includes('@') || !name || name.trim() === '' || !text || text.trim() === '') {
      res.status(422).json({ message: 'Invalid input!' })
      return;
    }

    console.log(email, name, text);
    const newComment = {
      id: btoa(new Date().toISOString()),
      email,
      name,
      text
    }
    res.status(201).json({ message: 'Comment added!', comment: newComment })
  }

  if (req.method === 'GET') {
    const dummyList = [
      { id: 'c1', name: 'Arthur', text: 'First Comment' },
      { id: 'c2', name: 'Hammarubi', text: 'Second Comment' }
    ];

    res.status(200).json({comments: dummyList});
  }
}

export default handler;

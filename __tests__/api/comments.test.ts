// File: __tests__/api/comments.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '@/pages/api/comments/[eventId]';

// --- Mock db-utils at module level ---
vi.mock('@/utils/db-utils', () => ({
  connectDatabase: vi.fn(),
  insertDocument: vi.fn(),
  getAllDocuments: vi.fn(),
}));

import { connectDatabase, insertDocument, getAllDocuments } from '@/utils/db-utils';

const mockConnect = connectDatabase as ReturnType<typeof vi.fn>;
const mockInsert = insertDocument as ReturnType<typeof vi.fn>;
const mockGetAll = getAllDocuments as ReturnType<typeof vi.fn>;

function makeClient() {
  return { close: vi.fn() };
}

function makeReqRes(method: string, body: Record<string, unknown> = {}, eventId = 'event-1') {
  const req = { method, body, query: { eventId } };
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
  };
  return { req, res };
}

describe('GET /api/comments/[eventId]', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 200 with comments for the event (happy path)', async () => {
    const client = makeClient();
    const fakeComments = [
      { _id: '1', email: 'a@b.com', name: 'Alice', text: 'Great!', eventId: 'event-1' },
    ];
    mockConnect.mockResolvedValueOnce(client);
    mockGetAll.mockResolvedValueOnce(fakeComments);

    const { req, res } = makeReqRes('GET');
    await handler(req as any, res as any);

    expect(mockConnect).toHaveBeenCalledOnce();
    expect(mockGetAll).toHaveBeenCalledWith(client, 'comments', { _id: -1 }, { eventId: 'event-1' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ comments: fakeComments });
    expect(client.close).toHaveBeenCalledOnce();
  });

  it('returns 500 and closes client when getAllDocuments throws', async () => {
    const client = makeClient();
    mockConnect.mockResolvedValueOnce(client);
    mockGetAll.mockRejectedValueOnce(new Error('DB read failed'));

    const { req, res } = makeReqRes('GET');
    await handler(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(client.close).toHaveBeenCalledOnce();
  });

  it('returns 500 when DB connection fails', async () => {
    mockConnect.mockRejectedValueOnce(new Error('Connection refused'));

    const { req, res } = makeReqRes('GET');
    await handler(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Connection to DB failed!' });
    expect(mockGetAll).not.toHaveBeenCalled();
  });
});

describe('POST /api/comments/[eventId]', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 201 and inserts comment when input is valid', async () => {
    const client = makeClient();
    const insertedId = 'new-id-123';
    mockConnect.mockResolvedValueOnce(client);
    mockInsert.mockResolvedValueOnce({ insertedId });

    const { req, res } = makeReqRes('POST', {
      email: 'user@example.com',
      name: 'Bob',
      text: 'Nice event!',
    });
    await handler(req as any, res as any);

    expect(mockInsert).toHaveBeenCalledWith(client, 'comments', expect.objectContaining({
      email: 'user@example.com',
      name: 'Bob',
      text: 'Nice event!',
      eventId: 'event-1',
    }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Comment added!' }));
    expect(client.close).toHaveBeenCalledOnce();
  });

  it('returns 422 when email is missing', async () => {
    const client = makeClient();
    mockConnect.mockResolvedValueOnce(client);

    const { req, res } = makeReqRes('POST', { name: 'Bob', text: 'Nice!' });
    await handler(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid input!' });
    expect(mockInsert).not.toHaveBeenCalled();
    expect(client.close).toHaveBeenCalledOnce();
  });

  it('returns 422 when email has invalid format (no proper structure)', async () => {
    const client = makeClient();
    mockConnect.mockResolvedValueOnce(client);

    const { req, res } = makeReqRes('POST', { email: 'notanemail', name: 'Bob', text: 'Nice!' });
    await handler(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid input!' });
    expect(mockInsert).not.toHaveBeenCalled();
    expect(client.close).toHaveBeenCalledOnce();
  });

  it('returns 422 when name is missing', async () => {
    const client = makeClient();
    mockConnect.mockResolvedValueOnce(client);

    const { req, res } = makeReqRes('POST', { email: 'user@example.com', text: 'Nice!' });
    await handler(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(client.close).toHaveBeenCalledOnce();
  });

  it('returns 422 when text is missing', async () => {
    const client = makeClient();
    mockConnect.mockResolvedValueOnce(client);

    const { req, res } = makeReqRes('POST', { email: 'user@example.com', name: 'Bob' });
    await handler(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(client.close).toHaveBeenCalledOnce();
  });

  it('returns 500 and closes client when insertDocument throws', async () => {
    const client = makeClient();
    mockConnect.mockResolvedValueOnce(client);
    mockInsert.mockRejectedValueOnce(new Error('Write failed'));

    const { req, res } = makeReqRes('POST', {
      email: 'user@example.com',
      name: 'Bob',
      text: 'Nice event!',
    });
    await handler(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(client.close).toHaveBeenCalledOnce();
  });
});

describe('Unsupported methods /api/comments/[eventId]', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 405 for PUT requests', async () => {
    const client = makeClient();
    mockConnect.mockResolvedValueOnce(client);

    const { req, res } = makeReqRes('PUT');
    await handler(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ message: 'Method not allowed' });
    expect(client.close).toHaveBeenCalledOnce();
  });

  it('returns 405 for DELETE requests', async () => {
    const client = makeClient();
    mockConnect.mockResolvedValueOnce(client);

    const { req, res } = makeReqRes('DELETE');
    await handler(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(client.close).toHaveBeenCalledOnce();
  });
});

describe('client.close() is always called', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('closes client after successful GET', async () => {
    const client = makeClient();
    mockConnect.mockResolvedValueOnce(client);
    mockGetAll.mockResolvedValueOnce([]);

    const { req, res } = makeReqRes('GET');
    await handler(req as any, res as any);

    expect(client.close).toHaveBeenCalledOnce();
  });

  it('closes client after successful POST', async () => {
    const client = makeClient();
    mockConnect.mockResolvedValueOnce(client);
    mockInsert.mockResolvedValueOnce({ insertedId: 'abc' });

    const { req, res } = makeReqRes('POST', {
      email: 'x@y.com',
      name: 'X',
      text: 'Hello',
    });
    await handler(req as any, res as any);

    expect(client.close).toHaveBeenCalledOnce();
  });

  it('closes client after GET DB error', async () => {
    const client = makeClient();
    mockConnect.mockResolvedValueOnce(client);
    mockGetAll.mockRejectedValueOnce(new Error('fail'));

    const { req, res } = makeReqRes('GET');
    await handler(req as any, res as any);

    expect(client.close).toHaveBeenCalledOnce();
  });

  it('closes client after POST DB error', async () => {
    const client = makeClient();
    mockConnect.mockResolvedValueOnce(client);
    mockInsert.mockRejectedValueOnce(new Error('fail'));

    const { req, res } = makeReqRes('POST', { email: 'x@y.com', name: 'X', text: 'Hello' });
    await handler(req as any, res as any);

    expect(client.close).toHaveBeenCalledOnce();
  });

  it('closes client on unsupported method', async () => {
    const client = makeClient();
    mockConnect.mockResolvedValueOnce(client);

    const { req, res } = makeReqRes('PATCH');
    await handler(req as any, res as any);

    expect(client.close).toHaveBeenCalledOnce();
  });
});

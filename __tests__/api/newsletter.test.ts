// File: __tests__/api/newsletter.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '@/pages/api/newsletter/index';

// --- Mock db-utils at module level ---
vi.mock('@/utils/db-utils', () => ({
  connectDatabase: vi.fn(),
  insertDocument: vi.fn(),
}));

import { connectDatabase, insertDocument } from '@/utils/db-utils';

// Typed convenience references
const mockConnect = connectDatabase as ReturnType<typeof vi.fn>;
const mockInsert = insertDocument as ReturnType<typeof vi.fn>;

// Minimal mock client with close spy
function makeClient() {
  return { close: vi.fn() };
}

// Helper to build mock req/res objects
function makeReqRes(method: string, body: Record<string, unknown> = {}) {
  const req = { method, body };
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return { req, res };
}

describe('POST /api/newsletter', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // --- Happy path ---
  it('returns 201 and inserts document when email is valid', async () => {
    const client = makeClient();
    mockConnect.mockResolvedValueOnce(client);
    mockInsert.mockResolvedValueOnce({});

    const { req, res } = makeReqRes('POST', { email: 'user@example.com' });
    await handler(req as any, res as any);

    expect(mockConnect).toHaveBeenCalledOnce();
    expect(mockInsert).toHaveBeenCalledWith(client, 'newsletter', { email: 'user@example.com' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Success!' });
    expect(client.close).toHaveBeenCalledOnce();
  });

  // --- Edge cases: invalid email ---
  it('returns 422 when email is missing', async () => {
    const { req, res } = makeReqRes('POST', {});
    await handler(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email address!' });
    expect(mockConnect).not.toHaveBeenCalled();
  });

  it('returns 422 when email has no @ symbol', async () => {
    const { req, res } = makeReqRes('POST', { email: 'notanemail' });
    await handler(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email address!' });
  });

  it('returns 422 when email exceeds 254 characters', async () => {
    const longEmail = 'a'.repeat(250) + '@b.com'; // 256 chars, exceeds 254 limit
    const { req, res } = makeReqRes('POST', { email: longEmail });
    await handler(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email address!' });
  });

  it('returns 422 when email is not a string', async () => {
    const { req, res } = makeReqRes('POST', { email: 12345 });
    await handler(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email address!' });
  });

  // --- DB failure: connection error ---
  it('returns 500 and does not call insertDocument when DB connection fails', async () => {
    mockConnect.mockRejectedValueOnce(new Error('Connection refused'));

    const { req, res } = makeReqRes('POST', { email: 'user@example.com' });
    await handler(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Connection to DB failed!' });
    expect(mockInsert).not.toHaveBeenCalled();
  });

  // --- DB failure: insert error — client.close() must still be called ---
  it('returns 500 and still closes client when insertDocument fails', async () => {
    const client = makeClient();
    mockConnect.mockResolvedValueOnce(client);
    mockInsert.mockRejectedValueOnce(new Error('Write failed'));

    const { req, res } = makeReqRes('POST', { email: 'user@example.com' });
    await handler(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Writing data failed!' });
    expect(client.close).toHaveBeenCalledOnce();
  });

  // --- Wrong HTTP method ---
  it('returns 405 for GET requests', async () => {
    const { req, res } = makeReqRes('GET');
    await handler(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ message: 'Method not allowed' });
    expect(mockConnect).not.toHaveBeenCalled();
  });

  it('returns 405 for PUT requests', async () => {
    const { req, res } = makeReqRes('PUT', { email: 'user@example.com' });
    await handler(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(405);
  });
});

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { db } from '../db.js';

// run the app in test mode (prevents wwebjs from starting)
process.env.NODE_ENV = 'test';
import server from '../index.js';

let srv;
beforeAll(() => { srv = server; });
afterAll(() => { srv && srv.close && srv.close(); });

describe('availability', () => {
  it('returns slots', async () => {
    const res = await request('http://127.0.0.1:3000')
      .get('/availability?date=2025-10-03&service_id=1&staff_id=1');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.slots)).toBe(true);
  });
});

describe('api/v1/bookings', () => {
  let bookingId;

  beforeAll(() => {
    // ensure there is at least one confirmed booking in the future
    const svc = db.prepare('SELECT * FROM services LIMIT 1').get();
    const stf = db.prepare('SELECT * FROM staff WHERE active=1 LIMIT 1').get();
    const start = new Date();
    start.setDate(start.getDate() + 3);
    start.setHours(10, 0, 0, 0);
    const startISO = start.toISOString();
    const endISO = new Date(start.getTime() + svc.duration_min * 60000).toISOString();

    const insert = db.prepare(`
      INSERT INTO bookings (phone, staff_id, service_id, start_dt, end_dt, status)
      VALUES (?, ?, ?, ?, ?, 'confirmed')
    `);
    const info = insert.run('+10000000000', stf.id, svc.id, startISO, endISO);
    bookingId = info.lastInsertRowid;
  });

  it('returns bookings in a range', async () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 1);
    const end = new Date(today);
    end.setDate(today.getDate() + 7);

    const toISODate = (d) => d.toISOString().slice(0, 10);

    const res = await request(srv)
      .get('/api/v1/bookings')
      .query({ start: toISODate(start), end: toISODate(end) });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.bookings)).toBe(true);
    expect(res.body.start).toBe(toISODate(start));
    expect(res.body.end).toBe(toISODate(end));
  });

  it('can cancel a booking', async () => {
    const res = await request(srv)
      .post(`/api/v1/bookings/${bookingId}/cancel`);

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.booking.status).toBe('cancelled');

    const row = db.prepare('SELECT status FROM bookings WHERE id=?').get(bookingId);
    expect(row.status).toBe('cancelled');
  });
});

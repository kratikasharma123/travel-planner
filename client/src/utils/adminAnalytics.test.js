import {
  buildAdminMetrics,
  countBy,
  getBookingValue,
  monthRows,
  popularDestinations,
} from './adminAnalytics.js';

describe('adminAnalytics', () => {
  it('counts records by key', () => {
    expect(countBy([{ role: 'admin' }, { role: 'user' }, { role: 'user' }], 'role')).toEqual({
      admin: 1,
      user: 2,
    });
  });

  it('builds monthly rows', () => {
    expect(
      monthRows([{ createdAt: '2026-06-01' }, { createdAt: '2026-06-12' }], 'createdAt', 'users')
    ).toEqual([{ month: '2026-06', users: 2 }]);
  });

  it('reads booking value from booking details', () => {
    expect(getBookingValue({ details: { total: 120 } })).toBe(120);
    expect(getBookingValue({ details: { price: 80 } })).toBe(80);
  });

  it('builds dashboard metrics', () => {
    const metrics = buildAdminMetrics({
      users: [{ status: 'active' }],
      trips: [{}],
      bookings: [{ details: { total: 120 } }, {}],
      aiLogs: [{ latency_ms: 100 }, { status: 'failed', latency_ms: 300 }],
      tickets: [{ status: 'open' }],
      reviews: [{ status: 'pending' }],
      notifications: [{}],
    });
    expect(metrics.totalUsers).toBe(1);
    expect(metrics.bookings).toBe(2);
    expect(metrics.revenue).toBe(120);
    expect(metrics.aiRequests).toBe(2);
    expect(metrics.failedAiRequests).toBe(1);
    expect(metrics.averageAiLatency).toBe(200);
  });

  it('calculates popular destinations', () => {
    expect(popularDestinations([{ city: 'Goa' }, { city: 'Goa' }, { country: 'Japan' }])).toEqual([
      { destination: 'Goa', trips: 2 },
      { destination: 'Japan', trips: 1 },
    ]);
  });
});

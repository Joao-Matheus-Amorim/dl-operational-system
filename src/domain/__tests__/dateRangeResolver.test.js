const { resolveDateRange, parseDateOnly, toDateOnly } = require('../dateRangeResolver');

describe('dateRangeResolver', () => {
  const now = new Date('2026-05-12T10:00:00');

  test('resolves --day to same since and until', () => {
    expect(resolveDateRange({ day: '2026-05-10', now })).toEqual({
      since: '2026-05-10',
      until: '2026-05-10',
      mode: 'day',
    });
  });

  test('resolves --today using provided current date', () => {
    expect(resolveDateRange({ today: true, now })).toEqual({
      since: '2026-05-12',
      until: '2026-05-12',
      mode: 'today',
    });
  });

  test('resolves --pending-month from first day to yesterday', () => {
    expect(resolveDateRange({ pendingMonth: true, now })).toEqual({
      since: '2026-05-01',
      until: '2026-05-11',
      mode: 'pending-month',
    });
  });

  test('resolves --month-to-date from first day to today', () => {
    expect(resolveDateRange({ monthToDate: true, now })).toEqual({
      since: '2026-05-01',
      until: '2026-05-12',
      mode: 'month-to-date',
    });
  });

  test('resolves custom since and until', () => {
    expect(resolveDateRange({ since: '2026-05-01', until: '2026-05-06', now })).toEqual({
      since: '2026-05-01',
      until: '2026-05-06',
      mode: 'custom',
    });
  });

  test('rejects conflicting modes', () => {
    expect(() => resolveDateRange({ day: '2026-05-10', today: true, now })).toThrow('Use apenas um modo de período');
  });

  test('rejects inverted custom range', () => {
    expect(() => resolveDateRange({ since: '2026-05-06', until: '2026-05-01', now })).toThrow('--until não pode ser menor');
  });

  test('parseDateOnly validates format', () => {
    expect(() => parseDateOnly('12/05/2026')).toThrow('formato YYYY-MM-DD');
  });

  test('toDateOnly formats date', () => {
    expect(toDateOnly(now)).toBe('2026-05-12');
  });
});

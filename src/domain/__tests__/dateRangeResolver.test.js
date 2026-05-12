const { resolveDateRange, parseDateOnly, toDateOnly, dateOnlyInTimeZone } = require('../dateRangeResolver');

describe('dateRangeResolver', () => {
  const now = new Date('2026-05-12T10:00:00Z');

  test('resolves --day to same since and until', () => {
    expect(resolveDateRange({ day: '2026-05-10', now })).toMatchObject({
      since: '2026-05-10',
      until: '2026-05-10',
      mode: 'day',
    });
  });

  test('resolves --today using provided client timezone date', () => {
    expect(resolveDateRange({ today: true, now, timeZone: 'America/Sao_Paulo' })).toMatchObject({
      since: '2026-05-12',
      until: '2026-05-12',
      mode: 'today',
      operationalDate: '2026-05-12',
      timeZone: 'America/Sao_Paulo',
    });
  });

  test('resolves --pending-month from first day to yesterday', () => {
    expect(resolveDateRange({ pendingMonth: true, now, timeZone: 'America/Sao_Paulo' })).toMatchObject({
      since: '2026-05-01',
      until: '2026-05-11',
      mode: 'pending-month',
    });
  });

  test('resolves --month-to-date from first day to today', () => {
    expect(resolveDateRange({ monthToDate: true, now, timeZone: 'America/Sao_Paulo' })).toMatchObject({
      since: '2026-05-01',
      until: '2026-05-12',
      mode: 'month-to-date',
    });
  });

  test('defaults to company month-to-date when no manual period is provided', () => {
    expect(resolveDateRange({ now, timeZone: 'America/Sao_Paulo', defaultDateMode: 'month-to-date' })).toMatchObject({
      since: '2026-05-01',
      until: '2026-05-12',
      mode: 'month-to-date-default',
    });
  });

  test('supports default pending-month mode', () => {
    expect(resolveDateRange({ now, timeZone: 'America/Sao_Paulo', defaultDateMode: 'pending-month' })).toMatchObject({
      since: '2026-05-01',
      until: '2026-05-11',
      mode: 'pending-month-default',
    });
  });

  test('uses client timezone instead of server timezone', () => {
    const instant = new Date('2026-05-12T02:30:00Z');
    expect(dateOnlyInTimeZone(instant, 'America/Sao_Paulo')).toBe('2026-05-11');
    expect(dateOnlyInTimeZone(instant, 'UTC')).toBe('2026-05-12');
  });

  test('resolves custom since and until', () => {
    expect(resolveDateRange({ since: '2026-05-01', until: '2026-05-06', now })).toMatchObject({
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
    expect(toDateOnly(new Date('2026-05-12T00:00:00'))).toBe('2026-05-12');
  });
});

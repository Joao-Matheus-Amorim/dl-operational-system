const { resolveSheetForDate, monthMatches } = require('../sheetResolver');

describe('sheetResolver', () => {
  test('resolves SP May sheet from catalog', () => {
    const result = resolveSheetForDate({
      companyId: 'cmp_dental_leads',
      state: 'SP',
      date: '2026-05-12',
    });

    expect(result.sheetName).toBe('SP · MAIO');
    expect(result.gid).toBe('498302069');
    expect(result.source).toBe('catalog');
  });

  test('resolves Bahia April sheet from catalog', () => {
    const result = resolveSheetForDate({
      companyId: 'cmp_dental_leads',
      state: 'BA',
      date: '2026-04-10',
    });

    expect(result.sheetName).toBe('Bahia · Abril');
  });

  test('uses explicit sheet name when provided', () => {
    const result = resolveSheetForDate({
      companyId: 'cmp_dental_leads',
      state: 'SP',
      date: '2026-05-12',
      explicitSheetName: 'Aba Manual',
    });

    expect(result.sheetName).toBe('Aba Manual');
    expect(result.source).toBe('explicit');
  });

  test('throws clear error when sheet does not exist for month', () => {
    expect(() => resolveSheetForDate({
      companyId: 'cmp_dental_leads',
      state: 'SP',
      date: '2026-06-01',
    })).toThrow('Nenhuma aba encontrada');
  });

  test('matches month aliases with accents', () => {
    expect(monthMatches('maio', 5)).toBe(true);
    expect(monthMatches('março', 3)).toBe(true);
    expect(monthMatches('marco', 3)).toBe(true);
    expect(monthMatches('abril', 5)).toBe(false);
  });
});

const { normalizeInsight, totals, number, round } = require('../metrics');

describe('metrics helpers', () => {
  test('number converts invalid values to zero', () => {
    expect(number('10.5')).toBe(10.5);
    expect(number(undefined)).toBe(0);
    expect(number('abc')).toBe(0);
  });

  test('round uses two digits by default', () => {
    expect(round(10.236)).toBe(10.24);
    expect(round(10.234)).toBe(10.23);
  });

  test('normalizeInsight calculates leads, CPL, CTR and ROI', () => {
    const row = normalizeInsight({
      campaign_id: 'cmp_1',
      campaign_name: 'Dental | Pimentas',
      spend: '100',
      impressions: '1000',
      clicks: '50',
      actions: [{ action_type: 'lead', value: '10' }],
      action_values: [],
      account_currency: 'BRL',
      date_start: '2026-05-01',
      date_stop: '2026-05-01',
    }, {
      client: { name: 'Pimentas', key: 'pimentas', leadValue: 30 },
      level: 'campaign',
    });

    expect(row.cliente).toBe('Pimentas');
    expect(row.campaign_id).toBe('cmp_1');
    expect(row.gasto).toBe(100);
    expect(row.leads).toBe(10);
    expect(row.cpl).toBe(10);
    expect(row.ctr).toBe(5);
    expect(row.valor_total_estimado).toBe(300);
    expect(row.roi_percentual).toBe(200);
  });

  test('normalizeInsight prefers Meta revenue over estimated lead value', () => {
    const row = normalizeInsight({
      spend: '100',
      impressions: '1000',
      clicks: '50',
      actions: [{ action_type: 'lead', value: '10' }],
      action_values: [{ action_type: 'purchase', value: '500' }],
    }, {
      client: { name: 'Cliente', key: 'cliente', leadValue: 30 },
      level: 'campaign',
    });

    expect(row.valor_total_estimado).toBe(500);
    expect(row.roi_percentual).toBe(400);
  });

  test('totals aggregates rows safely', () => {
    const result = totals([
      { gasto: 100, leads: 10, impressoes: 1000, cliques: 50, valor_total_estimado: 300 },
      { gasto: 50, leads: 5, impressoes: 500, cliques: 20, valor_total_estimado: 150 },
    ]);

    expect(result.gasto).toBe(150);
    expect(result.leads).toBe(15);
    expect(result.cpl).toBe(10);
    expect(result.impressoes).toBe(1500);
    expect(result.cliques).toBe(70);
    expect(result.ctr).toBe(4.67);
    expect(result.valor_total_estimado).toBe(450);
    expect(result.roi_percentual).toBe(200);
  });
});

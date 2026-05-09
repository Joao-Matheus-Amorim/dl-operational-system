function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function actionValue(actions = [], matchers = []) {
  if (!Array.isArray(actions)) return 0;
  return actions.reduce((total, item) => {
    const actionType = String(item.action_type || '').toLowerCase();
    const matched = matchers.some((matcher) => actionType.includes(matcher));
    return matched ? total + number(item.value) : total;
  }, 0);
}

function extractLeads(actions = []) {
  return actionValue(actions, [
    'lead',
    'onsite_conversion.lead',
    'offsite_conversion.fb_pixel_lead',
    'leadgen_grouped',
    'onsite_conversion.messaging_conversation_started_7d',
  ]);
}

function extractRevenue(actionValues = []) {
  return actionValue(actionValues, [
    'purchase',
    'omni_purchase',
    'offsite_conversion.fb_pixel_purchase',
  ]);
}

function safeDivide(a, b) {
  return b > 0 ? a / b : 0;
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round((number(value) + Number.EPSILON) * factor) / factor;
}

function normalizeInsight(raw, { client, level }) {
  const spend = number(raw.spend);
  const impressions = number(raw.impressions);
  const clicks = number(raw.clicks || raw.inline_link_clicks);
  const leads = extractLeads(raw.actions);
  const revenueFromMeta = extractRevenue(raw.action_values);
  const estimatedValue = revenueFromMeta > 0 ? revenueFromMeta : leads * number(client.leadValue);
  const cpl = leads > 0 ? spend / leads : 0;
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : number(raw.ctr);
  const roi = spend > 0 ? ((estimatedValue - spend) / spend) * 100 : 0;

  return {
    cliente: client.name,
    unidade: client.key,
    nivel: level,
    data_inicio: raw.date_start || '',
    data_fim: raw.date_stop || '',
    campaign_id: raw.campaign_id || '',
    campanha: raw.campaign_name || '',
    adset_id: raw.adset_id || '',
    conjunto: raw.adset_name || '',
    ad_id: raw.ad_id || '',
    criativo: raw.ad_name || '',
    gasto: round(spend),
    leads: round(leads, 0),
    cpl: leads > 0 ? round(cpl) : '',
    impressoes: round(impressions, 0),
    cliques: round(clicks, 0),
    ctr: round(ctr),
    valor_total_estimado: round(estimatedValue),
    roi_percentual: spend > 0 ? round(roi) : '',
    moeda: raw.account_currency || 'BRL',
  };
}

function totals(rows = []) {
  const gasto = rows.reduce((sum, row) => sum + number(row.gasto), 0);
  const leads = rows.reduce((sum, row) => sum + number(row.leads), 0);
  const impressoes = rows.reduce((sum, row) => sum + number(row.impressoes), 0);
  const cliques = rows.reduce((sum, row) => sum + number(row.cliques), 0);
  const valor = rows.reduce((sum, row) => sum + number(row.valor_total_estimado), 0);
  return {
    gasto: round(gasto),
    leads: round(leads, 0),
    cpl: leads > 0 ? round(gasto / leads) : '',
    impressoes: round(impressoes, 0),
    cliques: round(cliques, 0),
    ctr: impressoes > 0 ? round((cliques / impressoes) * 100) : '',
    valor_total_estimado: round(valor),
    roi_percentual: gasto > 0 ? round(((valor - gasto) / gasto) * 100) : '',
  };
}

module.exports = { normalizeInsight, totals, number, round };

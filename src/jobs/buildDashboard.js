const { MetaAdsClient } = require('../services/metaAds');
const { GoogleSheetsClient } = require('../services/googleSheets');
const { totals, round } = require('../domain/metrics');
const { logger } = require('../utils/logger');

function buildDashboardRows({ client, campaignRows, adRows }) {
  const total = totals(campaignRows);
  const byStatus = adRows.reduce((acc, row) => {
    const key = row.status_analise || 'SEM_ANALISE';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const progressLeads = client.monthlyGoalLeads > 0 ? round((total.leads / client.monthlyGoalLeads) * 100) : '';
  const progressSpend = client.monthlyGoalSpend > 0 ? round((total.gasto / client.monthlyGoalSpend) * 100) : '';

  const kpis = [
    { indicador: 'Cliente', valor: client.name, observacao: client.adAccountId },
    { indicador: 'Gasto total', valor: total.gasto, observacao: 'R$ no período' },
    { indicador: 'Leads', valor: total.leads, observacao: `Meta mensal: ${client.monthlyGoalLeads}` },
    { indicador: 'CPL', valor: total.cpl, observacao: 'Custo por lead' },
    { indicador: 'CTR', valor: total.ctr, observacao: '%' },
    { indicador: 'Valor total estimado', valor: total.valor_total_estimado, observacao: 'Leads x valor configurado ou receita Meta' },
    { indicador: 'ROI %', valor: total.roi_percentual, observacao: 'Estimado' },
    { indicador: '% meta leads', valor: progressLeads, observacao: 'Progresso sobre meta mensal' },
    { indicador: '% orçamento usado', valor: progressSpend, observacao: 'Progresso sobre orçamento mensal' },
    { indicador: 'Criativos OK', valor: byStatus.OK || 0, observacao: '' },
    { indicador: 'Criativos com CPL alto', valor: byStatus.CPL_ALTO || 0, observacao: '' },
    { indicador: 'Criativos sem lead com gasto', valor: byStatus.SEM_LEAD_COM_GASTO || 0, observacao: '' },
    { indicador: 'Criativos destaque', valor: byStatus.DESTAQUE || 0, observacao: '' },
  ];

  return kpis;
}

async function buildDashboard({ clients, since, until, dryRun = false, analyzedAdsByClient = new Map() }) {
  const meta = new MetaAdsClient();
  const sheets = new GoogleSheetsClient();
  const result = [];

  for (const client of clients) {
    if (!client.adAccountId || client.adAccountId.includes('PREENCHER')) continue;

    logger.info(`Gerando dashboard: ${client.name}`);
    const campaigns = await meta.getInsights({ client, level: 'campaign', since, until });
    const adRows = analyzedAdsByClient.get(client.key) || [];
    const dashboard = buildDashboardRows({ client, campaignRows: campaigns, adRows });
    await sheets.clearAndWrite(client.spreadsheetId, `${client.tabPrefix} - Dashboard`, dashboard, dryRun);
    result.push({ client: client.key, dashboardRows: dashboard.length });
  }

  return result;
}

module.exports = { buildDashboard, buildDashboardRows };

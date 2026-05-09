const { MetaAdsClient } = require('../services/metaAds');
const { GoogleSheetsClient } = require('../services/googleSheets');
const { logger } = require('../utils/logger');

async function syncSheets({ clients, since, until, dryRun = false }) {
  const meta = new MetaAdsClient();
  const sheets = new GoogleSheetsClient();
  const result = [];

  for (const client of clients) {
    if (!client.adAccountId || client.adAccountId.includes('PREENCHER')) {
      logger.warn(`Pulando ${client.name}: adAccountId não configurado.`);
      continue;
    }

    logger.info(`Sincronizando ${client.name}: ${since} até ${until}`);
    const campaigns = await meta.getInsights({ client, level: 'campaign', since, until });
    const adsets = await meta.getInsights({ client, level: 'adset', since, until });
    const ads = await meta.getInsights({ client, level: 'ad', since, until });

    await sheets.clearAndWrite(client.spreadsheetId, `${client.tabPrefix} - Campanhas`, campaigns, dryRun);
    await sheets.clearAndWrite(client.spreadsheetId, `${client.tabPrefix} - Conjuntos`, adsets, dryRun);
    await sheets.clearAndWrite(client.spreadsheetId, `${client.tabPrefix} - Criativos`, ads, dryRun);

    result.push({ client: client.key, campaigns: campaigns.length, adsets: adsets.length, ads: ads.length });
  }

  return result;
}

module.exports = { syncSheets };

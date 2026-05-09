require('dotenv').config();

const {
  getClients,
  getMetaClients,
  getSheetOnlyClients,
  missingAccountClients,
} = require('./config/clients');
const { parseArgs } = require('./utils/cli');
const { currentMonthRange } = require('./utils/date');
const { logger } = require('./utils/logger');
const { MetaAdsClient } = require('./services/metaAds');
const { GoogleSheetsClient } = require('./services/googleSheets');
const { syncSheets } = require('./jobs/syncSheets');
const { analyzeCampaigns } = require('./jobs/analyzeCampaigns');
const { buildDashboard } = require('./jobs/buildDashboard');
const { checkAlerts } = require('./jobs/checkAlerts');
const { fillSheetOnly } = require('./jobs/fillSheetOnly');

async function validate(clients, dryRun = false) {
  const metaClients = getMetaClients(clients);
  const sheetOnlyClients = getSheetOnlyClients(clients);
  const sheets = new GoogleSheetsClient();

  if (metaClients.length > 0 || sheetOnlyClients.some((client) => (client.units || []).some((unit) => !String(unit.adAccountId || '').includes('PREENCHER')))) {
    const meta = new MetaAdsClient({ dryRun });
    const me = await meta.validateToken();
    logger.info(`Meta API OK: ${me.name || me.id}`);
  }

  const uniqueSheets = [...new Set(clients.map((client) => client.spreadsheetId).filter(Boolean))];
  for (const spreadsheetId of uniqueSheets) {
    if (dryRun) {
      logger.info(`[DRY RUN] Validaria Google Sheets: ${spreadsheetId}`);
      continue;
    }
    const sheet = await sheets.validate(spreadsheetId);
    logger.info(`Google Sheets OK: ${sheet.properties.title}`);
  }

  const missing = missingAccountClients(clients);
  if (missing.length) {
    logger.warn(`Clientes/unidades sem adAccountId real: ${missing.map((client) => client.name).join(', ')}`);
  }
}

async function main() {
  const args = parseArgs();
  const clients = getClients(args.client);
  const metaClients = getMetaClients(clients);
  const sheetOnlyClients = getSheetOnlyClients(clients);
  const defaultRange = currentMonthRange();
  const since = args.since || defaultRange.since;
  const until = args.until || defaultRange.until;

  logger.info('='.repeat(70));
  logger.info(`Comando: ${args.command} | Cliente: ${args.client} | Período: ${since} até ${until}`);
  logger.info(`Dry-run: ${args.dryRun} | No-actions: ${args.noActions}`);
  logger.info('='.repeat(70));

  if (['validate', 'validar'].includes(args.command)) {
    await validate(clients, args.dryRun);
    return;
  }

  if (['preenchimento', 'fill'].includes(args.command)) {
    await fillSheetOnly({ clients: sheetOnlyClients, since, until, dryRun: args.dryRun });
    if (metaClients.length) {
      await syncSheets({ clients: metaClients, since, until, dryRun: args.dryRun });
    }
    return;
  }

  if (args.command === 'sync') {
    await syncSheets({ clients: metaClients, since, until, dryRun: args.dryRun });
    return;
  }

  if (args.command === 'analyze') {
    await analyzeCampaigns({ clients: metaClients, since, until, dryRun: args.dryRun, noActions: args.noActions });
    return;
  }

  if (args.command === 'dashboard') {
    await buildDashboard({ clients: metaClients, since, until, dryRun: args.dryRun });
    return;
  }

  if (['alerts', 'alertas'].includes(args.command)) {
    await checkAlerts({ clients: metaClients, dryRun: args.dryRun });
    return;
  }

  if (args.command === 'run') {
    if (sheetOnlyClients.length) {
      await fillSheetOnly({ clients: sheetOnlyClients, since, until, dryRun: args.dryRun });
    }
    if (metaClients.length) {
      await syncSheets({ clients: metaClients, since, until, dryRun: args.dryRun });
      const analysis = await analyzeCampaigns({ clients: metaClients, since, until, dryRun: args.dryRun, noActions: args.noActions });
      await buildDashboard({ clients: metaClients, since, until, dryRun: args.dryRun, analyzedAdsByClient: analysis.analyzedAdsByClient });
      await checkAlerts({ clients: metaClients, dryRun: args.dryRun });
    }
    return;
  }

  throw new Error(`Comando inválido: ${args.command}. Use run, preenchimento, sync, analyze, dashboard, alerts ou validate.`);
}

main().catch((error) => {
  logger.error(error.stack || error.message);
  process.exit(1);
});

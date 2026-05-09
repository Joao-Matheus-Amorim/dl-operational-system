require('dotenv').config();

const { getClients, missingAccountClients } = require('./config/clients');
const { parseArgs } = require('./utils/cli');
const { currentMonthRange } = require('./utils/date');
const { logger } = require('./utils/logger');
const { MetaAdsClient } = require('./services/metaAds');
const { GoogleSheetsClient } = require('./services/googleSheets');
const { syncSheets } = require('./jobs/syncSheets');
const { analyzeCampaigns } = require('./jobs/analyzeCampaigns');
const { buildDashboard } = require('./jobs/buildDashboard');
const { checkAlerts } = require('./jobs/checkAlerts');

async function validate(clients) {
  const meta = new MetaAdsClient();
  const sheets = new GoogleSheetsClient();

  const me = await meta.validateToken();
  logger.info(`Meta API OK: ${me.name || me.id}`);

  const uniqueSheets = [...new Set(clients.map((client) => client.spreadsheetId))];
  for (const spreadsheetId of uniqueSheets) {
    const sheet = await sheets.validate(spreadsheetId);
    logger.info(`Google Sheets OK: ${sheet.properties.title}`);
  }

  const missing = missingAccountClients(clients);
  if (missing.length) {
    logger.warn(`Clientes sem adAccountId real: ${missing.map((client) => client.name).join(', ')}`);
  }
}

async function main() {
  const args = parseArgs();
  const clients = getClients(args.client);
  const defaultRange = currentMonthRange();
  const since = args.since || defaultRange.since;
  const until = args.until || defaultRange.until;

  logger.info('='.repeat(70));
  logger.info(`Comando: ${args.command} | Cliente: ${args.client} | Período: ${since} até ${until}`);
  logger.info(`Dry-run: ${args.dryRun} | No-actions: ${args.noActions}`);
  logger.info('='.repeat(70));

  if (args.command === 'validate') {
    await validate(clients);
    return;
  }

  if (args.command === 'sync') {
    await syncSheets({ clients, since, until, dryRun: args.dryRun });
    return;
  }

  if (args.command === 'analyze') {
    await analyzeCampaigns({ clients, since, until, dryRun: args.dryRun, noActions: args.noActions });
    return;
  }

  if (args.command === 'dashboard') {
    await buildDashboard({ clients, since, until, dryRun: args.dryRun });
    return;
  }

  if (args.command === 'alerts') {
    await checkAlerts({ clients, dryRun: args.dryRun });
    return;
  }

  if (args.command === 'run') {
    await syncSheets({ clients, since, until, dryRun: args.dryRun });
    const analysis = await analyzeCampaigns({ clients, since, until, dryRun: args.dryRun, noActions: args.noActions });
    await buildDashboard({ clients, since, until, dryRun: args.dryRun, analyzedAdsByClient: analysis.analyzedAdsByClient });
    await checkAlerts({ clients, dryRun: args.dryRun });
    return;
  }

  throw new Error(`Comando inválido: ${args.command}. Use run, sync, analyze, dashboard, alerts ou validate.`);
}

main().catch((error) => {
  logger.error(error.stack || error.message);
  process.exit(1);
});

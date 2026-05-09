require('dotenv').config();
const cron = require('node-cron');
const { getClients } = require('./src/config/clients');
const { currentMonthRange } = require('./src/utils/date');
const { logger } = require('./src/utils/logger');
const { syncSheets } = require('./src/jobs/syncSheets');
const { analyzeCampaigns } = require('./src/jobs/analyzeCampaigns');
const { buildDashboard } = require('./src/jobs/buildDashboard');
const { checkAlerts } = require('./src/jobs/checkAlerts');

const timezone = process.env.TIMEZONE || 'America/Sao_Paulo';
const clients = getClients('all');

async function runDaily() {
  const { since, until } = currentMonthRange();
  logger.info(`[scheduler] Sync diário: ${since} até ${until}`);
  await syncSheets({ clients, since, until });
  const analysis = await analyzeCampaigns({ clients, since, until });
  await buildDashboard({ clients, since, until, analyzedAdsByClient: analysis.analyzedAdsByClient });
}

async function runAlerts() {
  logger.info('[scheduler] Verificando alertas de saldo/status');
  await checkAlerts({ clients });
}

async function runAnalyze() {
  const { since, until } = currentMonthRange();
  logger.info(`[scheduler] Análise de performance: ${since} até ${until}`);
  await analyzeCampaigns({ clients, since, until });
}

cron.schedule(process.env.CRON_DAILY_SYNC || '0 23 * * *', () => runDaily().catch((err) => logger.error(err.stack || err.message)), { timezone });
cron.schedule(process.env.CRON_ALERTS || '0 8,14 * * *', () => runAlerts().catch((err) => logger.error(err.stack || err.message)), { timezone });
cron.schedule(process.env.CRON_ANALYZE || '0 9 * * 1-6', () => runAnalyze().catch((err) => logger.error(err.stack || err.message)), { timezone });

logger.info(`Scheduler iniciado em ${timezone}.`);
logger.info(`Daily sync: ${process.env.CRON_DAILY_SYNC || '0 23 * * *'}`);
logger.info(`Alertas: ${process.env.CRON_ALERTS || '0 8,14 * * *'}`);
logger.info(`Análise: ${process.env.CRON_ANALYZE || '0 9 * * 1-6'}`);

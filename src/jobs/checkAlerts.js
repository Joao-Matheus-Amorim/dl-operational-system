const { MetaAdsClient } = require('../services/metaAds');
const { sendWhatsApp, formatBalanceAlert } = require('../services/alerts');
const { rules } = require('../config/rules');
const { logger } = require('../utils/logger');

async function checkAlerts({ clients, dryRun = false }) {
  const meta = new MetaAdsClient();
  const alerts = [];

  for (const client of clients) {
    if (!client.adAccountId || client.adAccountId.includes('PREENCHER')) continue;

    const balance = await meta.getBalance(client.adAccountId);
    logger.info(`Saldo ${client.name}: R$ ${balance.balance.toFixed(2)} | status ${balance.status}`);

    if (balance.balance <= rules.alertBalanceMinBRL) {
      const alert = { cliente: client.name, tipo: 'SALDO_FINALIZANDO', saldo: balance.balance, limite: rules.alertBalanceMinBRL };
      alerts.push(alert);
      await sendWhatsApp(formatBalanceAlert(client, balance), dryRun);
    }

    if (balance.status !== 1) {
      const msg = `🚨 *Conta de anúncio inativa — ${client.name}*\nConta: ${client.adAccountId}\nStatus Meta: ${balance.status}`;
      alerts.push({ cliente: client.name, tipo: 'CONTA_INATIVA', status: balance.status });
      await sendWhatsApp(msg, dryRun);
    }
  }

  return alerts;
}

module.exports = { checkAlerts };

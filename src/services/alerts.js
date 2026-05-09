const axios = require('axios');
const { logger } = require('../utils/logger');

async function sendWhatsApp(message, dryRun = false) {
  const provider = process.env.WHATSAPP_PROVIDER || 'none';
  if (dryRun || provider === 'none') {
    logger.warn(`${dryRun ? '[DRY RUN] ' : ''}ALERTA:\n${message}`);
    return { dryRun, provider };
  }

  if (provider !== 'zapi') {
    logger.warn(`Provider WhatsApp não suportado: ${provider}. Mensagem só logada.`);
    logger.warn(message);
    return { provider, skipped: true };
  }

  const instance = process.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN;
  const clientToken = process.env.ZAPI_CLIENT_TOKEN;
  const phone = process.env.WHATSAPP_TO;

  if (!instance || !token || !phone) {
    logger.warn('Z-API incompleto. Mensagem só logada.');
    logger.warn(message);
    return { skipped: true };
  }

  const url = `https://api.z-api.io/instances/${instance}/token/${token}/send-text`;
  const headers = clientToken ? { 'Client-Token': clientToken } : {};
  const response = await axios.post(url, { phone, message }, { headers, timeout: 15000 });
  return response.data;
}

function formatCreativeAlert(row) {
  return [
    `⚠️ *Atenção em criativo — ${row.cliente}*`,
    `Campanha: ${row.campanha || '-'}`,
    `Conjunto: ${row.conjunto || '-'}`,
    `Criativo: ${row.criativo || row.ad_id || '-'}`,
    `Status: *${row.status_analise}*`,
    `Gasto: R$ ${row.gasto || 0}`,
    `Leads: ${row.leads || 0}`,
    `CPL: ${row.cpl || '-'}`,
    `CTR: ${row.ctr || '-'}%`,
    `Ação sugerida: ${row.acao_sugerida}`,
    `Motivo: ${row.motivo}`,
  ].join('\n');
}

function formatBalanceAlert(client, balance) {
  return [
    `🔴 *Saldo finalizando — ${client.name}*`,
    `Conta: ${client.adAccountId}`,
    `Saldo: R$ ${balance.balance.toFixed(2)}`,
    `Gasto histórico: R$ ${balance.amountSpent.toFixed(2)}`,
    `Status da conta: ${balance.status}`,
  ].join('\n');
}

module.exports = { sendWhatsApp, formatCreativeAlert, formatBalanceAlert };

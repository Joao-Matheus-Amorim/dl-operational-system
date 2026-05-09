require('dotenv').config();

const DEFAULT_SPREADSHEET_ID = process.env.SPREADSHEET_ID_TIAGO || '1xglEDDEf7ZIwx_dFnHuL_i9ZPC15vpXAz9Tlscsz3V0';

function numberEnv(name, fallback = 0) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

const clients = [
  {
    key: 'otica1',
    name: process.env.OTICA1_NAME || 'Ótica 1',
    adAccountId: process.env.OTICA1_AD_ACCOUNT_ID || 'act_PREENCHER_OTICA_1',
    spreadsheetId: process.env.OTICA1_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID,
    tabPrefix: process.env.OTICA1_TAB_PREFIX || 'Ótica 1',
    leadValue: numberEnv('OTICA1_LEAD_VALUE', 0),
    monthlyGoalLeads: numberEnv('OTICA1_MONTHLY_GOAL_LEADS', 100),
    monthlyGoalSpend: numberEnv('OTICA1_MONTHLY_GOAL_SPEND', 1500),
  },
  {
    key: 'otica2',
    name: process.env.OTICA2_NAME || 'Ótica 2',
    adAccountId: process.env.OTICA2_AD_ACCOUNT_ID || 'act_PREENCHER_OTICA_2',
    spreadsheetId: process.env.OTICA2_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID,
    tabPrefix: process.env.OTICA2_TAB_PREFIX || 'Ótica 2',
    leadValue: numberEnv('OTICA2_LEAD_VALUE', 0),
    monthlyGoalLeads: numberEnv('OTICA2_MONTHLY_GOAL_LEADS', 100),
    monthlyGoalSpend: numberEnv('OTICA2_MONTHLY_GOAL_SPEND', 1500),
  },
];

function getClients(clientKey = 'all') {
  if (!clientKey || clientKey === 'all' || clientKey === 'todos') {
    return clients;
  }
  const found = clients.find((client) => client.key === clientKey || client.name.toLowerCase() === clientKey.toLowerCase());
  if (!found) {
    throw new Error(`Cliente inválido: ${clientKey}. Use: all, otica1 ou otica2.`);
  }
  return [found];
}

function missingAccountClients(selectedClients) {
  return selectedClients.filter((client) => !client.adAccountId || client.adAccountId.includes('PREENCHER'));
}

module.exports = { clients, getClients, missingAccountClients };

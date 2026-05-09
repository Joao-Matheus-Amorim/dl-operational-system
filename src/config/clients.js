require('dotenv').config();

const DEFAULT_SPREADSHEET_ID = process.env.SPREADSHEET_ID_TIAGO || '1xglEDDEf7ZIwx_dFnHuL_i9ZPC15vpXAz9Tlscsz3V0';

function numberEnv(name, fallback = 0) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

function parseJsonEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`${name} contém JSON inválido: ${error.message}`);
  }
}

function buildDentalUnits() {
  const accounts = parseJsonEnv('DENTAL_AD_ACCOUNTS_JSON', {});
  const base = [
    ['Pimentas', 'C', 'D', 'E'],
    ['Guarulhos Nazaré', 'F', 'G', 'H'],
    ['Franco da Rocha', 'I', 'J', 'K'],
    ['Mogi Guaçu', 'L', 'M', 'N'],
    ['J. Bonifacio Abril', 'O', 'P', 'Q'],
    ['Lageado Abril', 'R', 'S', 'T'],
    ['Itaquera 3', 'U', 'V', 'W'],
    ['Guaianazes', 'X', 'Y', 'Z'],
    ['Vila São Pedro', 'AA', 'AB', 'AC'],
    ['Ibiuna', 'AD', 'AE', 'AF'],
    ['Barbacena', 'AG', 'AH', 'AI'],
    ['Padre Menezes', 'AJ', 'AK', 'AL'],
    ['Eldorado', 'AM', 'AN', 'AO'],
    ['Yervant', 'AP', 'AQ', 'AR'],
    ['São João Del Rei', 'AS', 'AT', 'AU'],
    ['Grimalde', 'AV', 'AW', 'AX'],
    ['Limeira', 'AY', 'AZ', 'BA'],
    ['Lavras Guarulhos', 'BB', 'BC', 'BD'],
    ['Ferraz', 'BE', 'BF', 'BG'],
    ['Apolo', 'BH', 'BI', 'BJ'],
    ['Zaira', 'BK', 'BL', 'BM'],
    ['Carijós', 'BN', 'BO', 'BP'],
    ['Rudge Ramos', 'BQ', 'BR', 'BS'],
    ['Tatuapé', 'BT', 'BU', 'BV'],
    ['Itaquera 4', 'BW', 'BX', 'BY'],
    ['Calçadão', 'BZ', 'CA', 'CB'],
    ['Bragança', 'CC', 'CD', 'CE'],
    ['Suzano', 'CF', 'CG', 'CH'],
    ['Tucuruvi', 'CI', 'CJ', 'CK'],
    ['Mairiporã', 'CL', 'CM', 'CN'],
    ['Vila São José', 'CO', 'CP', 'CQ'],
    ['Mooca', 'CR', 'CS', 'CT'],
    ['Sapopemba', 'CU', 'CV', 'CW'],
    ['Poá', 'CX', 'CY', 'CZ'],
    ['Amparo', 'DA', 'DB', 'DC'],
    ['Itapetininga', 'DD', 'DE', 'DF'],
    ['Barro Branco', 'DG', 'DH', 'DI'],
  ];

  return base.map(([name, leadsColumn, cplColumn, valueColumn]) => ({
    name,
    adAccountId: accounts[name] || 'act_PREENCHER',
    leadsColumn,
    cplColumn,
    valueColumn,
  }));
}

function normalizeExtraClient(client) {
  return {
    key: client.key,
    name: client.name,
    mode: client.mode || 'meta_full',
    adAccountId: client.adAccountId || client.ad_account_id || 'act_PREENCHER',
    spreadsheetId: client.spreadsheetId || client.spreadsheet_id || DEFAULT_SPREADSHEET_ID,
    tabPrefix: client.tabPrefix || client.tab_prefix || client.name,
    leadValue: Number(client.leadValue || client.lead_value || 0),
    monthlyGoalLeads: Number(client.monthlyGoalLeads || client.monthly_goal_leads || 100),
    monthlyGoalSpend: Number(client.monthlyGoalSpend || client.monthly_goal_spend || 1500),
    sheetName: client.sheetName || client.sheet_name || client.aba || null,
    sheetGid: client.sheetGid || client.sheet_gid || null,
    rowOffset: Number(client.rowOffset || client.row_offset || 2),
    writeCpl: client.writeCpl === true,
    units: client.units || [],
  };
}

const baseClients = [
  {
    key: 'dental',
    name: process.env.DENTAL_NAME || 'Dental Lead',
    mode: 'sheet_only',
    spreadsheetId: process.env.DENTAL_SHEET_ID || DEFAULT_SPREADSHEET_ID,
    sheetName: process.env.DENTAL_SHEET_ABA || null,
    sheetGid: process.env.DENTAL_SHEET_GID || '498302069',
    tabPrefix: process.env.DENTAL_TAB_PREFIX || 'Dental Lead',
    rowOffset: numberEnv('DENTAL_ROW_OFFSET', 2),
    writeCpl: ['1', 'true', 'yes', 'sim'].includes(String(process.env.DENTAL_WRITE_CPL || 'false').toLowerCase()),
    units: buildDentalUnits(),
  },
  {
    key: 'otica1',
    name: process.env.OTICA1_NAME || 'Ótica 1',
    mode: 'meta_full',
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
    mode: 'meta_full',
    adAccountId: process.env.OTICA2_AD_ACCOUNT_ID || 'act_PREENCHER_OTICA_2',
    spreadsheetId: process.env.OTICA2_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID,
    tabPrefix: process.env.OTICA2_TAB_PREFIX || 'Ótica 2',
    leadValue: numberEnv('OTICA2_LEAD_VALUE', 0),
    monthlyGoalLeads: numberEnv('OTICA2_MONTHLY_GOAL_LEADS', 100),
    monthlyGoalSpend: numberEnv('OTICA2_MONTHLY_GOAL_SPEND', 1500),
  },
];

const extraClients = parseJsonEnv('EXTRA_CLIENTS_JSON', []).map(normalizeExtraClient);
const clients = [...baseClients, ...extraClients];

function isMetaClient(client) {
  return client.mode !== 'sheet_only';
}

function isSheetOnlyClient(client) {
  return client.mode === 'sheet_only';
}

function getClients(clientKey = 'all') {
  const key = String(clientKey || 'all').toLowerCase();
  if (['all', 'todos'].includes(key)) return clients;
  if (['meta', 'oticas'].includes(key)) return clients.filter(isMetaClient);
  if (['sheet_only', 'planilhas'].includes(key)) return clients.filter(isSheetOnlyClient);

  const found = clients.find((client) => client.key.toLowerCase() === key || client.name.toLowerCase() === key);
  if (!found) {
    throw new Error(`Cliente inválido: ${clientKey}. Use: all, dental, oticas, otica1, otica2 ou uma key do EXTRA_CLIENTS_JSON.`);
  }
  return [found];
}

function getMetaClients(selectedClients) {
  return selectedClients.filter(isMetaClient);
}

function getSheetOnlyClients(selectedClients) {
  return selectedClients.filter(isSheetOnlyClient);
}

function missingAccountClients(selectedClients) {
  const missing = [];
  for (const client of selectedClients) {
    if (isMetaClient(client) && (!client.adAccountId || client.adAccountId.includes('PREENCHER'))) {
      missing.push(client);
    }
    if (isSheetOnlyClient(client)) {
      for (const unit of client.units || []) {
        if (!unit.adAccountId || unit.adAccountId.includes('PREENCHER')) {
          missing.push({ name: `${client.name} / ${unit.name}` });
        }
      }
    }
  }
  return missing;
}

module.exports = {
  clients,
  getClients,
  getMetaClients,
  getSheetOnlyClients,
  missingAccountClients,
  isMetaClient,
  isSheetOnlyClient,
};

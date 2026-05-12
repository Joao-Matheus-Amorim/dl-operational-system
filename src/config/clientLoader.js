const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const CLIENTS_DIR = path.join(__dirname, '../../data/clients');

function walkFiles(dir, extensions = ['.yaml', '.yml', '.json']) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(fullPath, extensions));
    if (entry.isFile() && extensions.some((extension) => entry.name.endsWith(extension))) files.push(fullPath);
  }

  return files;
}

function readConfigFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) return yaml.load(content);
  return JSON.parse(content);
}

function normalizeYamlClient(config, sourcePath) {
  if (config.sheets) {
    return {
      id: config.id,
      companyId: config.companyId,
      companyName: config.companyName || config.name,
      group: config.group || 'servicos',
      segment: config.segment,
      state: config.state,
      timezone: config.timezone,
      active: config.active !== false,
      spreadsheetId: config.sheets.spreadsheetId,
      sheetName: config.sheets.sheetName,
      rowOffset: config.sheets.rowOffset,
      emptyMode: config.sheets.emptyMode,
      meta: config.meta || {},
      columnLayout: config.sheets.columnLayout,
      modules: config.modules || {},
      rules: config.rules || {},
      notifications: config.notifications || {},
      whatsapp: config.notifications?.whatsapp || {},
      units: (config.units || []).map((unit) => ({
        ...unit,
        state: unit.state || config.state,
      })),
      sourcePath,
      sourceFormat: sourcePath.endsWith('.json') ? 'json' : 'yaml',
    };
  }

  return {
    ...config,
    sourcePath,
    sourceFormat: sourcePath.endsWith('.json') ? 'json' : 'yaml',
  };
}

function required(value, field, errors) {
  if (value === undefined || value === null || value === '') errors.push(`${field} obrigatório`);
}

function validateClientConfig(config) {
  const errors = [];

  required(config.companyId || config.id, 'companyId/id', errors);
  required(config.companyName || config.name, 'companyName/name', errors);
  required(config.segment, 'segment', errors);
  required(config.state, 'state', errors);
  required(config.spreadsheetId || config.sheets?.spreadsheetId, 'spreadsheetId', errors);
  required(config.sheetName || config.sheets?.sheetName, 'sheetName', errors);

  const meta = config.meta || {};
  required(meta.mode, 'meta.mode', errors);
  required(meta.adAccountId, 'meta.adAccountId', errors);
  required(meta.insightLevel, 'meta.insightLevel', errors);

  const units = config.units || [];
  if (!Array.isArray(units) || units.length === 0) errors.push('units deve conter ao menos uma unidade');

  for (const [index, unit] of units.entries()) {
    required(unit.key, `units[${index}].key`, errors);
    required(unit.name, `units[${index}].name`, errors);
    if (meta.mode === 'shared_ad_account' && !unit.campaignMatch) {
      errors.push(`units[${index}].campaignMatch obrigatório para shared_ad_account`);
    }
  }

  if (errors.length) {
    const source = config.sourcePath ? ` em ${config.sourcePath}` : '';
    throw new Error(`Configuração de cliente inválida${source}: ${errors.join('; ')}`);
  }

  return true;
}

function preferenceKey(filePath) {
  return filePath
    .replace(/\\/g, '/')
    .replace(/\.json$/, '')
    .replace(/\.ya?ml$/, '')
    .replace(/\/servicos\//, '/')
    .replace(/\/admin\//, '/');
}

function preferYamlOverJson(files) {
  const byKey = new Map();

  for (const file of files) {
    const key = preferenceKey(file);
    const current = byKey.get(key);
    if (!current) {
      byKey.set(key, file);
      continue;
    }

    const currentIsYaml = current.endsWith('.yaml') || current.endsWith('.yml');
    const fileIsYaml = file.endsWith('.yaml') || file.endsWith('.yml');
    if (fileIsYaml && !currentIsYaml) byKey.set(key, file);
  }

  return [...byKey.values()];
}

function loadAllClients() {
  const files = preferYamlOverJson(walkFiles(CLIENTS_DIR));
  return files.map((filePath) => {
    const parsed = readConfigFile(filePath);
    const normalized = normalizeYamlClient(parsed, filePath);
    validateClientConfig(normalized);
    return normalized;
  });
}

function loadClient(clientId) {
  const clients = loadAllClients();
  const found = clients.find((client) => client.id === clientId || client.companyId === clientId || client.name === clientId);
  if (!found) throw new Error(`Cliente não encontrado: ${clientId}`);
  return found;
}

module.exports = {
  loadClient,
  loadAllClients,
  validateClientConfig,
  readConfigFile,
  normalizeYamlClient,
  walkFiles,
};

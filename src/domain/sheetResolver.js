const { getCompany } = require('../config/companyLoader');
const { parseDateOnly } = require('./dateRangeResolver');

const MONTH_ALIASES = {
  1: ['janeiro', 'jan'],
  2: ['fevereiro', 'fev'],
  3: ['março', 'marco', 'mar'],
  4: ['abril', 'abr'],
  5: ['maio', 'mai'],
  6: ['junho', 'jun'],
  7: ['julho', 'jul'],
  8: ['agosto', 'ago'],
  9: ['setembro', 'set'],
  10: ['outubro', 'out'],
  11: ['novembro', 'nov'],
  12: ['dezembro', 'dez'],
};

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function monthMatches(catalogMonth, dateMonthIndex) {
  const value = normalize(catalogMonth);
  return (MONTH_ALIASES[dateMonthIndex] || []).some((alias) => normalize(alias) === value);
}

function resolveSheetForDate({ companyId = 'cmp_dental_leads', state, date, explicitSheetName = null } = {}) {
  if (explicitSheetName) return { sheetName: explicitSheetName, source: 'explicit' };

  if (!state) throw new Error('state é obrigatório para resolver a aba da planilha.');
  const company = getCompany(companyId);
  if (!company) throw new Error(`Empresa não encontrada: ${companyId}`);

  const parsedDate = parseDateOnly(date, 'date');
  const monthNumber = parsedDate.getMonth() + 1;
  const year = parsedDate.getFullYear();
  const normalizedState = normalize(state);
  const catalog = company.sheetCatalog || [];

  const match = catalog.find((entry) => {
    const sameState = normalize(entry.state) === normalizedState;
    const sameYear = !entry.year || Number(entry.year) === year;
    const sameMonth = monthMatches(entry.month, monthNumber);
    return sameState && sameYear && sameMonth;
  });

  if (!match) {
    const available = catalog
      .filter((entry) => normalize(entry.state) === normalizedState)
      .map((entry) => `${entry.sheetName} (${entry.month}/${entry.year || 'sem ano'})`)
      .join(', ') || 'nenhuma aba cadastrada para o estado';
    throw new Error(`Nenhuma aba encontrada para ${state} em ${date}. Abas disponíveis: ${available}`);
  }

  return {
    sheetName: match.sheetName,
    gid: match.gid || null,
    state: match.state,
    month: match.month,
    year: match.year || year,
    source: 'catalog',
  };
}

function resolveSheetNameForUnit(unit, date, options = {}) {
  const companyId = options.companyId || unit.companyId || 'cmp_dental_leads';
  const state = options.state || unit.state;
  return resolveSheetForDate({
    companyId,
    state,
    date,
    explicitSheetName: options.sheetName || unit.sheetNameOverride || null,
  }).sheetName;
}

module.exports = {
  resolveSheetForDate,
  resolveSheetNameForUnit,
  monthMatches,
};

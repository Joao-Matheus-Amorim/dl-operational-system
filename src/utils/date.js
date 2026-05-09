function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function todaySaoPaulo() {
  const now = new Date();
  const local = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  return toISODate(local);
}

function daysAgoISO(days, baseISO = todaySaoPaulo()) {
  const date = new Date(`${baseISO}T12:00:00-03:00`);
  date.setDate(date.getDate() - days);
  return toISODate(date);
}

function currentMonthRange(baseISO = todaySaoPaulo()) {
  const date = new Date(`${baseISO}T12:00:00-03:00`);
  const first = new Date(date.getFullYear(), date.getMonth(), 1, 12);
  return { since: toISODate(first), until: baseISO };
}

module.exports = { toISODate, todaySaoPaulo, daysAgoISO, currentMonthRange };

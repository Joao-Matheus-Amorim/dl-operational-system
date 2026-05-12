function pad(value) {
  return String(value).padStart(2, '0');
}

function toDateOnly(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDateOnly(value, label = 'data') {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) {
    throw new Error(`${label} deve estar no formato YYYY-MM-DD.`);
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) throw new Error(`${label} inválida: ${value}`);
  return date;
}

function firstDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function previousDay(date) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() - 1);
  return copy;
}

function resolveDateRange({ since, until, day, today = false, pendingMonth = false, monthToDate = false, now = new Date() } = {}) {
  const activeModes = [day, today, pendingMonth, monthToDate, since || until].filter(Boolean).length;
  if (activeModes > 1) {
    throw new Error('Use apenas um modo de período: --day, --today, --pending-month, --month-to-date ou --since/--until.');
  }

  if (day) {
    parseDateOnly(day, 'day');
    return { since: day, until: day, mode: 'day' };
  }

  if (today) {
    const value = toDateOnly(now);
    return { since: value, until: value, mode: 'today' };
  }

  if (pendingMonth) {
    const start = firstDayOfMonth(now);
    const end = previousDay(now);
    if (end < start) {
      throw new Error('pending-month não possui dias pendentes no primeiro dia do mês. Use --today ou --month-to-date.');
    }
    return { since: toDateOnly(start), until: toDateOnly(end), mode: 'pending-month' };
  }

  if (monthToDate) {
    return { since: toDateOnly(firstDayOfMonth(now)), until: toDateOnly(now), mode: 'month-to-date' };
  }

  if (since || until) {
    if (!since || !until) throw new Error('Use --since e --until juntos.');
    const start = parseDateOnly(since, 'since');
    const end = parseDateOnly(until, 'until');
    if (end < start) throw new Error('--until não pode ser menor que --since.');
    return { since, until, mode: 'custom' };
  }

  const value = toDateOnly(now);
  return { since: value, until: value, mode: 'today-default' };
}

module.exports = {
  resolveDateRange,
  parseDateOnly,
  toDateOnly,
};

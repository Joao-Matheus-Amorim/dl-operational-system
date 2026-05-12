function pad(value) {
  return String(value).padStart(2, '0');
}

function toDateOnly(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function dateOnlyInTimeZone(date = new Date(), timeZone = 'UTC') {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
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

function hasManualPeriod({ since, until, day, today, pendingMonth, monthToDate } = {}) {
  return Boolean(day || today || pendingMonth || monthToDate || since || until);
}

function modeFlags(defaultDateMode) {
  return {
    today: defaultDateMode === 'today',
    pendingMonth: defaultDateMode === 'pending-month',
    monthToDate: defaultDateMode === 'month-to-date',
  };
}

function resolveDateRange({
  since,
  until,
  day,
  today = false,
  pendingMonth = false,
  monthToDate = false,
  now = new Date(),
  timeZone = 'UTC',
  defaultDateMode = 'month-to-date',
} = {}) {
  const operationalDate = dateOnlyInTimeZone(now, timeZone);
  const operationalNow = parseDateOnly(operationalDate, 'operationalDate');
  const defaultFlags = hasManualPeriod({ since, until, day, today, pendingMonth, monthToDate })
    ? { today, pendingMonth, monthToDate }
    : modeFlags(defaultDateMode);

  const effectiveToday = defaultFlags.today;
  const effectivePendingMonth = defaultFlags.pendingMonth;
  const effectiveMonthToDate = defaultFlags.monthToDate;

  const activeModes = [day, effectiveToday, effectivePendingMonth, effectiveMonthToDate, since || until].filter(Boolean).length;
  if (activeModes > 1) {
    throw new Error('Use apenas um modo de período: --day, --today, --pending-month, --month-to-date ou --since/--until.');
  }

  if (day) {
    parseDateOnly(day, 'day');
    return { since: day, until: day, mode: 'day', operationalDate, timeZone };
  }

  if (effectiveToday) {
    return { since: operationalDate, until: operationalDate, mode: today ? 'today' : 'today-default', operationalDate, timeZone };
  }

  if (effectivePendingMonth) {
    const start = firstDayOfMonth(operationalNow);
    const end = previousDay(operationalNow);
    if (end < start) {
      throw new Error('pending-month não possui dias pendentes no primeiro dia do mês. Use --today ou --month-to-date.');
    }
    return {
      since: toDateOnly(start),
      until: toDateOnly(end),
      mode: pendingMonth ? 'pending-month' : 'pending-month-default',
      operationalDate,
      timeZone,
    };
  }

  if (effectiveMonthToDate) {
    return {
      since: toDateOnly(firstDayOfMonth(operationalNow)),
      until: operationalDate,
      mode: monthToDate ? 'month-to-date' : 'month-to-date-default',
      operationalDate,
      timeZone,
    };
  }

  if (since || until) {
    if (!since || !until) throw new Error('Use --since e --until juntos.');
    const start = parseDateOnly(since, 'since');
    const end = parseDateOnly(until, 'until');
    if (end < start) throw new Error('--until não pode ser menor que --since.');
    return { since, until, mode: 'custom', operationalDate, timeZone };
  }

  return {
    since: toDateOnly(firstDayOfMonth(operationalNow)),
    until: operationalDate,
    mode: 'month-to-date-default',
    operationalDate,
    timeZone,
  };
}

module.exports = {
  resolveDateRange,
  parseDateOnly,
  toDateOnly,
  dateOnlyInTimeZone,
};

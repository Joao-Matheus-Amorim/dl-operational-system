function columnToNumber(column) {
  const letters = String(column || '').trim().toUpperCase();
  if (!/^[A-Z]+$/.test(letters)) throw new Error(`Coluna inválida: ${column}`);

  let value = 0;
  for (const char of letters) {
    value = value * 26 + (char.charCodeAt(0) - 64);
  }
  return value;
}

function numberToColumn(number) {
  let n = Number(number);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`Número de coluna inválido: ${number}`);

  let column = '';
  while (n > 0) {
    const remainder = (n - 1) % 26;
    column = String.fromCharCode(65 + remainder) + column;
    n = Math.floor((n - 1) / 26);
  }
  return column;
}

function offsetColumn(column, offset) {
  return numberToColumn(columnToNumber(column) + Number(offset || 0));
}

function deriveUnitColumns(layout = {}, index = 0) {
  const firstColumn = layout.firstColumn || 'C';
  const unitWidth = Number(layout.unitWidth || 3);
  const fields = layout.fields || ['leads', 'cpl', 'value'];
  const startColumn = offsetColumn(firstColumn, index * unitWidth);
  const columns = {};

  for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex += 1) {
    columns[fields[fieldIndex]] = offsetColumn(startColumn, fieldIndex);
  }

  return columns;
}

module.exports = {
  columnToNumber,
  numberToColumn,
  offsetColumn,
  deriveUnitColumns,
};

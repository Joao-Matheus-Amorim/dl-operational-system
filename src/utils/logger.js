const fs = require('fs');
const path = require('path');

const logsDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

function line(level, message, meta) {
  const timestamp = new Date().toISOString();
  const text = meta ? `${timestamp} [${level}] ${message} ${JSON.stringify(meta)}` : `${timestamp} [${level}] ${message}`;
  fs.appendFileSync(path.join(logsDir, 'app.log'), `${text}\n`);
  if (level === 'ERROR') console.error(text);
  else console.log(text);
}

const logger = {
  info: (message, meta) => line('INFO', message, meta),
  warn: (message, meta) => line('WARN', message, meta),
  error: (message, meta) => line('ERROR', message, meta),
};

module.exports = { logger };

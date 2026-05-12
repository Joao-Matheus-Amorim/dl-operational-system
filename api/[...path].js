const { listClients, getClient, consolidated } = require('../src/web/mockData');
const { notifyWhatsapp, listNotifications } = require('../src/services/notificationCenter');
const { listTasks, listTaskRuns, runTask } = require('../src/services/taskRunner');
const {
  listPersistedNotifications,
  listPersistedJobRuns,
  listUnitRunResults,
} = require('../src/database/repositories');
const {
  setSecurityHeaders,
  enforceRateLimit,
  requireOperationalAuth,
  validateTaskRunBody,
  validateAlertDemoBody,
  validateActionBody,
  validationError,
} = require('../src/security/httpSecurity');

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload, null, 2));
}

function readBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); } catch (_) { resolve({ raw: body }); }
    });
  });
}

function protectPublicApi(req, res) {
  return enforceRateLimit(req, res, { scope: 'api_public', max: Number(process.env.API_RATE_LIMIT_MAX || 120) });
}

function protectOperationalApi(req, res) {
  if (!enforceRateLimit(req, res, { scope: 'api_operational', max: Number(process.env.OPERATIONAL_RATE_LIMIT_MAX || 30) })) return false;
  return requireOperationalAuth(req, res);
}

function numberParam(url, name, fallback) {
  const value = Number(url.searchParams.get(name));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function filterUnitResults(rows = [], url) {
  const state = url.searchParams.get('state');
  const status = url.searchParams.get('status');
  return rows.filter((row) => {
    if (state && String(row.state || '').toLowerCase() !== state.toLowerCase()) return false;
    if (status && String(row.status || '').toLowerCase() !== status.toLowerCase()) return false;
    return true;
  });
}

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);

  try {
    if (!protectPublicApi(req, res)) return;

    const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
    const path = url.pathname;

    if (path === '/api/health') {
      return sendJson(res, 200, { ok: true, service: 'trafego-automator', runtime: 'vercel-serverless' });
    }

    if (path === '/api/clients') return sendJson(res, 200, listClients());

    if (path === '/api/dashboard') {
      const client = url.searchParams.get('client') || 'all';
      return sendJson(res, 200, client === 'all' ? consolidated() : getClient(client));
    }

    if (path === '/api/campaigns') {
      const client = url.searchParams.get('client') || 'all';
      const data = client === 'all' ? consolidated() : getClient(client);
      return sendJson(res, 200, data.campaigns || []);
    }

    if (path === '/api/adsets') {
      const client = url.searchParams.get('client') || 'all';
      const data = client === 'all' ? consolidated() : getClient(client);
      return sendJson(res, 200, data.adsets || []);
    }

    if (path === '/api/creatives') {
      const client = url.searchParams.get('client') || 'all';
      const data = client === 'all' ? consolidated() : getClient(client);
      return sendJson(res, 200, data.creatives || []);
    }

    if (path === '/api/alerts') {
      const client = url.searchParams.get('client') || 'all';
      const data = client === 'all' ? consolidated() : getClient(client);
      return sendJson(res, 200, data.alerts || []);
    }

    if (path === '/api/notifications') return sendJson(res, 200, listNotifications());
    if (path === '/api/tasks') return sendJson(res, 200, listTasks());
    if (path === '/api/tasks/runs') return sendJson(res, 200, listTaskRuns());

    if (path === '/api/history/notifications') {
      if (!protectOperationalApi(req, res)) return;
      const limit = numberParam(url, 'limit', 50);
      return sendJson(res, 200, { ok: true, data: listPersistedNotifications({ limit }) || [] });
    }

    if (path === '/api/history/job-runs') {
      if (!protectOperationalApi(req, res)) return;
      const limit = numberParam(url, 'limit', 50);
      return sendJson(res, 200, { ok: true, data: listPersistedJobRuns({ limit }) || [] });
    }

    if (path === '/api/history/unit-results') {
      if (!protectOperationalApi(req, res)) return;
      const limit = numberParam(url, 'limit', 100);
      const jobRunId = url.searchParams.get('jobRunId') || undefined;
      const rows = listUnitRunResults({ jobRunId, limit }) || [];
      return sendJson(res, 200, { ok: true, data: filterUnitResults(rows, url) });
    }

    if (path === '/api/tasks/run' && req.method === 'POST') {
      if (!protectOperationalApi(req, res)) return;
      const body = await readBody(req);
      const validation = validateTaskRunBody(body);
      if (!validation.ok) return validationError(res, validation.errors);
      const run = await runTask(body.taskKey || 'full_cycle', { real: body.real === true });
      return sendJson(res, 200, run);
    }

    if (path === '/api/alerts/send-demo' && req.method === 'POST') {
      if (!protectOperationalApi(req, res)) return;
      const body = await readBody(req);
      const validation = validateAlertDemoBody(body);
      if (!validation.ok) return validationError(res, validation.errors);
      const result = await notifyWhatsapp({
        client: body.client || 'Ótica 2',
        type: body.type || 'SEM_LEAD_COM_GASTO',
        severity: body.severity || 'critical',
        title: body.title || '🚨 Alerta em tempo real',
        message: body.message || 'Criativo gastou verba sem gerar leads. O sistema recomenda pausar ou testar isolado.',
        action: body.action || '1 pausar | 2 testar isolado | 3 manter rodando',
        payload: body.payload || { creativeId: 'ad_demo' },
      }, { dryRun: true });
      return sendJson(res, 200, result);
    }

    if (path === '/api/actions/pause-creative' && req.method === 'POST') {
      if (!protectOperationalApi(req, res)) return;
      const body = await readBody(req);
      const validation = validateActionBody(body);
      if (!validation.ok) return validationError(res, validation.errors);
      const result = await notifyWhatsapp({
        client: body.client || 'Sistema',
        type: 'ACTION_PAUSE_CREATIVE',
        severity: 'warning',
        title: '⏸️ Pausa simulada de criativo',
        message: `Pedido de pausa registrado para ${body.creativeId || 'criativo selecionado'}.`,
        action: 'No modo real, chama a Meta API.',
        payload: body,
      }, { dryRun: true });
      return sendJson(res, 200, { ok: true, dryRun: true, result });
    }

    if (path === '/api/actions/test-campaign' && req.method === 'POST') {
      if (!protectOperationalApi(req, res)) return;
      const body = await readBody(req);
      const validation = validateActionBody(body);
      if (!validation.ok) return validationError(res, validation.errors);
      const result = await notifyWhatsapp({
        client: body.client || 'Sistema',
        type: 'ACTION_CREATE_TEST_CAMPAIGN',
        severity: 'info',
        title: '🧪 Campanha teste simulada',
        message: `Pedido de campanha isolada registrado para ${body.creativeId || 'criativo selecionado'}.`,
        action: 'No modo real, cria campanha pausada de teste.',
        payload: body,
      }, { dryRun: true });
      return sendJson(res, 200, { ok: true, dryRun: true, result });
    }

    return sendJson(res, 404, { ok: false, error: 'Endpoint não encontrado', path });
  } catch (error) {
    return sendJson(res, 500, { ok: false, error: error.message });
  }
};

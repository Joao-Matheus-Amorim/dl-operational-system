const { number, round } = require('./metrics');

function classifyCreative(row, rules) {
  const spend = number(row.gasto);
  const leads = number(row.leads);
  const cpl = number(row.cpl);
  const ctr = number(row.ctr);
  const impressions = number(row.impressoes);

  if (spend === 0 && impressions >= rules.minImpressionsToEvaluate) {
    return {
      status: 'SEM_GASTO',
      severity: 'warning',
      action: 'NOTIFY',
      reason: `Criativo com ${impressions} impressões e sem gasto registrado. Verificar entrega, aprovação, público ou orçamento.`,
    };
  }

  if (spend >= rules.maxSpendWithoutLeadBRL && leads === 0) {
    return {
      status: 'SEM_LEAD_COM_GASTO',
      severity: 'critical',
      action: 'PAUSE_OR_REBUILD',
      reason: `Gastou R$ ${round(spend)} e não gerou leads.`,
    };
  }

  if (leads > 0 && cpl > rules.alertCplMaxBRL && spend >= rules.minSpendToEvaluateBRL) {
    return {
      status: 'CPL_ALTO',
      severity: 'critical',
      action: 'PAUSE_OR_ADJUST',
      reason: `CPL R$ ${round(cpl)} acima do limite de R$ ${rules.alertCplMaxBRL}.`,
    };
  }

  if (leads >= rules.minLeadsForWinner && cpl > 0 && cpl <= rules.goodCplBRL && ctr >= rules.minCtrGood) {
    return {
      status: 'DESTAQUE',
      severity: 'success',
      action: 'SCALE_OR_ISOLATE_TEST',
      reason: `Bom criativo: ${leads} leads, CPL R$ ${round(cpl)} e CTR ${round(ctr)}%.`,
    };
  }

  if (spend >= rules.minSpendToEvaluateBRL && ctr > 0 && ctr < 0.7) {
    return {
      status: 'CTR_BAIXO',
      severity: 'warning',
      action: 'REVIEW_CREATIVE',
      reason: `CTR ${round(ctr)}% abaixo do saudável. Testar nova chamada, imagem/vídeo ou público.`,
    };
  }

  return {
    status: 'OK',
    severity: 'info',
    action: 'KEEP_RUNNING',
    reason: 'Sem problema crítico no período analisado.',
  };
}

function classifyCampaign(row, rules) {
  const spend = number(row.gasto);
  const leads = number(row.leads);
  const cpl = number(row.cpl);

  if (spend >= rules.maxSpendWithoutLeadBRL && leads === 0) {
    return {
      status: 'CAMPANHA_SEM_LEAD',
      severity: 'critical',
      action: 'REVIEW_CAMPAIGN',
      reason: `Campanha gastou R$ ${round(spend)} sem leads. Revisar objetivo, formulário, público e criativos.`,
    };
  }

  if (leads > 0 && cpl > rules.alertCplMaxBRL) {
    return {
      status: 'CAMPANHA_CPL_ALTO',
      severity: 'warning',
      action: 'OPTIMIZE_CAMPAIGN',
      reason: `CPL médio R$ ${round(cpl)} acima de R$ ${rules.alertCplMaxBRL}.`,
    };
  }

  return {
    status: 'OK',
    severity: 'info',
    action: 'KEEP_RUNNING',
    reason: 'Campanha dentro dos limites configurados.',
  };
}

function analyzeRows(rows, rules, kind = 'creative') {
  return rows.map((row) => {
    const result = kind === 'campaign' ? classifyCampaign(row, rules) : classifyCreative(row, rules);
    return {
      ...row,
      status_analise: result.status,
      severidade: result.severity,
      acao_sugerida: result.action,
      motivo: result.reason,
    };
  });
}

function onlyActionable(rows) {
  return rows.filter((row) => !['OK', 'KEEP_RUNNING'].includes(row.status_analise) && row.acao_sugerida !== 'KEEP_RUNNING');
}

module.exports = { classifyCreative, classifyCampaign, analyzeRows, onlyActionable };

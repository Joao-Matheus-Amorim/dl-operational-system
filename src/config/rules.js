require('dotenv').config();

function num(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

function bool(name, fallback = false) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  return ['1', 'true', 'yes', 'sim'].includes(String(raw).toLowerCase());
}

const rules = {
  alertBalanceMinBRL: num('ALERT_BALANCE_MIN_BRL', 50),
  alertCplMaxBRL: num('ALERT_CPL_MAX_BRL', 30),
  minSpendToEvaluateBRL: num('MIN_SPEND_TO_EVALUATE_BRL', 20),
  maxSpendWithoutLeadBRL: num('MAX_SPEND_WITHOUT_LEAD_BRL', 40),
  minImpressionsToEvaluate: num('MIN_IMPRESSIONS_TO_EVALUATE', 500),
  minCtrGood: num('MIN_CTR_GOOD', 1.0),
  minLeadsForWinner: num('MIN_LEADS_FOR_WINNER', 5),
  goodCplBRL: num('GOOD_CPL_BRL', 20),
  actionMode: process.env.ACTION_MODE || 'notify',
  autoPauseEnabled: bool('AUTO_PAUSE_ENABLED', false),
  createTestCampaignEnabled: bool('CREATE_TEST_CAMPAIGN_ENABLED', false),
  testCampaignDailyBudgetCents: num('TEST_CAMPAIGN_DAILY_BUDGET_CENTS', 3000),
};

module.exports = { rules };

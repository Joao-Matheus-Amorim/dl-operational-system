const axios = require('axios');
const { logger } = require('../utils/logger');

class MetaActionsClient {
  constructor({ accessToken = process.env.META_ACCESS_TOKEN, version = process.env.META_API_VERSION || 'v19.0' } = {}) {
    if (!accessToken) throw new Error('META_ACCESS_TOKEN não configurado.');
    this.accessToken = accessToken;
    this.baseUrl = `https://graph.facebook.com/${version}`;
  }

  async post(path, params = {}, dryRun = false) {
    if (dryRun) {
      logger.info(`[DRY RUN] POST ${path}`, params);
      return { dryRun: true, path, params };
    }

    const response = await axios.post(`${this.baseUrl}/${path.replace(/^\//, '')}`, null, {
      params: { access_token: this.accessToken, ...params },
      timeout: 30000,
    });
    return response.data;
  }

  async pauseAd(adId, dryRun = false) {
    if (!adId) throw new Error('pauseAd recebeu adId vazio.');
    const result = await this.post(`/${adId}`, { status: 'PAUSED' }, dryRun);
    logger.warn(`${dryRun ? '[DRY RUN] ' : ''}Anúncio pausado: ${adId}`);
    return result;
  }

  async createPausedTestCampaignFromAdset({ adAccountId, adsetId, creativeName, dailyBudgetCents }, dryRun = false) {
    if (!adsetId) throw new Error('Para criar campanha teste é necessário ter adsetId.');

    const today = new Date().toISOString().slice(0, 10);
    const campaignName = `[TESTE CRIATIVO] ${creativeName || adsetId} — ${today}`;

    if (dryRun) {
      logger.info(`[DRY RUN] Criaria campanha pausada de teste: ${campaignName}`);
      return { dryRun: true, campaignName };
    }

    const campaign = await this.post(`/${adAccountId}/campaigns`, {
      name: campaignName,
      objective: 'LEAD_GENERATION',
      status: 'PAUSED',
      special_ad_categories: '[]',
    });

    const copy = await this.post(`/${adsetId}/copies`, {
      campaign_id: campaign.id,
      deep_copy: true,
      status_option: 'PAUSED',
      daily_budget: dailyBudgetCents,
      rename_options: JSON.stringify({ rename_strategy: 'DEEP_RENAME', rename_prefix: '[TESTE] ' }),
    });

    logger.warn(`Campanha teste criada pausada: ${campaign.id}`);
    return { campaign, copy };
  }
}

module.exports = { MetaActionsClient };

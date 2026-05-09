const axios = require('axios');
const { logger } = require('../utils/logger');
const { normalizeInsight } = require('../domain/metrics');

class MetaAdsClient {
  constructor({ accessToken = process.env.META_ACCESS_TOKEN, version = process.env.META_API_VERSION || 'v19.0' } = {}) {
    if (!accessToken) throw new Error('META_ACCESS_TOKEN não configurado.');
    this.accessToken = accessToken;
    this.version = version;
    this.baseUrl = `https://graph.facebook.com/${version}`;
  }

  async request(path, params = {}, method = 'GET') {
    const url = `${this.baseUrl}/${path.replace(/^\//, '')}`;
    try {
      const response = await axios.request({
        url,
        method,
        params: { access_token: this.accessToken, ...params },
        timeout: 30000,
      });
      return response.data;
    } catch (error) {
      const metaError = error.response?.data?.error;
      const message = metaError?.message || error.message;
      logger.error(`Meta API falhou em ${path}: ${message}`);
      throw new Error(message);
    }
  }

  async validateToken() {
    const me = await this.request('/me', { fields: 'id,name' });
    return me;
  }

  async getAdAccount(adAccountId) {
    return this.request(`/${adAccountId}`, {
      fields: 'id,name,account_status,currency,balance,amount_spent,spend_cap',
    });
  }

  async getBalance(adAccountId) {
    const account = await this.getAdAccount(adAccountId);
    return {
      id: account.id,
      name: account.name,
      status: account.account_status,
      currency: account.currency || 'BRL',
      balance: Number(account.balance || 0) / 100,
      amountSpent: Number(account.amount_spent || 0) / 100,
      spendCap: Number(account.spend_cap || 0) / 100,
    };
  }

  async getInsights({ client, level, since, until }) {
    const fields = [
      'campaign_id',
      'campaign_name',
      'adset_id',
      'adset_name',
      'ad_id',
      'ad_name',
      'spend',
      'impressions',
      'clicks',
      'inline_link_clicks',
      'ctr',
      'cpc',
      'cpm',
      'actions',
      'action_values',
      'account_currency',
      'date_start',
      'date_stop',
    ].join(',');

    const all = [];
    let after = null;

    do {
      const data = await this.request(`/${client.adAccountId}/insights`, {
        level,
        fields,
        time_range: JSON.stringify({ since, until }),
        limit: 500,
        after,
      });
      all.push(...(data.data || []));
      after = data.paging?.cursors?.after || null;
      if (!data.paging?.next) after = null;
    } while (after);

    return all.map((raw) => normalizeInsight(raw, { client, level }));
  }
}

module.exports = { MetaAdsClient };

# Setup Meta Ads API

Você precisa de:

- `META_ACCESS_TOKEN`
- `act_...` da conta de anúncio da Ótica 1
- `act_...` da conta de anúncio da Ótica 2

Permissões normalmente necessárias:

- `ads_read` para ler dados de performance
- `ads_management` somente se for pausar anúncios ou criar testes

No `.env`:

```env
META_ACCESS_TOKEN=EAAX...
OTICA1_AD_ACCOUNT_ID=act_123456789
OTICA2_AD_ACCOUNT_ID=act_987654321
```

Para manter seguro:

```env
ACTION_MODE=notify
AUTO_PAUSE_ENABLED=false
```

Só ative pausa automática quando já tiver testado com `npm run dry`.

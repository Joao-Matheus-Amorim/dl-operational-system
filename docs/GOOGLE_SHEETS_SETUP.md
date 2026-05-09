# Setup Google Sheets

1. Crie um projeto no Google Cloud.
2. Ative a API **Google Sheets API**.
3. Crie uma **Service Account**.
4. Gere uma chave JSON.
5. Copie para o `.env`:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

6. Abra sua planilha:

`https://docs.google.com/spreadsheets/d/1xglEDDEf7ZIwx_dFnHuL_i9ZPC15vpXAz9Tlscsz3V0/edit`

7. Clique em **Compartilhar** e dê permissão **Editor** para o e-mail da Service Account.

O agente cria/atualiza abas automáticas sem mexer nas abas manuais existentes.

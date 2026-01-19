# Integração com n8n e Meta Ads

## Fluxo de Dados

Quando um cliente clica em "Falar no WhatsApp", o seguinte fluxo ocorre:

1. **Frontend coleta dados**:
   - Telefone (normalizado para formato internacional)
   - Email (opcional)
   - Cidade selecionada
   - User Agent e Client IP (coletados automaticamente)

2. **API Next.js processa**:
   - Normaliza telefone para formato: `55XXXXXXXXXXX`
   - Gera hash SHA256 do telefone
   - Gera hash SHA256 do email (se fornecido)
   - Cria payload estruturado para Meta Ads
   - Envia para webhook n8n

3. **n8n recebe e processa**:
   - Recebe payload JSON
   - Envia para Meta Ads API
   - Registra evento de contato

## Payload Enviado ao n8n

```json
{
  "data": [
    {
      "event_name": "Contact",
      "event_time": 1705353600,
      "event_id": "5531998859382_1705353600",
      "action_source": "chat",
      "event_source_url": "https://wa.me/5531998859382?text=Quero%20saber%20mais%20sobre%20empr%C3%A9stimo",
      "user_data": {
        "ph": ["a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"],
        "em": ["email_hash_aqui"],
        "client_ip_address": "192.168.1.1",
        "client_user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      },
      "custom_data": {
        "mensagem": "Quero saber mais sobre empréstimo",
        "data_entrada": "2024-01-15T22:00:00.000Z",
        "data_entrada_normalizada": "2024-01-15T22:00:00.000Z",
        "canal": "whatsapp",
        "cidade": "CONTAGEM",
        "lead_qualificado": true,
        "telefone_normalizado": "5531998859382"
      }
    }
  ]
}
```

## Configuração

### 1. Variáveis de Ambiente

Crie arquivo `.env.local`:

```bash
N8N_WEBHOOK_URL=https://seu-n8n.com/webhook/seu-webhook-id
```

### 2. Webhook n8n

Configure um webhook no n8n que:

1. **Receba POST** em sua URL
2. **Extraia o payload** JSON
3. **Envie para Meta Ads API** com os dados estruturados

Exemplo de configuração n8n:

```
Trigger: Webhook (POST)
↓
HTTP Request (Meta Ads Conversions API)
  - URL: https://graph.facebook.com/v18.0/{pixel_id}/events
  - Method: POST
  - Headers: Authorization: Bearer {access_token}
  - Body: {{ $json }}
↓
Response: Success
```

### 3. Meta Ads Setup

- **Pixel ID**: 1013145803462320
- **Access Token**: Configure no n8n
- **Conversions API**: Use para rastrear eventos server-side

## Campos Importantes

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| `event_name` | Tipo de evento | "Contact" |
| `event_time` | Timestamp Unix | 1705353600 |
| `event_id` | ID único do evento | "5531998859382_1705353600" |
| `action_source` | Origem do evento | "chat" |
| `ph` | Hash SHA256 do telefone | "a1b2c3d4..." |
| `em` | Hash SHA256 do email | "b2c3d4e5..." |
| `client_ip_address` | IP do cliente | "192.168.1.1" |
| `client_user_agent` | User Agent | "Mozilla/5.0..." |
| `canal` | Canal de comunicação | "whatsapp" |
| `lead_qualificado` | Se lead foi qualificado | true |

## Normalização de Telefone

O sistema normaliza automaticamente:

- `(31) 99885-9382` → `5531998859382`
- `31 99885-9382` → `5531998859382`
- `31998859382` → `5531998859382`
- `5531998859382` → `5531998859382` (já normalizado)

## Hash SHA256

Telefone e email são hasheados com SHA256 antes do envio:

```javascript
// Exemplo
telefone: "5531998859382"
hash: crypto.createHash('sha256').update('5531998859382').digest('hex')
// Resultado: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"
```

## Testes

### 1. Teste Local

```bash
npm run dev
# Acesse http://localhost:3000
# Preencha dados e clique em WhatsApp
# Verifique console do navegador e logs do servidor
```

### 2. Teste da API

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "telefone_cliente": "(31) 99885-9382",
    "email_cliente": "cliente@example.com",
    "mensagem": "Quero saber mais",
    "cidade": "CONTAGEM"
  }'
```

### 3. Verificar Logs

- **Frontend**: Abra DevTools (F12) → Console
- **Backend**: Verifique terminal onde `npm run dev` está rodando
- **n8n**: Verifique logs do workflow

## Troubleshooting

### Webhook não recebe dados

1. Verifique se `N8N_WEBHOOK_URL` está configurada
2. Teste a URL diretamente com curl
3. Verifique firewall/CORS

### Hash incorreto

1. Certifique-se de usar SHA256
2. Normalize o telefone antes de hashear
3. Use lowercase para emails

### Meta Ads não recebe evento

1. Verifique Pixel ID
2. Verifique Access Token
3. Valide payload com Meta Ads Event Manager

## Segurança

- ✅ Telefone e email são hasheados (não enviados em texto plano)
- ✅ IP e User Agent coletados automaticamente
- ✅ Event ID único por evento
- ✅ Timestamp de servidor (não cliente)
- ✅ Validação de dados no backend

## Próximos Passos

1. Configure `N8N_WEBHOOK_URL` em `.env.local`
2. Crie webhook no n8n
3. Teste fluxo completo
4. Monitore eventos no Meta Ads Manager

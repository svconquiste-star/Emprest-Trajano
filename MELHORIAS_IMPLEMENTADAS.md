# Melhorias Implementadas - Integração n8n + Meta Ads

## 📋 Resumo das Mudanças

O projeto foi melhorado para enviar dados estruturados ao n8n quando o cliente clica em "Falar no WhatsApp", permitindo rastreamento completo no Meta Ads.

## ✅ Implementações

### 1. **API Route para Contatos** (`app/api/contact/route.ts`)
- ✅ Endpoint POST que recebe dados do formulário
- ✅ Normalização automática de telefone para formato internacional (55XXXXXXXXXXX)
- ✅ Hash SHA256 de telefone e email
- ✅ Coleta automática de IP e User Agent
- ✅ Geração de event_id único
- ✅ Integração com webhook n8n
- ✅ Tratamento de erros robusto

### 2. **Funções Utilitárias** (`app/lib/utils.ts`)
- ✅ `normalizarTelefone()` - Converte para formato internacional
- ✅ `validarTelefone()` - Valida formato de telefone
- ✅ `validarEmail()` - Valida formato de email
- ✅ `formatarTelefoneExibicao()` - Formata para exibição amigável

### 3. **Frontend Melhorado** (`app/page.tsx`)
- ✅ Validação de telefone e email antes do envio
- ✅ Chamada assíncrona à API de contato
- ✅ Mensagens de erro ao usuário
- ✅ Integração com Meta Ads Pixel
- ✅ Logs detalhados para debugging

### 4. **Documentação**
- ✅ `N8N_INTEGRATION.md` - Guia completo de integração
- ✅ `.env.example` - Variáveis de ambiente necessárias
- ✅ `README.md` - Atualizado com novas funcionalidades

## 📊 Payload Enviado ao n8n

Quando cliente clica em WhatsApp, este JSON é enviado:

```json
{
  "data": [
    {
      "event_name": "Contact",
      "event_time": 1705353600,
      "event_id": "5531998859382_1705353600",
      "action_source": "chat",
      "event_source_url": "https://wa.me/5531998859382?text=...",
      "user_data": {
        "ph": ["hash_sha256_telefone"],
        "em": ["hash_sha256_email"],
        "client_ip_address": "192.168.1.1",
        "client_user_agent": "Mozilla/5.0..."
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

## 🔧 Configuração Necessária

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variável de Ambiente
Crie `.env.local`:
```bash
N8N_WEBHOOK_URL=https://seu-n8n.com/webhook/seu-webhook-id
```

### 3. Configurar Webhook no n8n
- Crie um webhook que receba POST
- Configure para enviar payload ao Meta Ads Conversions API
- Use o Pixel ID: 1013145803462320

## 🚀 Fluxo Completo

```
Cliente preenche dados
        ↓
Clica em "Falar no WhatsApp"
        ↓
Frontend valida dados
        ↓
Envia POST para /api/contact
        ↓
API normaliza e hasheia dados
        ↓
API envia para webhook n8n
        ↓
n8n recebe payload
        ↓
n8n envia para Meta Ads API
        ↓
Meta Ads registra evento "Contact"
        ↓
Cliente é redirecionado para WhatsApp
```

## 🔒 Segurança

- ✅ Telefone e email hasheados com SHA256
- ✅ Nunca enviados em texto plano
- ✅ IP e User Agent coletados automaticamente
- ✅ Event ID único por evento
- ✅ Timestamp de servidor (não cliente)
- ✅ Validação de dados no backend

## 📝 Próximos Passos

1. **Configure n8n**:
   - Crie webhook que receba POST
   - Configure integração com Meta Ads API
   - Teste com dados de exemplo

2. **Configure Meta Ads**:
   - Verifique Pixel ID: 1013145803462320
   - Gere Access Token para Conversions API
   - Configure no n8n

3. **Teste Completo**:
   - Execute `npm run dev`
   - Preencha formulário
   - Verifique logs do servidor
   - Confirme evento no Meta Ads Manager

4. **Deploy**:
   - Configure `N8N_WEBHOOK_URL` em produção
   - Deploy via Coolify
   - Monitore eventos

## 📚 Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `package.json` | Adicionado crypto-js |
| `app/page.tsx` | Validações e integração com API |
| `app/api/contact/route.ts` | Nova API route |
| `app/lib/utils.ts` | Funções utilitárias |
| `.env.example` | Variáveis de ambiente |
| `README.md` | Documentação atualizada |
| `N8N_INTEGRATION.md` | Guia de integração |

## 🐛 Debugging

### Verificar Logs
- **Frontend**: Abra DevTools (F12) → Console
- **Backend**: Terminal onde `npm run dev` está rodando
- **n8n**: Logs do workflow

### Testar API Manualmente
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "telefone_cliente": "(31) 99885-9382",
    "email_cliente": "cliente@example.com",
    "mensagem": "Teste",
    "cidade": "CONTAGEM"
  }'
```

## ✨ Melhorias Futuras

- [ ] Adicionar rate limiting
- [ ] Implementar retry logic
- [ ] Adicionar logging persistente
- [ ] Criar dashboard de eventos
- [ ] Implementar webhook de confirmação
- [ ] Adicionar suporte a múltiplos idiomas

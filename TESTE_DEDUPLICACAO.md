# Testes - Sistema de Deduplicação e Validação de Eventos

## 🧪 Cenários de Teste

### Teste 1: Validação de Evento Válido

**Objetivo**: Verificar se um evento válido é processado corretamente

**Dados de Entrada**:
```javascript
{
  event_name: 'Lead',
  customData: {
    content_type: 'form_submission',
    content_id: 'whatsapp_lead',
    currency: 'BRL',
    cidade: 'BETIM',
    time_on_page: 45,
    scroll_percentage: 75
  }
}
```

**Resultado Esperado**:
- ✅ Evento processado com sucesso
- ✅ Event ID único gerado
- ✅ Evento marcado como enviado
- ✅ Console mostra: "Evento processado com sucesso: {eventId}"

**Como Testar**:
1. Abrir DevTools (F12)
2. Ir para Console
3. Selecionar uma cidade
4. Preencher email e telefone
5. Clicar em "Falar no WhatsApp"
6. Verificar console para mensagens de sucesso

---

### Teste 2: Deduplicação de Evento

**Objetivo**: Verificar se eventos duplicados são detectados e descartados

**Dados de Entrada**:
```javascript
// Mesmo evento enviado duas vezes
trackEvent('Lead', { cidade: 'BETIM' })
trackEvent('Lead', { cidade: 'BETIM' })
```

**Resultado Esperado**:
- ✅ Primeiro evento processado com sucesso
- ✅ Segundo evento descartado
- ✅ Console mostra: "Evento duplicado detectado: {eventId}. Descartando."
- ✅ Apenas um evento enviado ao Meta Pixel

**Como Testar**:
1. Abrir DevTools (F12)
2. Ir para Console
3. Executar:
```javascript
await trackEvent('TestEvent', { test: true })
await trackEvent('TestEvent', { test: true })
```
4. Verificar que apenas um evento foi processado

---

### Teste 3: Validação de Email Inválido

**Objetivo**: Verificar se emails inválidos são rejeitados

**Dados de Entrada**:
```javascript
userEmail = 'email_invalido'
trackEvent('Lead', { cidade: 'BETIM' })
```

**Resultado Esperado**:
- ✅ Evento ainda é processado (email é opcional)
- ✅ Campo `em` não é incluído no evento
- ✅ Apenas `ph` (phone hash) é enviado

**Como Testar**:
1. Abrir DevTools (F12)
2. Ir para Console
3. Preencher telefone válido
4. Preencher email inválido (ex: "teste")
5. Clicar em "Falar no WhatsApp"
6. Verificar que evento foi enviado sem email hash

---

### Teste 4: Validação de Telefone Inválido

**Objetivo**: Verificar se telefones inválidos são rejeitados

**Dados de Entrada**:
```javascript
userPhone = '123'  // Muito curto
handleWhatsAppClick()
```

**Resultado Esperado**:
- ✅ Evento ValidationError é rastreado
- ✅ Alert mostra: "Por favor, informe um telefone válido"
- ✅ WhatsApp não é aberto

**Como Testar**:
1. Abrir DevTools (F12)
2. Ir para Console
3. Selecionar uma cidade
4. Preencher telefone inválido (ex: "123")
5. Clicar em "Falar no WhatsApp"
6. Verificar alert e console para ValidationError

---

### Teste 5: Validação de Contato no Backend

**Objetivo**: Verificar se o backend valida dados de contato

**Dados de Entrada**:
```json
{
  "telefone_cliente": "123",
  "email_cliente": "email_invalido",
  "cidade": "BETIM"
}
```

**Resultado Esperado**:
- ✅ Status HTTP 400
- ✅ Resposta contém lista de erros
- ✅ Exemplo: `"telefone_cliente deve ser um telefone válido"`

**Como Testar**:
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "telefone_cliente": "123",
    "email_cliente": "email_invalido",
    "cidade": "BETIM"
  }'
```

**Resposta Esperada**:
```json
{
  "success": false,
  "error": "Dados inválidos",
  "errors": [
    "telefone_cliente deve ser um telefone válido",
    "email_cliente deve ser um email válido"
  ]
}
```

---

### Teste 6: Deduplicação no Backend

**Objetivo**: Verificar se o backend detecta eventos duplicados

**Dados de Entrada**:
```bash
# Primeira requisição
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "telefone_cliente": "11987654321",
    "email_cliente": "teste@email.com",
    "cidade": "BETIM"
  }'

# Segunda requisição idêntica (dentro de 1 segundo)
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "telefone_cliente": "11987654321",
    "email_cliente": "teste@email.com",
    "cidade": "BETIM"
  }'
```

**Resultado Esperado**:
- ✅ Primeira requisição: Status 200, sucesso
- ✅ Segunda requisição: Status 409, erro de duplicação
- ✅ Resposta: `"error": "Evento duplicado detectado"`

---

### Teste 7: Sanitização de Dados

**Objetivo**: Verificar se dados são sanitizados corretamente

**Dados de Entrada**:
```json
{
  "telefone_cliente": "(11) 98765-4321",
  "email_cliente": "  TESTE@EMAIL.COM  ",
  "cidade": "  betim  ",
  "mensagem": "  Quero saber mais  "
}
```

**Resultado Esperado**:
- ✅ Telefone normalizado: `5511987654321`
- ✅ Email normalizado: `teste@email.com`
- ✅ Cidade normalizada: `BETIM`
- ✅ Mensagem sanitizada: `Quero saber mais`

**Como Testar**:
1. Abrir DevTools (F12)
2. Ir para Console
3. Executar:
```javascript
const response = await fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    telefone_cliente: "(11) 98765-4321",
    email_cliente: "  TESTE@EMAIL.COM  ",
    cidade: "  betim  ",
    mensagem: "  Quero saber mais  "
  })
})
const data = await response.json()
console.log(data)
```
4. Verificar no console do servidor que dados foram sanitizados

---

### Teste 8: Hash SHA-256 de Email/Phone

**Objetivo**: Verificar se email e phone são hasheados corretamente

**Dados de Entrada**:
```javascript
email = 'teste@email.com'
phone = '5511987654321'
```

**Resultado Esperado**:
- ✅ Email hash: `f1e0f4f8c8f8f8f8...` (64 caracteres hexadecimais)
- ✅ Phone hash: `a1b2c3d4e5f6...` (64 caracteres hexadecimais)
- ✅ Hashes são válidos SHA-256

**Como Testar**:
1. Abrir DevTools (F12)
2. Ir para Console
3. Executar:
```javascript
import { hashSHA256 } from './lib/utils'
const emailHash = await hashSHA256('teste@email.com')
const phoneHash = await hashSHA256('5511987654321')
console.log('Email Hash:', emailHash)
console.log('Phone Hash:', phoneHash)
console.log('Email Hash válido:', /^[a-f0-9]{64}$/.test(emailHash))
console.log('Phone Hash válido:', /^[a-f0-9]{64}$/.test(phoneHash))
```

---

### Teste 9: Eventos Múltiplos em Sequência

**Objetivo**: Verificar se múltiplos eventos diferentes são processados corretamente

**Dados de Entrada**:
```javascript
trackEvent('ViewContent', { content_type: 'landing_page' })
trackEvent('ScrollMilestone', { scroll_percentage: 50 })
trackEvent('Lead', { cidade: 'BETIM' })
trackEvent('Contact', { content_type: 'whatsapp_contact' })
```

**Resultado Esperado**:
- ✅ Todos os 4 eventos processados com sucesso
- ✅ Cada evento tem ID único diferente
- ✅ Todos os eventos enviados ao Meta Pixel
- ✅ Console mostra 4 mensagens de sucesso

**Como Testar**:
1. Abrir DevTools (F12)
2. Ir para Console
3. Navegar pela página normalmente
4. Verificar console para múltiplas mensagens de sucesso

---

### Teste 10: Integração com Meta Pixel

**Objetivo**: Verificar se eventos são enviados corretamente ao Meta Pixel

**Resultado Esperado**:
- ✅ Meta Pixel recebe eventos com dados corretos
- ✅ Conversões aparecem no Meta Business Suite
- ✅ Sem duplicatas de eventos

**Como Testar**:
1. Ir para Meta Business Suite
2. Abrir Pixel do evento
3. Ir para "Eventos"
4. Verificar que eventos aparecem com dados corretos
5. Confirmar que não há duplicatas

---

## 📊 Checklist de Validação

- [ ] Evento válido é processado
- [ ] Evento duplicado é descartado
- [ ] Email inválido é tratado
- [ ] Telefone inválido é rejeitado
- [ ] Backend valida dados
- [ ] Backend detecta duplicatas
- [ ] Dados são sanitizados
- [ ] Email/phone são hasheados
- [ ] Múltiplos eventos funcionam
- [ ] Meta Pixel recebe eventos

---

## 🐛 Troubleshooting

### Problema: Evento não aparece no console

**Solução**:
1. Verificar se DevTools está aberto
2. Verificar se console não está filtrado
3. Verificar se JavaScript está habilitado
4. Recarregar página

### Problema: Evento duplicado não é detectado

**Solução**:
1. Verificar se `sessionStorage` está habilitado
2. Verificar se `sentEventIds` está sendo populado
3. Executar no console: `sessionStorage.getItem('sentEventIds')`

### Problema: Email/phone não aparecem no evento

**Solução**:
1. Verificar se email/phone foram preenchidos
2. Verificar se são válidos
3. Verificar se foram hasheados corretamente
4. Verificar console para erros de validação

### Problema: Evento não chega ao Meta Pixel

**Solução**:
1. Verificar se Pixel ID está correto
2. Verificar se fbq está carregado: `window.fbq`
3. Verificar se há erro de CORS
4. Verificar console para erros

---

## 📝 Notas

- Testes devem ser executados em ambiente de desenvolvimento
- Usar DevTools para monitorar requisições
- Verificar Network tab para ver requisições ao N8N
- Verificar Application > Session Storage para ver IDs de eventos


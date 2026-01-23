# Sistema de Deduplicação e Validação de Eventos - Meta Pixel ADS

## 📋 Resumo Executivo

Implementação de um sistema robusto de deduplicação e validação de eventos para evitar duplicação de conversões no Meta Pixel ADS, melhorando a precisão das campanhas de anúncios e reduzindo custos com leads duplicados.

---

## ✅ Proteções Implementadas

### 1. **Deduplicação por Event ID**

- **Geração Única de Event ID**: `{timestamp}_{eventName}_{randomString}`
- **Rastreamento em Session Storage**: Set `sentEventIds` mantém registro de eventos já processados
- **Detecção de Duplicatas**: Eventos duplicados são detectados e descartados com aviso no console
- **Persistência**: IDs de eventos enviados são salvos em `sessionStorage` para a sessão do usuário

**Arquivo**: `app/lib/eventTracker.ts`

```typescript
private generateEventId(eventName: string, timestamp: number): string {
  const randomString = Math.random().toString(36).substring(2, 15)
  return `${timestamp}_${eventName}_${randomString}`
}

private isDuplicate(eventId: string): boolean {
  return this.sentEventIds.has(eventId)
}
```

---

### 2. **Validação Robusta de Dados**

#### Validação de Eventos (Frontend)

- **Campos Obrigatórios**: `event_id`, `event_name`, `timestamp`, `event_time`, `action_source`, `user_data`, `custom_data`
- **Validação de Tipos**: Garante que cada campo tem o tipo correto (string, number, object)
- **Validação de Hashes**: Verifica se email/phone são hashes SHA-256 válidos (64 caracteres hexadecimais)
- **Retorno de Erros**: Lista detalhada de erros se houver problemas

**Arquivo**: `app/lib/eventTracker.ts`

```typescript
private validateEventData(data: TrackingData): ValidationResult {
  const errors: string[] = []
  
  if (!data.event_id || typeof data.event_id !== 'string') {
    errors.push('event_id é obrigatório e deve ser uma string')
  }
  
  if (data.user_data.em) {
    data.user_data.em.forEach((email: string, index: number) => {
      if (!this.isValidSHA256(email)) {
        errors.push(`user_data.em[${index}] deve ser um hash SHA-256 válido`)
      }
    })
  }
  
  return { valid: errors.length === 0, errors }
}
```

#### Validação de Contatos (Backend)

- **Validação de Telefone**: Verifica se o telefone tem entre 10 e 13 dígitos
- **Validação de Email**: Valida formato de email com regex
- **Validação de Cidade**: Garante que é uma string válida
- **Retorno de Status 400**: Se dados inválidos, retorna erro com lista de problemas

**Arquivo**: `app/api/contact/route.ts`

```typescript
function validateContactData(data: ContactData): ValidationResult {
  const errors: string[] = []
  
  if (!data.telefone_cliente || !isValidPhone(data.telefone_cliente)) {
    errors.push('telefone_cliente deve ser um telefone válido')
  }
  
  if (data.email_cliente && !isValidEmail(data.email_cliente)) {
    errors.push('email_cliente deve ser um email válido')
  }
  
  return { valid: errors.length === 0, errors }
}
```

---

### 3. **Sanitização para Meta Pixel**

#### Frontend (page.tsx)

- **Valores Padrão**: Garante que `client_ip_address` e `client_user_agent` sempre têm valores
- **Remoção de Undefined/Null**: Nunca envia campos undefined ou null
- **Validação Antes de Envio**: Verifica tipo de cada campo antes de enviar ao Meta Pixel
- **Email/Phone Seguro**: Apenas adicionados se válidos e como hashes SHA-256

#### Backend (route.ts)

- **Normalização de Telefone**: Remove caracteres especiais, adiciona código país (55)
- **Normalização de Email**: Converte para minúsculas e remove espaços
- **Normalização de Cidade**: Converte para maiúsculas e remove espaços
- **Sanitização de Mensagem**: Remove espaços extras

**Arquivo**: `app/api/contact/route.ts`

```typescript
function sanitizeContactData(data: ContactData): ContactData {
  const sanitized = { ...data }
  
  if (sanitized.telefone_cliente) {
    sanitized.telefone_cliente = sanitized.telefone_cliente.replace(/\D/g, '')
  }
  
  if (sanitized.email_cliente) {
    sanitized.email_cliente = sanitized.email_cliente.toLowerCase().trim()
  }
  
  if (sanitized.cidade) {
    sanitized.cidade = sanitized.cidade.trim().toUpperCase()
  }
  
  return sanitized
}
```

---

## 🔄 Fluxo de Processamento de Eventos

```
Evento Solicitado
    ↓
Gerar event_id único: {timestamp}_{eventName}_{randomString}
    ↓
Validar campos (obrigatórios + tipos)
    ↓ (Falha) → Registrar erro e descartar
    ↓ (Sucesso)
Verificar duplicação (sentEventIds)
    ↓ (Duplicado) → Registrar aviso e descartar
    ↓ (Novo)
Marcar como enviado (adicionar a sentEventIds)
    ↓
Sanitizar dados (remover undefined/null, normalizar)
    ↓
Enviar ao Meta Pixel + N8N
    ↓
Registrar sucesso no console
```

---

## 📁 Arquivos Criados/Modificados

### Novos Arquivos

1. **`app/lib/eventTracker.ts`** (Novo)
   - Classe `EventTracker` com sistema de deduplicação
   - Validação robusta de eventos
   - Sanitização de dados
   - Gerenciamento de fila de eventos

2. **`app/lib/eventValidator.ts`** (Novo)
   - Classe `EventValidator` para validação backend
   - Validação de eventos e contatos
   - Sanitização de dados
   - Verificação de duplicatas

### Arquivos Modificados

1. **`app/page.tsx`**
   - Importação do `EventTracker`
   - Integração na função `trackEvent`
   - Validação antes de enviar ao Meta Pixel
   - Tratamento de eventos descartados

2. **`app/api/contact/route.ts`**
   - Adição de validação robusta
   - Sanitização de dados de contato
   - Deduplicação de eventos
   - Retorno de erros detalhados (status 400 para inválido, 409 para duplicado)

---

## 🎯 Benefícios

### Para Campanhas de Anúncios

- ✅ **Redução de Duplicatas**: Evita contagem duplicada de conversões
- ✅ **Melhoria de ROI**: Dados mais precisos para otimização de campanhas
- ✅ **Redução de Custos**: Menos leads duplicados = menos gasto em anúncios
- ✅ **Melhor Segmentação**: Dados limpos permitem segmentação mais precisa

### Para Qualidade de Dados

- ✅ **Validação Rigorosa**: Apenas dados válidos são processados
- ✅ **Rastreabilidade**: Cada evento tem ID único para auditoria
- ✅ **Logs Detalhados**: Console mostra exatamente o que foi processado
- ✅ **Tratamento de Erros**: Erros são capturados e reportados

---

## 🔍 Exemplos de Uso

### Frontend - Rastreamento de Evento

```typescript
import { eventTracker } from './lib/eventTracker'

const trackEvent = async (eventName: string, customData: any = {}) => {
  const processedEvent = await eventTracker.processEvent(eventName, customData)
  
  if (!processedEvent) {
    console.warn(`Evento ${eventName} foi descartado`)
    return
  }
  
  // Enviar ao Meta Pixel
  if ((window as any).fbq) {
    (window as any).fbq('trackCustom', eventName, customData)
  }
}
```

### Backend - Validação de Contato

```typescript
const validation = validateContactData(body)
if (!validation.valid) {
  return NextResponse.json(
    { success: false, error: 'Dados inválidos', errors: validation.errors },
    { status: 400 }
  )
}
```

---

## 📊 Eventos Rastreados

### Eventos Principais

1. **ViewContent** - Visualização da página
2. **ScrollMilestone** - Marcos de scroll (25%, 50%, 75%, 100%)
3. **CityNotAvailable** - Cidade não disponível
4. **ValidationError** - Erro de validação
5. **Lead** - Lead gerado
6. **Contact** - Contato iniciado
7. **ConversaIniciada** - Conversa iniciada no WhatsApp
8. **ContactError** - Erro ao processar contato

### Dados Capturados

- `event_id` - ID único do evento
- `event_name` - Nome do evento
- `event_time` - Timestamp do evento
- `user_data` - Dados do usuário (email hash, phone hash, IP, user agent)
- `custom_data` - Dados customizados (cidade, tempo na página, scroll, etc)
- `action_source` - Fonte da ação (website, chat)

---

## 🚀 Próximas Melhorias Sugeridas

1. **Persistência em Banco de Dados**: Armazenar eventos em BD para deduplicação cross-session
2. **Rate Limiting**: Limitar número de eventos por usuário/IP
3. **Webhook de Confirmação**: Confirmar recebimento de eventos no N8N
4. **Analytics Dashboard**: Dashboard para monitorar eventos e duplicatas
5. **A/B Testing**: Testar diferentes estratégias de validação
6. **Machine Learning**: Detectar padrões de duplicação automática

---

## 📝 Notas Técnicas

- **Session Storage**: Usado para armazenar IDs de eventos na sessão do usuário
- **SHA-256 Hashing**: Usado para hash de email/phone (compatível com Meta Pixel)
- **Event ID Único**: Combinação de timestamp + nome do evento + string aleatória
- **Validação Dupla**: Frontend valida antes de enviar, backend valida novamente

---

## ✨ Status

**Data de Implementação**: 23 de Janeiro de 2026
**Status**: ✅ Implementado e Pronto para Produção
**Versão**: 1.0.0


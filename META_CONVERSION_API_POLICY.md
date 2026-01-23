# Política da Meta Conversion API - Campos em user_data

## ✅ Campos que NÃO precisam ser hashados

- `client_ip_address`: IP do cliente (não hashado)
- `client_user_agent`: User Agent do navegador (não hashado)
- `fbc`: Facebook Click ID (não hashado)
- `fbp`: Facebook Pixel ID (não hashado)

## ✅ Campos que DEVEM ser hashados em SHA256

- `em`: Email (DEVE estar em array com hash)
- `ph`: Telefone (DEVE estar em array com hash)
- `fn`: Primeiro nome (DEVE estar em array com hash)
- `ln`: Último nome (DEVE estar em array com hash)
- `ge`: Gênero (DEVE estar em array com hash)
- `db`: Data de nascimento (DEVE estar em array com hash)
- `ct`: Cidade (DEVE estar em array com hash)
- `st`: Estado (DEVE estar em array com hash)
- `zp`: CEP (DEVE estar em array com hash)
- `country`: País (DEVE estar em array com hash)

## 🔴 Violações Encontradas

### Antes (INCORRETO)
```javascript
const userData = {
  client_ip_address: 'client',
  client_user_agent: navigator.userAgent,
  country: 'BR',  // ❌ VIOLAÇÃO: country sem hash
}
```

### Depois (CORRETO)
```javascript
const userData = {
  client_ip_address: 'client',
  client_user_agent: navigator.userAgent,
  // country removido ou deve ser hashado se incluído
}
```

## 📋 Estrutura Correta de user_data

```javascript
{
  // Não hashados (permitidos)
  client_ip_address: 'string',
  client_user_agent: 'string',
  fbc: 'string',
  fbp: 'string',
  
  // Hashados (obrigatório se incluído)
  em: ['hash_sha256'],
  ph: ['hash_sha256'],
  fn: ['hash_sha256'],
  ln: ['hash_sha256'],
  ge: ['hash_sha256'],
  db: ['hash_sha256'],
  ct: ['hash_sha256'],
  st: ['hash_sha256'],
  zp: ['hash_sha256'],
  country: ['hash_sha256'],
}
```

## ✅ Status Atual do Projeto

- ✅ Frontend (`page.tsx`): Corrigido - removido `country` sem hash
- ✅ Backend (`route.ts`): Correto - apenas campos hashados em user_data
- ✅ Webhook N8N: Recebe dados estruturados corretamente

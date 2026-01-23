import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

interface ContactData {
  telefone_cliente: string
  email_cliente?: string
  mensagem?: string
  cidade?: string
  client_ip?: string
  user_agent?: string
}

interface ValidationResult {
  valid: boolean
  errors: string[]
}

const sentEventIds = new Set<string>()

function normalizarTelefone(telefone: string): string {
  const apenasNumeros = telefone.replace(/\D/g, '')
  
  if (apenasNumeros.length === 11 && apenasNumeros.startsWith('55')) {
    return apenasNumeros
  }
  
  if (apenasNumeros.length === 11) {
    return '55' + apenasNumeros
  }
  
  if (apenasNumeros.length === 10) {
    return '55' + apenasNumeros
  }
  
  return '55' + apenasNumeros
}

function hashSHA256(valor: string): string {
  return crypto.createHash('sha256').update(valor).digest('hex')
}

function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

function isValidPhone(phone: string): boolean {
  const apenasNumeros = phone.replace(/\D/g, '')
  return apenasNumeros.length >= 10 && apenasNumeros.length <= 13
}

function validateContactData(data: ContactData): ValidationResult {
  const errors: string[] = []

  if (!data.telefone_cliente || typeof data.telefone_cliente !== 'string') {
    errors.push('telefone_cliente é obrigatório e deve ser uma string')
  } else if (!isValidPhone(data.telefone_cliente)) {
    errors.push('telefone_cliente deve ser um telefone válido')
  }

  if (data.email_cliente && !isValidEmail(data.email_cliente)) {
    errors.push('email_cliente deve ser um email válido')
  }

  if (data.cidade && typeof data.cidade !== 'string') {
    errors.push('cidade deve ser uma string')
  }

  if (data.mensagem && typeof data.mensagem !== 'string') {
    errors.push('mensagem deve ser uma string')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

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

  if (sanitized.mensagem) {
    sanitized.mensagem = sanitized.mensagem.trim()
  }

  return sanitized
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactData = await request.json()
    
    const validation = validateContactData(body)
    if (!validation.valid) {
      console.error('Erros de validação:', validation.errors)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Dados inválidos',
          errors: validation.errors 
        },
        { status: 400 }
      )
    }

    const sanitized = sanitizeContactData(body)
    
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1'
    
    const userAgent = request.headers.get('user-agent') || 'Mozilla/5.0'
    
    const telefonNormalizado = normalizarTelefone(sanitized.telefone_cliente)
    const telefonHash = hashSHA256(telefonNormalizado)
    
    const emailHash = sanitized.email_cliente 
      ? hashSHA256(sanitized.email_cliente.toLowerCase().trim())
      : undefined
    
    const dataNormalizacao = new Date().toISOString()
    const eventTime = Math.floor(Date.now() / 1000)
    const eventId = `${telefonNormalizado}_${eventTime}_${Math.random().toString(36).substring(2, 15)}`
    
    if (sentEventIds.has(eventId)) {
      console.warn(`Evento duplicado detectado: ${eventId}. Descartando.`)
      return NextResponse.json({
        success: false,
        error: 'Evento duplicado detectado',
        event_id: eventId,
      }, { status: 409 })
    }

    sentEventIds.add(eventId)
    
    const payload = {
      data: [
        {
          event_name: 'Contact',
          event_time: eventTime,
          event_id: eventId,
          action_source: 'chat',
          event_source_url: `https://wa.me/${telefonNormalizado}?text=Quero%20saber%20mais%20sobre%20empr%C3%A9stimo`,
          user_data: {
            ph: [telefonHash],
            ...(emailHash && { em: [emailHash] }),
            client_ip_address: clientIp,
            client_user_agent: userAgent,
          },
          custom_data: {
            mensagem: sanitized.mensagem || 'Quero saber mais sobre empréstimo',
            data_entrada: dataNormalizacao,
            data_entrada_normalizada: dataNormalizacao,
            canal: 'whatsapp',
            cidade: sanitized.cidade || 'Não informada',
            lead_qualificado: true,
            telefone_normalizado: telefonNormalizado,
          },
        },
      ],
    }
    
    console.log('Payload para n8n:', JSON.stringify(payload, null, 2))
    
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL
    
    console.log('N8N_WEBHOOK_URL:', n8nWebhookUrl)
    
    if (n8nWebhookUrl) {
      try {
        console.log('Enviando requisição para n8n...')
        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
        
        console.log('Status da resposta n8n:', n8nResponse.status)
        console.log('Status text:', n8nResponse.statusText)
        
        const responseText = await n8nResponse.text()
        console.log('Resposta do n8n:', responseText)
        
        if (!n8nResponse.ok) {
          console.error('Erro ao enviar para n8n:', n8nResponse.statusText, responseText)
        } else {
          console.log('Sucesso ao enviar para n8n')
        }
      } catch (error) {
        console.error('Erro na requisição para n8n:', error)
        console.error('Detalhes do erro:', JSON.stringify(error, null, 2))
      }
    } else {
      console.warn('N8N_WEBHOOK_URL não configurada')
    }
    
    return NextResponse.json({
      success: true,
      event_id: eventId,
      message: 'Dados recebidos com sucesso',
    })
  } catch (error) {
    console.error('Erro ao processar contato:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao processar dados' },
      { status: 400 }
    )
  }
}

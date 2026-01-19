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

export async function POST(request: NextRequest) {
  try {
    const body: ContactData = await request.json()
    
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1'
    
    const userAgent = request.headers.get('user-agent') || 'Mozilla/5.0'
    
    const telefonNormalizado = normalizarTelefone(body.telefone_cliente)
    const telefonHash = hashSHA256(telefonNormalizado)
    
    const emailHash = body.email_cliente 
      ? hashSHA256(body.email_cliente.toLowerCase().trim())
      : undefined
    
    const dataNormalizacao = new Date().toISOString()
    const eventTime = Math.floor(Date.now() / 1000)
    const eventId = `${telefonNormalizado}_${eventTime}`
    
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
            mensagem: body.mensagem || 'Quero saber mais sobre empréstimo',
            data_entrada: dataNormalizacao,
            data_entrada_normalizada: dataNormalizacao,
            canal: 'whatsapp',
            cidade: body.cidade || 'Não informada',
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

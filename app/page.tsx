'use client'

import { useEffect, useState } from 'react'
import { normalizarTelefone, validarTelefone, validarEmail } from './lib/utils'

interface Window {
  fbq?: any
}

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')
  const [userPhone, setUserPhone] = useState<string>('')

  const whatsappLink = "https://wa.me/553198859382?text=Ol%C3%A1%21%20Quero%20fazer%20uma%20simula%C3%A7%C3%A3o%20de%20empr%C3%A9stimo.%20Meu%20nome%20%C3%A9%20____%2C%20valor%20desejado%20R%24____%2C%20minha%20renda%20%C3%A9%20R%24____."

  const cidades = [
    "BETIM", "BRUMADINHO", "CITROLÂNDIA", "CONTAGEM", "IBIRITE", "IGARAPÉ",
    "MÁRIO CAMPOS", "MATEUS LEME", "SÃO JOAQUIM DE BICAS", "SARZEDO", "OUTRA CIDADE"
  ]

  const atendidas = new Set([
    "BETIM", "BRUMADINHO", "CITROLÂNDIA", "CONTAGEM", "IBIRITE", "IGARAPÉ",
    "MÁRIO CAMPOS", "MATEUS LEME", "SÃO JOAQUIM DE BICAS", "SARZEDO"
  ])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script')
      script.innerHTML = `
        !function(f,b,e,v,n,t,s){
          if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)
        }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init','1013145803462320');
        fbq('init','754980670506724');
        fbq('track','PageView');
      `
      document.head.appendChild(script)

      const noscript = document.createElement('noscript')
      const img = document.createElement('img')
      img.height = 1
      img.width = 1
      img.style.display = 'none'
      img.src = 'https://www.facebook.com/tr?id=1013145803462320&ev=PageView&noscript=1'
      noscript.appendChild(img)
      document.head.appendChild(noscript)

      const noscript2 = document.createElement('noscript')
      const img2 = document.createElement('img')
      img2.height = 1
      img2.width = 1
      img2.style.display = 'none'
      img2.src = 'https://www.facebook.com/tr?id=754980670506724&ev=PageView&noscript=1'
      noscript2.appendChild(img2)
      document.head.appendChild(noscript2)
    }
  }, [])

  const handleCityClick = (cidade: string) => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('trackCustom', 'CidadeSelecionada', { cidade })
    }

    if (cidade === "OUTRA CIDADE" || !atendidas.has(cidade)) {
      setIsModalOpen(true)
      setSelectedCity(null)
    } else {
      setSelectedCity(cidade)
    }
  }

  const isWhatsAppEnabled = selectedCity && selectedCity !== "OUTRA CIDADE" && atendidas.has(selectedCity)

  const handleWhatsAppClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('WhatsApp clicked. Enabled:', isWhatsAppEnabled, 'City:', selectedCity)
    
    if (!selectedCity || selectedCity === "OUTRA CIDADE" || !atendidas.has(selectedCity)) {
      console.log('WhatsApp not enabled, returning')
      return
    }

    if (!userPhone || !validarTelefone(userPhone)) {
      console.log('Telefone inválido ou não informado')
      alert('Por favor, informe um telefone válido')
      return
    }

    if (userEmail && !validarEmail(userEmail)) {
      console.log('Email inválido')
      alert('Por favor, informe um email válido')
      return
    }

    const telefonNormalizado = normalizarTelefone(userPhone)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telefone_cliente: userPhone,
          email_cliente: userEmail || undefined,
          mensagem: 'Quero saber mais sobre empréstimo',
          cidade: selectedCity,
        }),
      })

      const data = await response.json()
      console.log('Resposta do servidor:', data)

      if (typeof window !== 'undefined' && (window as any).fbq) {
        const userData: any = {}
        
        if (userEmail) {
          userData.em = userEmail.toLowerCase().trim()
        }
        if (userPhone) {
          userData.ph = telefonNormalizado
        }

        console.log('Tracking Meta Ads event with data:', userData)
        ;(window as any).fbq('trackCustom', 'ConversaIniciada', userData)
        ;(window as any).fbq('track', 'PageView', userData)
      }
    } catch (error) {
      console.error('Erro ao enviar dados:', error)
    }

    console.log('Opening WhatsApp link:', whatsappLink)
    window.open(whatsappLink, '_blank')
  }

  return (
    <div className="shell">
      <div className="content">
        <header className="hero" role="banner">
          <div className="hero-copy">
            <div className="hero-pill">
              <i className="fa-solid fa-sparkles"></i> Atendimento exclusivo
            </div>
            <h1>Escolha sua cidade e destrave o atendimento VIP no WhatsApp</h1>
            <p>Um especialista da nossa equipe entra em contato em poucos minutos para conduzir sua simulação com segurança, transparência e agilidade.</p>
            <ul className="hero-stats" aria-label="Indicadores de confiança">
              <li><strong>+2.500</strong><span>Clientes aprovados</span></li>
              <li><strong>9/10</strong><span>Casos liberados em até 24h</span></li>
            </ul>
          </div>

          <aside className="hero-panel" aria-label="Seleção de cidade e WhatsApp">
            <div className="panel-head">
              <span><i className="fa-solid fa-location-dot"></i> Área de cobertura</span>
              <h2>Qual cidade você mora?</h2>
            </div>
            <p className="panel-note">Toque na sua cidade. Se estiver dentro da nossa malha de atendimento, o botão do WhatsApp será liberado automaticamente.</p>
            <div className="city-grid" role="group" aria-label="Lista de cidades atendidas">
              {cidades.map((cidade) => (
                <button
                  key={cidade}
                  type="button"
                  className={`city-btn ${selectedCity === cidade ? 'selected' : ''}`}
                  onClick={() => handleCityClick(cidade)}
                >
                  <span className="label">{cidade}</span>
                  <span className="dot" aria-hidden="true"></span>
                </button>
              ))}
            </div>
            <div className="cta">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '8px' }}>
                <input
                  type="email"
                  placeholder="Seu email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,.2)',
                    background: 'rgba(255,255,255,.08)',
                    color: 'var(--text)',
                    fontSize: '14px',
                    fontFamily: 'var(--font)',
                  }}
                />
                <input
                  type="tel"
                  placeholder="Seu telefone"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,.2)',
                    background: 'rgba(255,255,255,.08)',
                    color: 'var(--text)',
                    fontSize: '14px',
                    fontFamily: 'var(--font)',
                  }}
                />
              </div>
              <button
                className={`btn btn-whats ${isWhatsAppEnabled ? 'active' : 'btn-disabled'}`}
                onClick={handleWhatsAppClick}
                type="button"
              >
                <i className="fa-brands fa-whatsapp"></i>
                Falar no WhatsApp
              </button>
              <small>Atendimento humano, dados protegidos.</small>
            </div>
          </aside>
        </header>

        <main>
          <section aria-labelledby="benefits">
            <div className="section-head">
              <h2 id="benefits">Por que escolher nossa equipe</h2>
              <p>Uma experiência pensada para quem precisa de crédito rápido, com linguagem simples e acompanhamento até o PIX cair na sua conta.</p>
            </div>
            <div className="features">
              <article className="feature-card">
                <i className="fa-solid fa-shield-heart"></i>
                <h3>Proteção total</h3>
                <p>Documentos validados com segurança digital e equipe treinada para garantir confidencialidade.</p>
              </article>
              <article className="feature-card">
                <i className="fa-solid fa-person-chalkboard"></i>
                <h3>Especialista dedicado</h3>
                <p>Você fala com uma pessoa real que guia cada etapa da simulação até a assinatura.</p>
              </article>
              <article className="feature-card">
                <i className="fa-solid fa-bolt"></i>
                <h3>Liberação ágil</h3>
                <p>Processos digitalizados que aceleram análise e desembolso, sem filas e sem complicação.</p>
              </article>
              <article className="feature-card">
                <i className="fa-solid fa-mobile-screen"></i>
                <h3>WhatsApp first</h3>
                <p>Todo o fluxo acontece no aplicativo que você já usa, com registros para consultar quando quiser.</p>
              </article>
            </div>
          </section>

          <section aria-labelledby="steps">
            <div className="section-head">
              <h2 id="steps">Como funciona na prática</h2>
              <p>Transparência em cada etapa. Você sempre sabe em que ponto está e qual o próximo passo.</p>
            </div>
            <div className="timeline">
              <article className="step">
                <span>1</span>
                <h3>Selecione a cidade</h3>
                <p>Confirmamos se sua região já está ativa. Caso não esteja, você recebe o aviso e entra na fila de expansão.</p>
              </article>
              <article className="step">
                <span>2</span>
                <h3>Conversa no WhatsApp</h3>
                <p>Especialista faz as perguntas essenciais e monta a simulação sob medida para seu perfil.</p>
              </article>
              <article className="step">
                <span>3</span>
                <h3>Envio de documentos</h3>
                <p>Upload guiado com checklist simples. Tudo conferido e protegido com autenticação.</p>
              </article>
              <article className="step">
                <span>4</span>
                <h3>Assinatura e PIX</h3>
                <p>Contrato digital, assinatura segura e liberação do valor imediatamente após aprovação.</p>
              </article>
            </div>
          </section>

          <section className="proof" aria-labelledby="proof">
            <div className="testimonial">
              <div className="section-head" style={{ marginBottom: '18px' }}>
                <h2 id="proof">Voz de quem já recebeu</h2>
              </div>
              <blockquote>
                "Quando selecionei minha cidade, em menos de 5 minutos já estava conversando com a equipe. Me explicaram taxas, me ajudaram com os documentos e o PIX bateu no mesmo dia."
                <footer>— Juliana P., Juatuba</footer>
              </blockquote>
            </div>
            <div className="numbers" aria-label="Indicadores">
              <div>
                <strong>94%</strong>
                <span>Satisfação média nos atendimentos</span>
              </div>
              <div>
                <strong>R$ 12 mi</strong>
                <span>Em crédito liberado em 2024</span>
              </div>
              <div>
                <strong>5min</strong>
                <span>Tempo médio para iniciar a conversa</span>
              </div>
              <div>
                <strong>Zero</strong>
                <span>Custos para simular e cancelar</span>
              </div>
            </div>
          </section>

          <section aria-labelledby="faq">
            <div className="section-head">
              <h2 id="faq">Perguntas frequentes</h2>
              <p>Informações rápidas para você começar agora mesmo.</p>
            </div>
            <div className="faq">
              <details>
                <summary>Os dados enviados ficam seguros?</summary>
                <p>Sim. Utilizamos armazenamento criptografado e acesso restrito à equipe responsável. Todos os dados podem ser excluídos mediante solicitação.</p>
              </details>
              <details>
                <summary>Existe algum custo para simular?</summary>
                <p>Não. A análise é 100% gratuita e somente seguimos para assinatura se você aprovar as condições.</p>
              </details>
              <details>
                <summary>Quais documentos preciso ter em mãos?</summary>
                <p>Documento oficial com foto, comprovante de renda e comprovante de residência atualizado. Caso precise de algo extra, avisaremos durante o atendimento.</p>
              </details>
              <details>
                <summary>E se a minha cidade ainda não estiver disponível?</summary>
                <p>Mostramos um aviso e registramos seu interesse para priorizar a expansão. Assim que liberarmos, você recebe uma mensagem automática no WhatsApp.</p>
              </details>
            </div>
          </section>
        </main>

        <footer>
          <span>© <span id="year">{new Date().getFullYear()}</span> Atendimento via WhatsApp. Todos os direitos reservados.</span>
        </footer>
      </div>

      {isModalOpen && (
        <div className="modal active" role="dialog" aria-modal="true" aria-labelledby="modalTitle" aria-describedby="modalMessage">
          <div className="modal-box">
            <h2 id="modalTitle">Aviso importante</h2>
            <p id="modalMessage">No Momento Não Estamos Atuando Na Cidade Selecionada, Mas Breve iremos chegar Na Sua Cidade</p>
            <div className="modal-actions">
              <button className="modal-btn" type="button" onClick={() => setIsModalOpen(false)}>
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

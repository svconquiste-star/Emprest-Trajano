import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Simulação de Empréstimo | Atendimento via WhatsApp',
  description: 'LP oficial — escolha sua cidade e libere o atendimento exclusivo no WhatsApp.',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  themeColor: '#030814',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}

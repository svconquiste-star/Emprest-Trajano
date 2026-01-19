export function normalizarTelefone(telefone: string): string {
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

export function validarTelefone(telefone: string): boolean {
  const apenasNumeros = telefone.replace(/\D/g, '')
  return apenasNumeros.length >= 10 && apenasNumeros.length <= 13
}

export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export function formatarTelefoneExibicao(telefone: string): string {
  const normalizado = normalizarTelefone(telefone)
  const apenasNumeros = normalizado.replace(/\D/g, '')
  
  if (apenasNumeros.length === 13) {
    const pais = apenasNumeros.slice(0, 2)
    const ddd = apenasNumeros.slice(2, 4)
    const parte1 = apenasNumeros.slice(4, 9)
    const parte2 = apenasNumeros.slice(9)
    return `+${pais} (${ddd}) ${parte1}-${parte2}`
  }
  
  return telefone
}

// Navegação entre a página inicial e as páginas de cada eleição.
// - a "rota" fica no hash do iframe (#/2026): o botão Voltar do navegador funciona;
// - a troca usa a View Transitions API quando o navegador tem (Chrome, Edge, Safari 18+, Firefox 144+);
//   nos demais, vale a animação CSS de entrada da página (.vista).
import { useCallback, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

const ANOS = ['2022', '2026']
const lerHash = () => {
  const ano = window.location.hash.replace('#/', '')
  return ANOS.includes(ano) ? ano : null
}

export function useEleicao() {
  const [eleicao, setEleicao] = useState(lerHash)

  const aplicar = useCallback((ano) => {
    const trocar = () => {
      flushSync(() => setEleicao(ano))
      // cada página começa do topo — sem precisar rolar para achar os dados
      const rolagem = document.getElementById('rolagem')
      rolagem?.scrollTo(0, 0)
      rolagem?.focus({ preventScroll: true }) // setas, PageDown e espaço já rolam sem precisar clicar antes
    }
    const semAnimacao = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (document.startViewTransition && !semAnimacao) document.startViewTransition(trocar)
    else trocar()
  }, [])

  // botão Voltar/Avançar do navegador
  useEffect(() => {
    const aoMudarHash = () => aplicar(lerHash())
    window.addEventListener('hashchange', aoMudarHash)
    return () => window.removeEventListener('hashchange', aoMudarHash)
  }, [aplicar])

  const irPara = useCallback((ano) => {
    const hash = ano ? `#/${ano}` : '#/'
    if (window.location.hash === hash) aplicar(ano)
    else window.location.hash = hash // dispara o hashchange acima
  }, [aplicar])

  return [eleicao, irPara]
}

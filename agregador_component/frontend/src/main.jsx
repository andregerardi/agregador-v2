import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Streamlit } from './streamlit.js'
import { validarPayload } from './lib/seguranca.js'
import './styles.css'

function Raiz() {
  const [payload, setPayload] = useState(null)
  const [erro, setErro] = useState(null)

  // 1) recebe os dados: do Python (produção) ou de /dev-payload.json (npm run dev)
  useEffect(() => {
    if (Streamlit.dentroDoStreamlit) {
      Streamlit.aoRenderizar((args) => {
        try { setPayload(validarPayload(args.payload)) } catch { setErro('Não foi possível carregar os dados.') }
      })
    } else {
      fetch('./dev-payload.json')
        .then((r) => r.json())
        .then((bruto) => setPayload(validarPayload(bruto)))
        .catch(() => setErro('Fora do Streamlit: gere o arquivo public/dev-payload.json com "python exportar_payload.py".'))
    }
  }, [])

  // 2) o site ocupa a janela inteira e rola DENTRO do iframe (como um site comum). É isso que
  //    permite a barra fixa no topo, voltar ao topo ao trocar de página e as transições.
  //    O iframe do Streamlit é da mesma origem, então ele mesmo se ajusta — não depende de CSS no app.py.
  useEffect(() => {
    let telaCheia = false
    try {
      const quadro = window.frameElement // null se a origem for diferente
      if (quadro) {
        quadro.style.cssText += ';position:fixed;inset:0;width:100vw;height:100dvh;border:0;z-index:999990;background:#F7F6F3'
        telaCheia = true
      }
    } catch { /* origem diferente */ }
    if (!telaCheia && Streamlit.dentroDoStreamlit) Streamlit.ajustarAltura(window.screen.height)
  }, [])

  // A rolagem acontece neste contêiner, e não no documento: o Streamlit cria o iframe com
  // scrolling="no", que bloqueia roda do mouse/teclado no documento, mas não em elementos internos.
  return (
    <div id="rolagem" className="rolagem" tabIndex={-1}>
      {erro && <p className="aviso">{erro}</p>}
      {!erro && !payload && <p className="aviso">Carregando os dados das pesquisas…</p>}
      {payload && <App payload={payload} />}
    </div>
  )
}

createRoot(document.getElementById('root')).render(<Raiz />)

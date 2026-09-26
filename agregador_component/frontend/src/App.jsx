import React from 'react'
import Inicio, { Realizacao } from './pages/Inicio.jsx'
import Eleicao2022 from './pages/Eleicao2022.jsx'
import Eleicao2026 from './pages/Eleicao2026.jsx'
import { useEleicao } from './lib/navegacao.js'

export default function App({ payload }) {
  const { config, e2022, e2026 } = payload
  const [eleicao, irPara] = useEleicao() // null = página inicial

  return (
    <main className="pagina">
      {eleicao === null && <Inicio payload={payload} irPara={irPara} />}
      {eleicao === '2022' && <Eleicao2022 dados={e2022} config={config} irPara={irPara} />}
      {eleicao === '2026' && <Eleicao2026 dados={e2026} config={config} irPara={irPara} />}

      <footer className="rodape">
        {eleicao !== null && <Realizacao />}
        Site publicado em: 15/05/2022.<br />
        Lançamento: 03/08/2022.<br />
        Última atualização: {config.atualizacao}<br />
        <span className="versao">Interface v{__VERSAO__}</span>
      </footer>
    </main>
  )
}

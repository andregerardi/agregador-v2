import React, { useState } from 'react'
import Info, { Hero } from './Info.jsx'
import { Divisor } from '../components/ui.jsx'
import { CAND_2022 } from '../config/eleicao2022.js'
import { dataBR, unicos } from '../lib/stats.js'

/** Cartão de entrada de uma eleição: quem é acompanhado, quantas pesquisas, até quando. */
function CartaoEleicao({ ano, dados, candidatos, irPara }) {
  const rows = dados.rows ?? []
  const datas = rows.map((r) => r.data).filter(Boolean)
  const institutos = unicos(rows.map((r) => r.nome_instituto)).length
  const vazio = !rows.length

  return (
    <button type="button" className="cartao-eleicao" onClick={() => irPara(ano)} style={{ viewTransitionName: `eleicao-${ano}` }}>
      <span className="cartao-ano">Eleições {ano}</span>
      <span className="cartao-fotos">
        {candidatos.map((c) => (c.foto
          ? <img key={c.id} src={c.foto} alt="" title={c.nome} />
          : <span key={c.id} className="sem-foto" title={c.nome}>{c.nome[0]}</span>))}
      </span>
      <span className="cartao-nomes">{candidatos.map((c) => c.nome).join(', ')}</span>
      <span className="cartao-meta">
        {vazio
          ? 'Banco ainda sem pesquisas'
          : <>{rows.length} pesquisas de {institutos} institutos<br />de {dataBR(datas[0], '/')} a {dataBR(datas[datas.length - 1], '/')}</>}
      </span>
      <span className="cartao-acao">Abrir os dados de {ano}</span>
    </button>
  )
}

const LOGO_LAR = 'https://www.larunicamp.com.br/wp-content/uploads/2019/08/logo-lar-unicamp.png'

/** Faixa de realização, logo abaixo do hero. Se a imagem não carregar, fica o nome por extenso. */
export function Realizacao() {
  const [falhou, setFalhou] = useState(false)
  return (
    <a className="realizacao" href="https://www.larunicamp.com.br" target="_blank" rel="noopener noreferrer" aria-label="Laboratório de Antropologia da Religião (LAR/Unicamp) — abre em nova aba">
      <span className="rotulo-mono">Realização</span>
      {falhou
        ? <span className="realizacao-nome">Laboratório de Antropologia da Religião — LAR/Unicamp</span>
        : <img src={LOGO_LAR} alt="LAR — Laboratório de Antropologia da Religião, Unicamp" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFalhou(true)} />}
    </a>
  )
}

export default function Inicio({ payload, irPara }) {
  const { config, e2022, e2026 } = payload
  const lista = (mapa, fotos) => Object.entries(mapa ?? {}).map(([id, c]) => ({ id, nome: c.nome, foto: fotos?.[id] }))

  return (
    <div className="vista">
      <Hero />

      <section className="escolha" aria-labelledby="escolha-titulo">
        <h2 id="escolha-titulo" className="titulo-turno">Escolha a eleição</h2>
        <div className="cartoes">
          <CartaoEleicao ano="2022" dados={e2022} irPara={irPara} candidatos={lista({ ...CAND_2022, ...e2022.candidatos }, e2022.fotos).filter((c) => CAND_2022[c.id])} />
          <CartaoEleicao ano="2026" dados={e2026} irPara={irPara} candidatos={lista(e2026.candidatos, e2026.fotos)} />
        </div>
      </section>

      <Divisor />
      <Info rows={e2022.rows} rows2026={e2026.rows} mM={config.m_m} mM15={config.m_m15} />
    </div>
  )
}

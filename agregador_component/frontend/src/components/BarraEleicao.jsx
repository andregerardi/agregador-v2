import React from 'react'

/**
 * Barra fixa no topo da página de uma eleição: voltar ao início, trocar de eleição e de turno
 * sem perder o lugar na página.
 */
export default function BarraEleicao({ eleicao, irPara, turno, aoMudarTurno }) {
  return (
    <nav className="barra" aria-label="Navegação da eleição">
      <button type="button" className="barra-voltar" onClick={() => irPara(null)}>
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4.5 7 10l5.5 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Início
      </button>

      <div className="segmentado" role="group" aria-label="Eleição">
        {['2022', '2026'].map((ano) => (
          <button key={ano} type="button" aria-pressed={eleicao === ano} className={eleicao === ano ? 'ativo' : ''} onClick={() => irPara(ano)}>
            {ano}
          </button>
        ))}
      </div>

      <div className="segmentado" role="radiogroup" aria-label="Turno">
        {[['1t', '1º turno'], ['2t', '2º turno']].map(([valor, rotulo]) => (
          <button key={valor} type="button" role="radio" aria-checked={turno === valor} className={turno === valor ? 'ativo' : ''} onClick={() => aoMudarTurno(valor)}>
            {rotulo}
          </button>
        ))}
      </div>
    </nav>
  )
}

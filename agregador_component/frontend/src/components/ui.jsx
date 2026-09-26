import React, { useId, useState } from 'react'

export const Divisor = () => <hr className="divisor" />

/** Título central de turno / eleição (h2 com o filete laranja-ciano). */
export const TituloTurno = ({ children }) => <h2 className="titulo-turno">{children}</h2>

/** Título de seção numerada ("1. Intenção de voto"). */
export const TituloSecao = ({ children }) => <h3 className="titulo-secao">{children}</h3>

const IconeGrafico = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 18" aria-hidden="true">
    <path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2z" />
  </svg>
)

/** Cabeçalho de bloco (o h3 em card com borda laranja). */
export const Cabecalho = ({ children, icone = false }) => (
  <h3 className="cabecalho">
    {icone && <IconeGrafico />}
    {children}
  </h3>
)

export const Faixa = ({ children }) => <h4 className="faixa">{children}</h4>

/** Equivalente ao st.expander */
export function Expander({ titulo, children, abertoInicial = false }) {
  const [aberto, setAberto] = useState(abertoInicial)
  return (
    <details className="expander" open={aberto} onToggle={(e) => setAberto(e.currentTarget.open)}>
      <summary>{titulo}</summary>
      {aberto && <div className="expander-corpo">{children}</div>}
    </details>
  )
}

/** Equivalente ao st.checkbox */
export function Caixa({ rotulo, marcado, aoMudar }) {
  const id = useId()
  return (
    <label className="caixa" htmlFor={id}>
      <input id={id} type="checkbox" checked={marcado} onChange={(e) => aoMudar(e.target.checked)} />
      <span>{rotulo}</span>
    </label>
  )
}

/** Equivalente ao st.selectbox. opcoes: [{ valor, rotulo }] */
export function Seletor({ rotulo, valor, aoMudar, opcoes, vazio = '--Escolha a opção--' }) {
  const id = useId()
  return (
    <div className="seletor">
      <label htmlFor={id}>{rotulo}</label>
      <select id={id} value={valor} onChange={(e) => aoMudar(e.target.value)}>
        <option value="">{vazio}</option>
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>{o.rotulo}</option>
        ))}
      </select>
    </div>
  )
}

/** Equivalente ao st.radio horizontal estilizado como "pills". */
export function Pills({ legenda, opcoes, valor, aoMudar }) {
  return (
    <div className="pills-bloco">
      <span className="rotulo-mono">{legenda}</span>
      <div className="pills" role="radiogroup" aria-label={legenda}>
        {opcoes.map((o) => (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={valor === o.valor}
            className={valor === o.valor ? 'pill ativa' : 'pill'}
            onClick={() => aoMudar(o.valor)}
          >
            {o.rotulo}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Equivalente ao st.metric */
export const Metrica = ({ rotulo, valor }) => (
  <div className="metrica">
    <span className="metrica-rotulo">{rotulo}</span>
    <span className="metrica-valor">{valor}</span>
  </div>
)

/** Notas de rodapé dos blocos (os antigos <h7>). Aceita strings ou JSX. */
export const Notas = ({ itens }) => (
  <div className="notas">
    {itens.filter(Boolean).map((n, i) => (
      <p key={i}>Nota {i + 1}: {n}</p>
    ))}
  </div>
)

export const Aviso = ({ children }) => <p className="aviso">{children}</p>

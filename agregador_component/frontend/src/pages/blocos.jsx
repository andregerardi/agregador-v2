// Blocos interativos compartilhados pelas páginas de 2022 e 2026.
import React, { useMemo, useState } from 'react'
import Grafico from '../components/Grafico.jsx'
import { Aviso, Cabecalho, Caixa, Notas, Seletor } from '../components/ui.jsx'
import { nomeInstituto } from '../lib/stats.js'

/** Checkbox que revela um gráfico (ex.: "Intenção de voto geral"). */
export function BlocoGraficoGeral({ titulo, rotulo, montar, notas, semDados }) {
  const [aberto, setAberto] = useState(false)
  const figura = useMemo(() => (aberto ? montar() : null), [aberto, montar])
  return (
    <section>
      <Cabecalho icone>{titulo}</Cabecalho>
      <Caixa rotulo={rotulo} marcado={aberto} aoMudar={setAberto} />
      {aberto && (figura ? <><Grafico figura={figura} /><Notas itens={notas ?? []} /></> : <Aviso>{semDados}</Aviso>)}
    </section>
  )
}

/** Seletor de religião que revela o gráfico do segmento. opcoes: [{ valor, rotulo }] */
export function BlocoReligiao({ titulo, opcoes, montar, notas, semDados }) {
  const [seg, setSeg] = useState('')
  const figura = useMemo(() => (seg ? montar(seg) : null), [seg, montar])
  return (
    <section>
      <Cabecalho icone>{titulo}</Cabecalho>
      <Seletor rotulo="Selecione a religião:" valor={seg} aoMudar={setSeg} opcoes={opcoes} />
      {!opcoes.length && <Aviso>{semDados}</Aviso>}
      {seg && (figura ? <><Grafico figura={figura} /><Notas itens={notas?.(seg) ?? []} /></> : <Aviso>{semDados}</Aviso>)}
    </section>
  )
}

/** Dois seletores (instituto + religião) que revelam o comparativo geral × segmento. */
export function BlocoInstituto({ titulo, institutos, opcoes, montar, notas }) {
  const [inst, setInst] = useState('')
  const [seg, setSeg] = useState('')
  const figura = useMemo(() => (inst && seg ? montar(inst, seg) : null), [inst, seg, montar])
  const rotuloSeg = opcoes.find((o) => o.valor === seg)?.rotulo.toLowerCase()
  return (
    <section>
      <Cabecalho icone>{titulo}</Cabecalho>
      <div className="duas-colunas">
        <Seletor
          rotulo="Selecione o instituto de pesquisa:" vazio="--Escolha o instituto--" valor={inst} aoMudar={setInst}
          opcoes={institutos.map((i) => ({ valor: i, rotulo: nomeInstituto(i) }))}
        />
        <Seletor rotulo="Escolha a religião:" vazio="--Escolha a religião--" valor={seg} aoMudar={setSeg} opcoes={opcoes} />
      </div>
      {inst && seg && (figura
        ? <div className="grafico-estreito"><Grafico figura={figura} /></div>
        : <Aviso>O instituto {nomeInstituto(inst)} não divulgou dados de {rotuloSeg} nesse turno.</Aviso>)}
      <Notas itens={notas ?? []} />
    </section>
  )
}

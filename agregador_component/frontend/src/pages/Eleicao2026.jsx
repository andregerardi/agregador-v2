import React, { useCallback, useState } from 'react'
import Resumo from '../components/Resumo.jsx'
import { Aviso, Cabecalho, Divisor, Expander, Notas, TituloSecao, TituloTurno } from '../components/ui.jsx'
import { BlocoGraficoGeral, BlocoInstituto, BlocoReligiao } from './blocos.jsx'
import { SobreBanco } from './Info.jsx'
import BarraEleicao from '../components/BarraEleicao.jsx'
import { figuraInstituto, figuraMediaMovel } from '../lib/figuras.js'
import { eventos2026 } from '../config/eventos2026.js'
import { nomeInstituto, temDados, ultimaData, unicos } from '../lib/stats.js'

const ORDINAL = { '1t': '1º turno', '2t': '2º turno' }
const SEM_DADOS = 'Ainda não há pesquisas com esse recorte no banco de 2026.'
// Candidatos exibidos no 2º turno (chaves de CAND_2026 no dados.py). No 1º turno entram todos.
const CANDIDATOS_2T = ['lul', 'bol']

export default function Eleicao2026({ dados, config, irPara }) {
  const [turno, setTurno] = useState('1t')
  const { rows, origem, candidatos: CAND, erro } = dados
  const semBanco = erro || !rows?.length

  return (
    <div className="vista">
      <BarraEleicao eleicao="2026" irPara={irPara} turno={turno} aoMudarTurno={setTurno} />
      <h1 className="titulo-eleicao" style={{ viewTransitionName: 'eleicao-2026' }}>Eleições 2026</h1>
      <p className="subtitulo-eleicao">{Object.values(CAND).map((c) => c.nome).join(', ')} — intenção de voto e rejeição por religião.</p>

      {semBanco ? (
        <Aviso>Não foi possível carregar o banco de 2026 no momento.</Aviso>
      ) : (
        <>
          <SobreBanco rows={rows} prefixos={Object.keys(CAND)} ano="2026" arquivo="lista_2026.csv">
            <Expander titulo="Informações sobre o banco de 2026">
              <div className="metodologia">
                <p>1. O banco de 2026 é atualizado continuamente e reúne as pesquisas nacionais com recorte religioso;</p>
                <p>2. Candidatos acompanhados: {Object.values(CAND).map((c) => c.nome).join(', ')};</p>
                <p>3. Institutos considerados: {unicos(rows.map((r) => r.nome_instituto)).sort().map(nomeInstituto).join(', ')};</p>
                <p>4. Total de pesquisas mapeadas: {rows.length};</p>
                <p>5. Fonte dos dados: {origem}.</p>
              </div>
            </Expander>
          </SobreBanco>
          <Divisor />

          <Turno key={turno} turno={turno} dados={dados} config={config} />

          <Notas itens={[
            'Os gráficos reproduzem os dados divulgados pelos institutos de pesquisa a partir do recorte religioso. Em alguns casos os institutos não coletam tais informações.',
            'Os recortes e candidatos sem pesquisas registradas no banco não são exibidos.',
          ]} />
        </>
      )}
    </div>
  )
}

function Turno({ turno, dados, config }) {
  const { rows, candidatos: CAND, segmentos: SEG, fotos, agre, logo } = dados
  const mM = config.m_m
  const prefixos = Object.keys(CAND).filter((p) => turno === '1t' || CANDIDATOS_2T.includes(p))
  const candidatos = prefixos.map((id) => ({ id, nome: CAND[id].nome, foto: fotos?.[id] }))
  const segmentos = Object.entries(SEG).map(([id, rotulo]) => ({ id, rotulo }))
  const institutos = unicos(rows.map((r) => r.nome_instituto)).sort()

  // religiões com ao menos um candidato com dados para o sufixo (ex.: '1t' ou 'rej_1t')
  const religioes = (sufixo) =>
    segmentos
      .filter((s) => s.id !== 'ger' && prefixos.some((p) => temDados(rows, `${p}_${s.id}_${sufixo}`)))
      .map((s) => ({ valor: s.id, rotulo: s.rotulo }))

  const figura = useCallback((sufixo, titulo, yMax, { brancos, tituloY } = {}) => {
    const series = prefixos.map((p) => ({ col: `${p}_${sufixo}`, nome: CAND[p].nome, cor: CAND[p].cor, escala: CAND[p].escala }))
    if (brancos) series.push({ col: brancos, nome: 'Brancos, nulos, NS e NR', cor: 'grey', escala: 'Greys' })
    // minPeriods = 1: enquanto o banco é pequeno, a média usa as pesquisas disponíveis
    return figuraMediaMovel({ rows, series, janela: mM, minPeriods: 1, titulo, tituloY, yMax, agre, logo, legendaHorizontal: true, eventos: eventos2026(sufixo) })
  }, [rows, mM, agre])

  const notasGrafico = [
    `Método utilizado: média móvel de ${mM} pesquisas.`,
    `Os valores indicados no gráfico correspondem à última média da série temporal, registrada em ${ultimaData(rows)}.`,
    'Enquanto o banco de 2026 é pequeno, a média móvel é calculada com as pesquisas disponíveis.',
  ]
  const rotulo = (seg) => SEG[seg].toLowerCase()
  const o = ORDINAL[turno]

  const votoGeral = useCallback(() => figura(`ger_${turno}`, `Média móvel das intenções de voto de candidatos à presidência (${o})`, turno === '1t' ? 70 : 80, { brancos: `bra_nul_ns_nr_ger_${turno}` }), [figura, turno])
  const votoReligiao = useCallback((seg) => figura(`${seg}_${turno}`, `Média móvel das intenções de voto entre ${rotulo(seg)} (${o})`, turno === '1t' ? 80 : 90), [figura, turno])
  const rejGeral = useCallback(() => figura(`ger_rej_${turno}`, `Média móvel da rejeição dos candidatos à presidência (${o})`, 100, { tituloY: 'Rejeição (%)' }), [figura, turno])
  const rejReligiao = useCallback((seg) => figura(`${seg}_rej_${turno}`, `Média móvel da rejeição entre ${rotulo(seg)} (${o})`, 100, { tituloY: 'Rejeição (%)' }), [figura, turno])
  const porInstituto = useCallback((inst, seg) => figuraInstituto({
    rows, instituto: inst, agre, logo, rotuloSegmento: rotulo(seg),
    titulo: `Intenção de voto 'geral' e de '${rotulo(seg)}' por candidato segundo '${nomeInstituto(inst)}'`,
    candidatos: prefixos.map((p) => ({ nome: CAND[p].nome, cor: CAND[p].cor, colSegmento: `${p}_${seg}_${turno}`, colGeral: `${p}_ger_${turno}` })),
  }), [rows, agre, turno])

  return (
    <div>
      <TituloTurno>{turno === '1t' ? 'Primeiro Turno' : 'Segundo Turno'}</TituloTurno>
      <Divisor />
      <TituloSecao>1. Intenção de voto:</TituloSecao>
      <Divisor />

      <section>
        <Cabecalho>{turno === '1t' ? 'Resumo - intenção de voto geral e por religião segundo candidato:' : 'Resumo - intenção de voto por candidato:'}</Cabecalho>
        <Resumo rows={rows} candidatos={candidatos} segmentos={segmentos} coluna={(c, s) => `${c}_${s}_${turno}`} janela={mM} minPeriods={1} ocultarVazios />
      </section>

      <BlocoGraficoGeral
        titulo="Intenção de voto geral:" montar={votoGeral} notas={notasGrafico} semDados={SEM_DADOS}
        rotulo={turno === '1t' ? 'Selecione para visualizar o gráfico da intenção de voto geral' : 'Clique para visualizar'}
      />
      <Divisor />
      <BlocoReligiao titulo="Intenção de voto por religião:" opcoes={religioes(turno)} montar={votoReligiao} notas={() => notasGrafico} semDados={SEM_DADOS} />
      <Divisor />
      <BlocoInstituto titulo="Intenção de voto por instituto de pesquisa:" institutos={institutos} opcoes={religioes(turno)} montar={porInstituto} />
      <Divisor />

      {turno === '1t' && (
        <>
          <TituloSecao>2. Rejeição</TituloSecao>
          <Divisor />
          <section>
            <Cabecalho>Resumo - rejeição geral e por religião segundo candidato:</Cabecalho>
            <Resumo rows={rows} candidatos={candidatos} segmentos={segmentos} coluna={(c, s) => `${c}_${s}_rej_1t`} janela={mM} minPeriods={1} ocultarVazios />
          </section>
          <BlocoGraficoGeral titulo="Rejeição geral:" rotulo="Selecione para visualizar o gráfico da rejeição" montar={rejGeral} notas={notasGrafico} semDados={SEM_DADOS} />
          <Divisor />
          <BlocoReligiao titulo="Rejeição por religião:" opcoes={religioes('rej_1t')} montar={rejReligiao} notas={() => notasGrafico} semDados={SEM_DADOS} />
          <Divisor />
        </>
      )}
    </div>
  )
}

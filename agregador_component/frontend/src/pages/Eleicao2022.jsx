import React, { useCallback, useMemo, useState } from 'react'
import Resumo from '../components/Resumo.jsx'
import { Cabecalho, Divisor, Notas, TituloSecao, TituloTurno } from '../components/ui.jsx'
import { BlocoGraficoGeral, BlocoInstituto, BlocoReligiao } from './blocos.jsx'
import { BLOCOS_2022, CAND_2022 as CAND_BASE, SEG_2022, colBrancos } from '../config/eleicao2022.js'
import BarraEleicao from '../components/BarraEleicao.jsx'
import { SobreBanco } from './Info.jsx'
import { EVENTOS_2022 } from '../config/eventos2022.js'
import { figuraInstituto, figuraMediaMovel } from '../lib/figuras.js'
import { contar, nomeInstituto, serie, ultimaData, unicos } from '../lib/stats.js'

const ORDINAL = { '1t': '1º turno', '2t': '2º turno' }
const NOTA_REJEICAO = <>O percentual da <i>rejeição</i> dos candidatos foi obtido pela resposta de eleitores que declaram "não votar de jeito nenhum" em determinado candidato.</>
const NOTA_CAMPANHA = 'A linha pontilhada indica o período de início da campanha eleitoral oficial (15/08).'

export default function Eleicao2022({ dados, config, irPara }) {
  const [turno, setTurno] = useState('1t')
  return (
    <div className="vista">
      <BarraEleicao eleicao="2022" irPara={irPara} turno={turno} aoMudarTurno={setTurno} />
      <h1 className="titulo-eleicao" style={{ viewTransitionName: 'eleicao-2022' }}>Eleições 2022</h1>
      <p className="subtitulo-eleicao">Lula, Bolsonaro e Ciro Gomes — intenção de voto e rejeição por religião.</p>

      <SobreBanco rows={dados.rows} prefixos={Object.keys(CAND_BASE)} ano="2022" arquivo="lista_2022.csv" />
      <Divisor />

      {/* key={turno}: trocar de turno zera checkboxes e seletores, como no app original */}
      <Turno key={turno} turno={turno} dados={dados} config={config} />
    </div>
  )
}

function Turno({ turno, dados, config }) {
  const { rows, fotos, agre, logo } = dados
  const { m_m: mM, m_m15: mM15 } = config
  const bloco = BLOCOS_2022[turno]
  // cor/nome/escala definidos em dados.py (CAND_2022) têm prioridade sobre o padrão do frontend
  const CAND_2022 = useMemo(() => Object.fromEntries(Object.entries(CAND_BASE).map(([id, base]) => {
    const py = dados.candidatos?.[id] ?? {}
    return [id, { ...base, ...py, corInstituto: py.cor ?? base.corInstituto }]
  })), [dados.candidatos])

  const candidatos = bloco.candidatos.map((id) => ({ id, nome: CAND_2022[id].nome, foto: fotos?.[id] }))
  const institutos = unicos(rows.map((r) => r.nome_instituto)).sort()
  const opcoes = (ids) => ids.map((id) => ({ valor: id, rotulo: SEG_2022[id].rotulo }))
  const cards = (ids) => ids.map((id) => ({ id, rotulo: SEG_2022[id].card }))
  const dia = ultimaData(rows)
  const diaRejeicao = (() => { const d = serie(rows, 'lul_ger_rej_1t').datas; return d.length ? ultimaData([{ data: d[d.length - 1] }]) : dia })()

  // ---------- figuras ----------
  const figVoto = useCallback((seg) => {
    const chave = `${seg}_${turno}`
    const series = bloco.candidatos.map((id) => ({
      col: `${id}_${chave}`, nome: CAND_2022[id].nome, nomePontos: `Int. voto ${CAND_2022[id].nome.split(' ')[0]}`,
      cor: CAND_2022[id].cor, escala: CAND_2022[id].escala, ay: CAND_2022[id].ay,
    }))
    const nomeBrancos = seg === 'ger' ? 'Brancos, nulos, NS e NR' : 'Brancos e nulos'
    series.push({ col: colBrancos(seg, turno), nome: nomeBrancos, nomePontos: `${nomeBrancos} (pesquisas)`, cor: 'grey', escala: 'Greys', ay: 20 })
    const titulo = seg === 'ger'
      ? `Média móvel das intenções de voto de candidatos à presidência (${ORDINAL[turno]})`
      : `Média móvel das intenções de voto ${SEG_2022[seg].titulo} por candidato à presidência (${ORDINAL[turno]})`
    return figuraMediaMovel({ rows, series, janela: mM, titulo, yMax: EVENTOS_2022[chave]?.yMax, eventos: EVENTOS_2022[chave], agre, logo })
  }, [rows, turno, mM, agre, bloco, CAND_2022])

  const figRejeicao = useCallback((seg) => {
    const chave = `${seg}_rej_${turno}`
    const series = bloco.candidatos.map((id) => ({
      col: `${id}_${chave}`, nome: CAND_2022[id].nome, nomePontos: `Rejeição ${CAND_2022[id].nome.split(' ')[0]}`,
      cor: CAND_2022[id].cor, escala: CAND_2022[id].escala, ay: CAND_2022[id].ay,
    }))
    const titulo = seg === 'ger'
      ? `Média móvel da rejeição geral de candidatos à presidência (${ORDINAL[turno]})`
      : `Média móvel da rejeição ${SEG_2022[seg].titulo} por candidato à presidência (${ORDINAL[turno]})`
    return figuraMediaMovel({
      rows, series, janela: seg === 'ger' ? mM15 : mM, titulo, tituloY: 'Rejeição (%)',
      yMax: EVENTOS_2022[chave]?.yMax, eventos: EVENTOS_2022[chave], agre, logo,
    })
  }, [rows, turno, mM, mM15, agre, bloco, CAND_2022])

  const figInstituto = useCallback((rejeicao) => (inst, seg) => {
    const sufixo = rejeicao ? `_rej_${turno}` : `_${turno}`
    return figuraInstituto({
      rows, instituto: inst, agre, logo, rotuloSegmento: SEG_2022[seg].plural,
      yMax: seg === 'out' ? 60 : 70,
      tituloY: rejeicao ? 'Rejeição (%)' : 'Intenção de voto (%)',
      titulo: `${rejeicao ? 'Rejeição' : 'Intenção de voto'} 'geral' e de '${SEG_2022[seg].plural}' por candidato segundo '${nomeInstituto(inst)}' (${ORDINAL[turno]})`,
      candidatos: bloco.candidatos.map((id) => ({
        nome: CAND_2022[id].nome, cor: CAND_2022[id].corInstituto,
        colSegmento: `${id}_${seg}${sufixo}`, colGeral: `${id}_ger${sufixo}`,
      })),
    })
  }, [rows, turno, agre, bloco, CAND_2022])

  const nVoto = contar(rows, `lul_ger_${turno}`, 1.0001)
  const nSeg = (seg, rej = false) => contar(rows, `lul_${seg}${rej ? '_rej' : ''}_${turno}`, 1.0001)

  const montarVotoGeral = useCallback(() => figVoto('ger'), [figVoto])
  const montarRejeicaoGeral = useCallback(() => figRejeicao('ger'), [figRejeicao])
  const montarInstitutoVoto = useMemo(() => figInstituto(false), [figInstituto])
  const montarInstitutoRejeicao = useMemo(() => figInstituto(true), [figInstituto])

  return (
    <div>
      <TituloTurno>{turno === '1t' ? 'Primeiro Turno' : 'Segundo Turno'}</TituloTurno>
      <Divisor />
      <TituloSecao>1. Intenção de voto:</TituloSecao>
      <Divisor />

      <section>
        <Cabecalho>{turno === '1t' ? 'Resumo - intenção de voto geral e por religião segundo candidato:' : 'Resumo - intenção de voto por candidato'}</Cabecalho>
        <Resumo rows={rows} candidatos={candidatos} segmentos={cards(bloco.resumoVoto)} coluna={(c, s) => `${c}_${s}_${turno}`} janela={mM} />
        <Notas itens={[
          `Método utilizado para o cálculo: média móvel de ${mM} dias.`,
          <>Os valores indicados no resumo correspondem à última média da série temporal, registrada no dia <i>{dia}</i>.</>,
          `Para o cálculo da média móvel da intenção de voto geral utilizamos ${nVoto} pesquisas eleitorais.`,
        ]} />
      </section>
      <Divisor />

      <BlocoGraficoGeral
        titulo="Intenção de voto geral:"
        rotulo={turno === '1t' ? 'Selecione para visualizar o gráfico da intenção de voto geral' : 'Clique para visualizar'}
        montar={montarVotoGeral}
        notas={[
          `Método utilizado: média móvel de ${mM} dias.`,
          `Os valores indicados no gráfico correspondem à última média da série temporal, registrada no dia ${dia}.`,
          `Para o cálculo da média móvel da intenção de voto geral utilizamos ${nVoto} pesquisas eleitorais.`,
          NOTA_CAMPANHA,
        ]}
      />
      <Divisor />

      <BlocoReligiao
        titulo="Intenção de voto por religião:" opcoes={opcoes(bloco.religioesVoto)} montar={figVoto}
        notas={(seg) => [
          `Método utilizado: média móvel de ${mM} dias.`,
          `Para o cálculo da média móvel da intenção de voto geral utilizamos ${nVoto} pesquisas eleitorais e ${nSeg(seg)} para ${SEG_2022[seg].plural}.`,
          NOTA_CAMPANHA,
        ]}
      />
      <Divisor />

      <BlocoInstituto
        titulo="Intenção de voto por religião e candidato segundo instituto de pesquisa:"
        institutos={institutos} opcoes={opcoes(bloco.institutoVoto)} montar={montarInstitutoVoto}
        notas={[
          'Os gráficos reproduzem os dados divulgados pelos institutos de pesquisa a partir do recorte religioso. Em alguns casos os institutos não coletam tais informações.',
          'Os gráficos com linhas descontinuadas indicam que o instituto não coletou a informação em determinada pesquisa.',
        ]}
      />
      <Divisor />

      {turno === '1t' && (
        <>
          <TituloSecao>2. Rejeição</TituloSecao>
          <Divisor />

          <section>
            <Cabecalho>Resumo - Rejeição geral e por religião segundo candidato:</Cabecalho>
            <Resumo rows={rows} candidatos={candidatos} segmentos={cards(bloco.resumoRejeicao)} coluna={(c, s) => `${c}_${s}_rej_1t`} janela={mM} />
            <Notas itens={[
              NOTA_REJEICAO,
              `Método utilizado para o cálculo: média móvel de ${mM} dias.`,
              <>Os valores indicados no resumo correspondem à última média da série temporal, registrada no dia <i>{dia}</i>.</>,
              <>Para o cálculo da <i>rejeição</i> dos candidatos utilizamos {nSeg('ger', true)} pesquisas eleitorais.</>,
            ]} />
          </section>
          <Divisor />

          <BlocoGraficoGeral
            titulo="Rejeição geral:" rotulo="Selecione para visualizar o gráfico da rejeição"
            montar={montarRejeicaoGeral}
            notas={[
              NOTA_REJEICAO,
              `Método utilizado: média móvel de ${mM15} dias.`,
              `Os valores indicados no gráfico correspondem à última média da série temporal, registrada no dia ${diaRejeicao}.`,
              `Para o cálculo da rejeição utilizamos ${nSeg('ger', true)} pesquisas eleitorais.`,
              'Mesmo com a aplicação da média móvel de 15 dias, o recorte temporal da rejeição geral de Ciro Gomes manteve-se oscilante. Trabalhamos com a hipótese de que a rejeição de Gomes associa-se à inclusão de concorrentes da 3ª via como alternativas, espaço disputado por Gomes. Portanto, supomos que a variação da rejeição de Ciro Gomes seja um efeito da inclusão ou desistência de outras candidaturas.',
              NOTA_CAMPANHA,
            ]}
          />
          <Divisor />

          <BlocoReligiao
            titulo="Rejeição por religião:" opcoes={opcoes(bloco.religioesRejeicao)} montar={figRejeicao}
            notas={(seg) => [
              NOTA_REJEICAO,
              `Método utilizado: média móvel de ${mM} dias.`,
              `Os valores indicados no gráfico correspondem à última média da série temporal, registrada no dia ${diaRejeicao}.`,
              `Para o cálculo da rejeição de ${SEG_2022[seg].plural} utilizamos ${nSeg(seg, true)} pesquisas eleitorais.`,
              NOTA_CAMPANHA,
            ]}
          />
          <Divisor />

          <BlocoInstituto
            titulo="Rejeição por religião e candidato segundo instituto de pesquisa:"
            institutos={institutos} opcoes={opcoes(bloco.institutoRejeicao)} montar={montarInstitutoRejeicao}
            notas={[NOTA_REJEICAO, 'Os gráficos reproduzem os dados divulgados pelos institutos de pesquisa a partir do recorte religioso.']}
          />
          <Divisor />
        </>
      )}
    </div>
  )
}

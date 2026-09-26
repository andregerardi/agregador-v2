// Monta as figuras Plotly (data + layout). Substitui os ~30 blocos go.Figure()
// repetidos do app original por duas funções parametrizadas.
import { serie, temDados, mediaMovel } from './stats.js'

const LOGO_CEBRAP = 'https://cebrap.org.br/wp-content/themes/cebrap/images/logo-nav.png'

// Escalas do plotly.express que não existem por nome no plotly.js
const ESCALAS = {
  peach: ['#fde0c5', '#facba6', '#f8b58b', '#f59e72', '#f2855d', '#ef6a4c', '#eb4a40'],
  ice: ['#030512', '#191933', '#2b2c5a', '#3a3e85', '#3e53a0', '#3e6db2', '#4886bb', '#599fc4', '#72b8cd', '#95cfd8', '#c0e5e8', '#eafcfd'],
  Oranges: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'],
  Purples: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'],
  Greens: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
  Greys: ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'],
}
const escala = (nome) => {
  const cores = ESCALAS[nome] ?? ESCALAS.Greys
  return cores.map((c, i) => [i / (cores.length - 1), c])
}

const FONTE = { family: 'Arial, sans-serif', size: 13, color: '#2a3f5f' }

function layoutBase({ titulo, tituloY, yMax, categorias, margemTopo = 150, agre, logo, legendaHorizontal }) {
  const imagens = [
    { source: logo ?? LOGO_CEBRAP, xref: 'paper', yref: 'paper', x: 0.99, y: 1.02, sizex: 0.1, sizey: 0.1, xanchor: 'right', yanchor: 'bottom' },
  ]
  if (agre) {
    imagens.push({ source: agre, xref: 'paper', yref: 'paper', x: 0.99, y: 1.09, sizex: 0.12, sizey: 0.12, xanchor: 'right', yanchor: 'bottom' })
  }
  return {
    autosize: true,
    height: 760,
    margin: { r: 80, l: 70, b: 130, t: margemTopo },
    title: { text: `<i>${titulo}</i>`, x: 0.04, xanchor: 'left', font: { ...FONTE, size: 17 } },
    font: FONTE,
    plot_bgcolor: '#fff',
    paper_bgcolor: '#fff',
    hovermode: 'closest',
    xaxis: {
      title: { text: 'Mês, ano e instituto de pesquisa' },
      tickangle: 300,
      showgrid: false,
      type: 'category',
      categoryorder: 'array',
      categoryarray: categorias,
      automargin: true,
      linecolor: '#EBF0F8',
      ticks: '',
    },
    yaxis: {
      title: { text: tituloY },
      ...(yMax ? { range: [0, yMax] } : { rangemode: 'tozero' }),
      gridcolor: '#EBF0F8',
      zerolinecolor: '#EBF0F8',
      automargin: true,
    },
    legend: legendaHorizontal ? { orientation: 'h', y: 1.04, x: 0, yanchor: 'bottom' } : { orientation: 'v', y: 0.95 },
    images: imagens,
    annotations: [],
    shapes: [],
  }
}

/**
 * Legenda horizontal: reserva espaço no topo conforme o nº de linhas da legenda, para ela não
 * encostar no título nem nos logos (acontecia com 5+ candidatos em 2026).
 */
function acomodarLegenda(layout, nSeries) {
  const linhas = Math.ceil(nSeries / 4)
  const alturaLegenda = 24 * linhas + 12
  layout.margin.t = 96 + alturaLegenda
  layout.title.y = 1
  layout.title.yref = 'container'
  layout.title.yanchor = 'top'
  layout.title.pad = { t: 22 }
  layout.legend = { orientation: 'h', x: 0, y: 1.01, yanchor: 'bottom', entrywidth: 0.24, entrywidthmode: 'fraction' }
  const alturaPlot = layout.height - layout.margin.t - layout.margin.b
  layout.images.forEach((img, i) => { img.y = 1 + (alturaLegenda + 8 + i * 34) / alturaPlot })
  return layout
}

/**
 * Rótulos do último valor (38%, 30%...) muito próximos se sobrepõem — comum com vários candidatos
 * abaixo de 10%. Desloca verticalmente (ay, em pixels) para manter ao menos 20px entre eles.
 */
function afastarRotulos(rotulos, layout, yMax) {
  const topo = yMax ?? Math.max(...rotulos.map((r) => r.y)) * 1.15
  const pxPorPonto = (layout.height - layout.margin.t - layout.margin.b) / topo
  let anterior = -Infinity
  for (const r of [...rotulos].sort((a, b) => b.y - a.y)) { // de cima para baixo na tela
    let px = (topo - r.y) * pxPorPonto + (r.ay ?? 0)
    if (px - anterior < 20) px = anterior + 20
    r.ay = Math.round(px - (topo - r.y) * pxPorPonto)
    anterior = px
  }
}

/** Siglas na ordem cronológica do banco, restritas às que aparecem no gráfico. */
function ordenarCategorias(rows, usadas) {
  const set = new Set(usadas)
  const vistas = new Set()
  const saida = []
  for (const r of rows) {
    if (set.has(r.sigla) && !vistas.has(r.sigla)) {
      vistas.add(r.sigla)
      saida.push(r.sigla)
    }
  }
  return saida
}

/**
 * Gráfico de média móvel (pontos das pesquisas + linha da média + rótulo do último valor).
 * series:  [{ col, nome, nomePontos, cor, escala, ay }]
 * eventos: { anotacoes: [...], linhas: [...] } — marcos da campanha (config de 2022)
 */
export function figuraMediaMovel({
  rows, series, janela, minPeriods, titulo, tituloY = 'Intenção de voto (%)', yMax, eventos, agre, logo, legendaHorizontal = false,
}) {
  const data = []
  const rotulos = []
  const usadas = []
  let rank = 1

  for (const s of series) {
    if (!temDados(rows, s.col)) continue
    const { x, y } = serie(rows, s.col)
    const media = mediaMovel(y, janela, minPeriods)
    usadas.push(...x)

    data.push({
      type: 'scatter', mode: 'lines', x, y: media, name: s.nome, legendrank: rank, connectgaps: false,
      line: { color: s.cor, width: 2.5 },
      hovertemplate: `<b>${s.nome}</b> — média móvel: %{y:.1f}%<br>%{x}<extra></extra>`,
    })
    data.push({
      type: 'scatter', mode: 'markers', x, y, name: s.nomePontos ?? `Pesquisas - ${s.nome}`, legendrank: rank + 1,
      marker: { size: 6, color: y, colorscale: escala(s.escala), showscale: false },
      hovertemplate: `${s.nome}: %{y}%<br>%{x}<extra></extra>`,
    })
    rank += 2

    const ultimo = media[media.length - 1]
    if (ultimo != null) {
      rotulos.push({
        x: x[x.length - 1], y: ultimo, text: `${Math.trunc(ultimo)}%`, showarrow: true, arrowhead: 1,
        ax: 40, ay: s.ay ?? 0, font: { size: 20, color: 'black', family: 'Arial' },
      })
    }
  }

  if (!data.length) return null

  const categorias = ordenarCategorias(rows, usadas)
  const layout = layoutBase({ titulo, tituloY, yMax, categorias, agre, logo, legendaHorizontal })
  if (legendaHorizontal) acomodarLegenda(layout, data.length)
  afastarRotulos(rotulos, layout, yMax)
  layout.annotations.push(...rotulos)

  // marcos da campanha: só entram se a pesquisa de referência existir no eixo
  const existe = new Set(categorias)
  for (const a of eventos?.anotacoes ?? []) {
    const x = String(a.x).trim()
    if (!existe.has(x)) continue
    layout.annotations.push({
      x, y: a.y, text: a.text, showarrow: a.arrow, arrowhead: 1, yanchor: 'bottom',
      ax: a.ax, ay: a.ay, font: { size: 10, color: 'black', family: 'Arial' },
    })
  }
  for (const l of eventos?.linhas ?? []) {
    const x = String(l.x).trim()
    if (!existe.has(x)) continue
    // `ate` (em % do eixo) limita a altura da linha; sem ele, vai até o topo do gráfico
    const altura = typeof l.ate === 'number' ? { yref: 'y', y0: 0, y1: l.ate } : { yref: 'paper', y0: 0, y1: 1 }
    layout.shapes.push({
      type: 'line', xref: 'x', x0: x, x1: x, ...altura, opacity: 0.5,
      line: { color: 'black', width: Math.max(l.w * 2, 0.8), dash: 'dot' },
    })
  }
  return { data, layout }
}

/**
 * Gráfico por instituto: para cada candidato, a linha do segmento religioso (cheia)
 * e a linha geral (pontilhada). Sem média móvel — são os números divulgados.
 * candidatos: [{ nome, cor, colSegmento, colGeral }]
 */
export function figuraInstituto({
  rows, instituto, candidatos, rotuloSegmento, titulo, tituloY = 'Intenção de voto (%)', yMax = 70, agre, logo,
}) {
  const fonte = rows.filter((r) => r.nome_instituto === instituto)
  const x = fonte.map((r) => r.sigla)
  const num = (col) => fonte.map((r) => (typeof r[col] === 'number' && r[col] > 1 ? r[col] : null))
  const data = []
  let rank = 1

  for (const c of candidatos) {
    if (!temDados(fonte, c.colSegmento)) continue
    data.push({
      type: 'scatter', mode: 'lines+markers', x, y: num(c.colSegmento), name: `${c.nome} - ${rotuloSegmento}`,
      marker: { size: 5 }, line: { color: c.cor, width: 2.5 }, legendrank: rank, connectgaps: false,
    })
    if (temDados(fonte, c.colGeral)) {
      data.push({
        type: 'scatter', mode: 'lines+markers', x, y: num(c.colGeral), name: `${c.nome} - geral`,
        marker: { size: 4 }, line: { color: c.cor, width: 1.2, dash: 'dot' }, legendrank: rank + 1, connectgaps: false,
      })
    }
    rank += 2
  }
  if (!data.length) return null

  const layout = layoutBase({ titulo, tituloY, yMax, categorias: x, agre, logo, legendaHorizontal: true, margemTopo: 170 })
  layout.height = 680
  acomodarLegenda(layout, data.length)
  return { data, layout }
}

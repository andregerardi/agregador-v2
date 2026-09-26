// Tudo o que chega do Python passa por aqui antes de ir para a tela. As planilhas são editadas à mão
// (e a de 2026 pode vir de uma planilha do Google): tratamos o conteúdo como NÃO confiável.

const NOME_COLUNA = /^[\wÀ-ÿ .\-/()%ºª]{1,80}$/
const COR = /^(#[0-9a-f]{3,8}|[a-z]{3,30}|rgba?\(\s*[\d.\s,%]+\))$/i
const ESCALAS = new Set(['peach', 'ice', 'Oranges', 'Greens', 'Purples', 'Greys'])
const LIMITE_TEXTO = 200

/** Só imagens embutidas (data:image/...) — nunca javascript:, http: ou caminhos arbitrários. */
export const imagemSegura = (uri) =>
  typeof uri === 'string' && /^data:image\/(png|jpe?g|webp);base64,[a-z0-9+/=]+$/i.test(uri) ? uri : undefined

/**
 * O Plotly interpreta um mini-HTML em títulos, legendas e rótulos (<b>, <i>, <a href>...).
 * Texto vindo da planilha/configuração perde os sinais < e > para não virar marcação nem link.
 */
export const textoPlotly = (v) => String(v ?? '').slice(0, LIMITE_TEXTO).replace(/[<>]/g, '')

const texto = (v) => (v == null ? v : String(v).slice(0, LIMITE_TEXTO))

function linhaSegura(linha) {
  const saida = {}
  for (const [coluna, valor] of Object.entries(linha ?? {})) {
    if (!NOME_COLUNA.test(coluna)) continue
    if (valor === null || typeof valor === 'number' || typeof valor === 'boolean') saida[coluna] = valor
    else if (typeof valor === 'string') saida[coluna] = texto(valor)
    // objetos, listas e funções são descartados
  }
  if (typeof saida.sigla === 'string') saida.sigla = textoPlotly(saida.sigla).trim() // sigla vira rótulo do eixo X
  return saida
}

function candidatosSeguros(mapa) {
  const saida = {}
  for (const [id, c] of Object.entries(mapa ?? {})) {
    if (!/^[a-z_]{1,20}$/.test(id) || typeof c !== 'object' || !c) continue
    saida[id] = {
      nome: textoPlotly(c.nome ?? id),
      cor: COR.test(c.cor ?? '') ? c.cor : 'grey',
      escala: ESCALAS.has(c.escala) ? c.escala : 'Greys',
    }
  }
  return saida
}

/** Duas pesquisas com a mesma sigla cairiam no mesmo ponto do eixo X (uma escondendo a outra). */
function siglasUnicas(rows) {
  const vistas = new Map()
  for (const r of rows) {
    if (typeof r.sigla !== 'string' || !r.sigla) continue
    const n = (vistas.get(r.sigla) ?? 0) + 1
    vistas.set(r.sigla, n)
    if (n > 1) r.sigla = `${r.sigla} (${n})`
  }
  return rows
}

function eleicaoSegura(e = {}) {
  const fotos = {}
  for (const [id, uri] of Object.entries(e.fotos ?? {})) if (imagemSegura(uri)) fotos[id] = uri
  const segmentos = {}
  for (const [id, rotulo] of Object.entries(e.segmentos ?? {})) if (/^[a-z_]{1,20}$/.test(id)) segmentos[id] = textoPlotly(rotulo)
  return {
    rows: siglasUnicas(Array.isArray(e.rows) ? e.rows.slice(0, 5000).map(linhaSegura) : []),
    candidatos: candidatosSeguros(e.candidatos),
    segmentos,
    fotos,
    agre: imagemSegura(e.agre),
    logo: imagemSegura(e.logo),
    origem: texto(e.origem),
    erro: e.erro ? true : undefined, // o detalhe do erro fica só no log do servidor
  }
}

const inteiro = (v, padrao) => (Number.isInteger(v) && v > 0 && v <= 365 ? v : padrao)

/** Devolve um payload limpo, ou lança erro se a estrutura básica não bater. */
export function validarPayload(bruto) {
  if (!bruto || typeof bruto !== 'object' || !bruto.e2022 || !bruto.e2026) throw new Error('payload inválido')
  return {
    config: {
      m_m: inteiro(bruto.config?.m_m, 7),
      m_m15: inteiro(bruto.config?.m_m15, 15),
      atualizacao: /^\d{2}\/\d{2}\/\d{4}$/.test(bruto.config?.atualizacao ?? '') ? bruto.config.atualizacao : '',
    },
    e2022: eleicaoSegura(bruto.e2022),
    e2026: eleicaoSegura(bruto.e2026),
  }
}

// Equivalentes em JS das operações que o app fazia com pandas.

/** True quando o valor é um número válido maior que 1 (mesmo filtro `df[col] > 1`). */
const valido = (v) => typeof v === 'number' && Number.isFinite(v) && v > 1

/** Pesquisas que coletaram o dado: devolve { x: siglas, y: valores, datas }. */
export function serie(rows, col) {
  const x = [], y = [], datas = []
  for (const r of rows) {
    if (valido(r[col])) {
      x.push(r.sigla)
      y.push(r[col])
      datas.push(r.data)
    }
  }
  return { x, y, datas }
}

export const temDados = (rows, col) => rows.some((r) => valido(r[col]))

export const contar = (rows, col, minimo = 1) =>
  rows.filter((r) => typeof r[col] === 'number' && r[col] >= minimo).length

/**
 * Média móvel — mesmo resultado de `Series.rolling(janela, min_periods).mean()`.
 * minPeriods = janela (padrão do pandas, usado em 2022) deixa os primeiros pontos vazios;
 * minPeriods = 1 (usado em 2026) calcula com o que houver enquanto o banco é pequeno.
 */
export function mediaMovel(valores, janela, minPeriods = janela) {
  const saida = []
  let soma = 0
  for (let i = 0; i < valores.length; i++) {
    soma += valores[i]
    if (i >= janela) soma -= valores[i - janela]
    const n = Math.min(i + 1, janela)
    saida.push(n >= minPeriods ? soma / n : null)
  }
  return saida
}

/** Última média móvel da coluna (ou null). */
export function ultimaMedia(rows, col, janela, minPeriods) {
  const { y } = serie(rows, col)
  if (!y.length) return null
  const m = mediaMovel(y, janela, minPeriods)
  return m[m.length - 1]
}

const numeros = (rows, col) => rows.map((r) => r[col]).filter((v) => typeof v === 'number' && Number.isFinite(v))
export const minimo = (rows, col) => { const n = numeros(rows, col); return n.length ? Math.trunc(Math.min(...n)) : '—' }
export const maximo = (rows, col) => { const n = numeros(rows, col); return n.length ? Math.trunc(Math.max(...n)) : '—' }

export const unicos = (lista) => [...new Set(lista)]

/** '2022-10-29T00:00:00.000' -> '29-10-2022' */
export function dataBR(iso, sep = '-') {
  if (!iso) return 's/d'
  const [a, m, d] = String(iso).slice(0, 10).split('-')
  return [d, m, a].join(sep)
}

export const ultimaData = (rows) => {
  const datas = rows.map((r) => r.data).filter(Boolean)
  return datas.length ? dataBR(datas[datas.length - 1]) : 's/d'
}

export const pct1 = (v) => (v == null ? '—' : `${(Math.round(v * 10) / 10).toLocaleString('pt-BR')}%`)

const NOMES_INSTITUTOS = {
  mda: 'MDA', fsb: 'FSB', idea: 'Idea Big Data', voxpopuli: 'Vox Populi', poderdata: 'Poder Data',
  prpesquisas: 'Paraná Pesquisas', ipec: 'Ipec', ipespe: 'Ipespe', datafolha: 'Datafolha',
  quaest: 'Quaest', futura: 'Futura', atlas: 'Atlas', atlasintel: 'AtlasIntel',
}
export const nomeInstituto = (id) =>
  NOMES_INSTITUTOS[id] ?? String(id).replace(/[<>&]/g, '').replace(/(^|\s)\S/g, (l) => l.toUpperCase())

/** Gera e baixa um CSV (UTF-8 com BOM, igual ao `utf-8-sig` do app original). */
export function baixarCSV(nomeArquivo, colunas, linhas) {
  const esc = (v) => {
    let s = v == null ? '' : String(v)
    // "CSV injection": célula de texto começando com = + - @ seria executada como fórmula no Excel
    if (typeof v === 'string' && /^[=+\-@\t\r]/.test(s)) s = `'${s}`
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [colunas.join(','), ...linhas.map((l) => colunas.map((c) => esc(l[c])).join(','))].join('\n')
  const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: nomeArquivo })
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

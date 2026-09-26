// Configuração das eleições de 2022 (equivale ao que estava espalhado pelo app original).
// A de 2026 NÃO fica aqui: continua no app.py (CAND_2026, SEG_2026) e chega via payload.

export const CAND_2022 = {
  lul:  { nome: 'Lula',       cor: 'rgba(215, 0, 0, 0.8)', corInstituto: 'rgba(215, 0, 0, 0.8)', escala: 'peach',  ay: 0 },
  bol:  { nome: 'Bolsonaro',  cor: 'skyblue',              corInstituto: 'royalblue',            escala: 'ice',    ay: 0 },
  ciro: { nome: 'Ciro Gomes', cor: 'seagreen',             corInstituto: 'green',                escala: 'Greens', ay: -14 },
}

// segmentos: rótulo do seletor, sufixo da coluna e texto usado nos títulos
export const SEG_2022 = {
  ger:  { rotulo: 'Geral',                 card: 'Geral',        titulo: '' },
  cat:  { rotulo: 'Católica',              card: 'Católicos',    titulo: 'de católicos',        plural: 'católicos' },
  ev:   { rotulo: 'Evangélica',            card: 'Evangélicos',  titulo: 'de evangélicos',      plural: 'evangélicos' },
  espi: { rotulo: 'Espírita',              card: 'Espíritas',    titulo: 'de espíritas',        plural: 'espíritas' },
  non:  { rotulo: 'Sem Religião',          card: 'Sem Religião', titulo: 'dos sem religião',    plural: 'sem religião' },
  out:  { rotulo: 'Outras Religiosidades', card: 'Outros',       titulo: 'de outras religiões', plural: 'outras religiões' },
}

// O que cada bloco exibe (mesmas opções dos selectbox / st.metric originais)
export const BLOCOS_2022 = {
  '1t': {
    candidatos: ['lul', 'bol', 'ciro'],
    resumoVoto: ['ger', 'cat', 'ev', 'espi', 'out', 'non'],
    religioesVoto: ['cat', 'ev', 'espi', 'non', 'out'],
    institutoVoto: ['cat', 'ev', 'espi', 'non', 'out'],
    resumoRejeicao: ['ger', 'cat', 'ev', 'out', 'non'],
    religioesRejeicao: ['cat', 'ev', 'espi', 'non', 'out'],
    institutoRejeicao: ['cat', 'ev', 'out', 'non'],
  },
  '2t': {
    candidatos: ['lul', 'bol'],
    resumoVoto: ['ger', 'cat', 'ev', 'espi', 'out', 'non'],
    religioesVoto: ['cat', 'ev', 'non', 'out'],
    institutoVoto: ['cat', 'ev', 'non', 'out'],
  },
}

// coluna de brancos/nulos de cada gráfico de intenção de voto
export const colBrancos = (seg, turno) =>
  seg === 'ger' ? `bra_nul_ns_nr_ger_${turno}` : `bra_nulo_${seg}_${turno}`

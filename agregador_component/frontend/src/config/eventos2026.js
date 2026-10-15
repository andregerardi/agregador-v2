// Marcos da campanha de 2026 anotados nos gráficos de média móvel.
//
// Como acrescentar um marco: copie um bloco de `anotacoes` (texto na altura y do eixo, em %)
// e/ou de `linhas` (linha vertical pontilhada) e ajuste. `x` é a sigla da pesquisa onde o marco
// fica ancorado, exatamente como está na coluna `sigla` da planilha (espaços nas pontas são ignorados).
// `arrow: false` = texto solto; `arrow: true` = seta, e ax/ay deslocam o texto em pixels.
// Em `linhas`, `ate` (em %) define até que altura a linha pontilhada sobe; sem `ate`, vai até o topo.
//
// Chaves: '*' vale para TODOS os gráficos de 2026; uma chave específica (ex.: 'ger_1t', 'ev_1t',
// 'ger_rej_1t', 'ger_2t') vale só para aquele gráfico e se soma à '*'.
// Depois de editar: npm run build (na pasta frontend) e subir a pasta build/.

export const EVENTOS_2026 = {
  '*': {
    anotacoes: [
      // Mendonça libera ao plenário análise de relatório com mensagens de Moraes e Vorcaro
      { x: 'set/26_poderdata_1', y: 52, text: 'Mendonça retira<br>sigilo de<br>relatório da PF', arrow: false, ax: 0, ay: 40 },
      // Independência / manifestações de 7 de setembro
      //{ x: 'set/26_quaest_1', y: 64, text: '7 de<br>setembro', arrow: false, ax: 0, ay: 40 },
      // Polêmica da Nosa Senhora Aparecida
      { x: 'set/26_poderdata_4', y: 60, text: 'Caso<br>Nossa<br>Senhora<br>Aparecida', arrow: false, ax: 0, ay: 40 },
      // Primeiro turno
      { x: 'out/26_mda_2', y: 62, text: '<b>Resultado<br>1º turno</b><br><br>Lula = 45,16%<br>Bolsonaro = 47,03%<br>Augusto Cury = 2,89%<br>', arrow: false, ax: 0, ay: 40 },
    ],
    linhas: [
      { x: 'set/26_poderdata_1', w: 0.5, ate: 52 },
      //{ x: 'set/26_quaest_1', w: 0.5, ate: 64 },
      { x: 'set/26_poderdata_4', w: 0.5, ate: 60 },
      // Primeiro turno
      { x: 'out/26_mda_2', w: 0.5, ate: 62 },
    ],
  },
  // exemplo de marco só no gráfico geral do 1º turno:
  // ger_1t: { anotacoes: [{ x: 'out/26_datafolha_1', y: 62, text: '1º Debate', arrow: false, ax: 0, ay: 0 }], linhas: [] },
}

/** Junta os marcos gerais ('*') com os do gráfico pedido. */
export const eventos2026 = (chave) => ({
  anotacoes: [...(EVENTOS_2026['*']?.anotacoes ?? []), ...(EVENTOS_2026[chave]?.anotacoes ?? [])],
  linhas: [...(EVENTOS_2026['*']?.linhas ?? []), ...(EVENTOS_2026[chave]?.linhas ?? [])],
})

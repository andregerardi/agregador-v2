import React, { useMemo, useState } from 'react'
import { Expander, Faixa } from '../components/ui.jsx'
import { baixarCSV, dataBR, maximo, minimo, nomeInstituto, unicos } from '../lib/stats.js'

const URL_SITE = 'https://cebrap.org.br/agregador-de-pesquisas-eleitorais-por-religiao/'

const LOGO_LAR = 'https://www.larunicamp.com.br/wp-content/uploads/2019/08/logo-lar-unicamp.png'

/** Logo do LAR no canto superior direito. Se a imagem não carregar, fica a sigla em texto. */
function LogoLar() {
  const [falhou, setFalhou] = useState(false)
  return (
    <a className="logo-lar" href="https://www.larunicamp.com.br" target="_blank" rel="noopener noreferrer" aria-label="Laboratório de Antropologia da Religião (LAR/Unicamp) — abre em nova aba">
      {falhou
        ? <span>LAR · Unicamp</span>
        : <img src={LOGO_LAR} alt="LAR — Laboratório de Antropologia da Religião, Unicamp" decoding="async" referrerPolicy="no-referrer" onError={() => setFalhou(true)} />}
    </a>
  )
}

export function Hero() {
  const texto = 'Agregador de Pesquisas Eleitorais por religião'
  return (
    <header className="hero">
      <LogoLar />
      <span className="kicker">Eleições Nacionais</span>
      <h1>Agregador de pesquisas eleitorais<br />por religião</h1>
      <p className="sub">
        Consolidação das pesquisas de intenção de voto e rejeição para as eleições presidenciais, com recorte por
        segmento religioso.
      </p>
      <div className="share">
        <span className="lbl">Compartilhe</span>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${URL_SITE}`} title="Facebook" rel="nofollow noopener noreferrer" target="_blank">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -5 42 42"><path d="M17.78 27.5V17.008h3.522l.527-4.09h-4.05v-2.61c0-1.182.33-1.99 2.023-1.99h2.166V4.66c-.375-.05-1.66-.16-3.155-.16-3.123 0-5.26 1.905-5.26 5.405v3.016h-3.53v4.09h3.53V27.5h4.223z" fill="#fff" /></svg>
        </a>
        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}&url=${URL_SITE}&hashtags=Agregador,religião,eleições,datascience`} title="Twitter" rel="nofollow noopener noreferrer" target="_blank">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 39 39"><path d="M28 8.557a9.913 9.913 0 0 1-2.828.775 4.93 4.93 0 0 0 2.166-2.725 9.738 9.738 0 0 1-3.13 1.194 4.92 4.92 0 0 0-3.593-1.55 4.924 4.924 0 0 0-4.794 6.049c-4.09-.21-7.72-2.17-10.15-5.15a4.942 4.942 0 0 0-.665 2.477c0 1.71.87 3.214 2.19 4.1a4.968 4.968 0 0 1-2.23-.616v.06c0 2.39 1.7 4.38 3.952 4.83-.414.115-.85.174-1.297.174-.318 0-.626-.03-.928-.086a4.935 4.935 0 0 0 4.6 3.42 9.893 9.893 0 0 1-6.114 2.107c-.398 0-.79-.023-1.175-.068a13.953 13.953 0 0 0 7.55 2.213c9.056 0 14.01-7.507 14.01-14.013 0-.213-.005-.426-.015-.637.96-.695 1.795-1.56 2.455-2.55z" fill="#fff" /></svg>
        </a>
        <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${texto} - ${URL_SITE}`)}`} title="WhatsApp" rel="nofollow noopener noreferrer" target="_blank">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -5 40 40"><path stroke="#fff" strokeWidth="2" fill="none" d="M 11.579798566743314 24.396926207859085 A 10 10 0 1 0 6.808479557110079 20.73576436351046" /><path d="M 7 19 l -1 6 l 6 -1" stroke="#fff" strokeWidth="2" fill="none" /><path d="M 10 10 q -1 8 8 11 c 5 -1 0 -6 -1 -3 q -4 -3 -5 -5 c 4 -2 -1 -5 -1 -4" fill="#fff" /></svg>
        </a>
      </div>
    </header>
  )
}

const COLUNAS_LISTA = ['nome_instituto', 'data', 'registro_tse', 'entrevistados', 'margem_erro', 'confiança', 'tipo_coleta']

/** Tabela das pesquisas utilizadas + download em CSV (o antigo st.dataframe + st.download_button). */
export function ListaPesquisas({ rows, arquivo }) {
  const colunas = COLUNAS_LISTA.filter((c) => rows.some((r) => c in r))
  const linhas = useMemo(
    () => rows.map((r) => Object.fromEntries(colunas.map((c) => [c, c === 'data' ? dataBR(r.data, '/') : r[c] ?? 0]))),
    [rows],
  )
  return (
    <>
      <div className="tabela-rolagem">
        <table className="tabela">
          <thead><tr>{colunas.map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {linhas.map((l, i) => (
              <tr key={i}>{colunas.map((c) => <td key={c}>{l[c]}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="botao" onClick={() => baixarCSV(arquivo, colunas, linhas)}>Baixe a lista em CSV</button>
      <p className="legenda"><i>Fontes</i>: TSE e Institutos de Pesquisa</p>
    </>
  )
}

export default function Info({ rows, rows2026 = [], mM, mM15 }) {
  const institutos = unicos([...rows, ...rows2026].map((r) => r.nome_instituto)).sort()
  const institutos2026 = unicos(rows2026.map((r) => r.nome_instituto)).sort()
  const nomes = (lista) => lista.map(nomeInstituto).join(', ')
  const faixa = (col) => <>{minimo(rows, col)}% e {maximo(rows, col)}%</>
  const faixa2026 = (col) => <>{minimo(rows2026, col)}% e {maximo(rows2026, col)}%</>

  return (
    <section className="info">
      <div className="coluna-central">
        <Faixa>Informações sobre o agregador:</Faixa>
      </div>

      <div className="duas-colunas coluna-central">
        <Expander titulo="Veja como citar o agregador">
          <p className="centro">
            GERARDI, Dirceu André; ALMEIDA, Ronaldo de; RUIZ, Ian; <b>Agregador de pesquisas eleitorais por religião</b>: consolidação
            de dados de pesquisas eleitorais com recorte religioso às eleições presidenciais de 2022 e 2026. APP versão 2.0. São
            Paulo, 2026. Disponível em: https://www.larunicamp.com.br. Acesso em: 00/00/0000.
          </p>
        </Expander>

        <Expander titulo="Sobre nós">
          <div className="sobre">
            <p className="verde">
              Laboratório de Antropologia da Religião (LAR/Unicamp)/<br />
              Projeto Temático FAPESP<br />"Religião como política: moralidades, ativismos e laicidades"<br /><br />
              Processo FAPESP: 2022/16673-3<br /><br />Laboratório de Antropologia da Religião (LAR/Unicamp)
            </p>
            <p className="cinza">Pesquisador Responsável:</p>
            <p>Ronaldo de Almeida<br />(Departamento de Antropologia/UNICAMP)<br /><a href="mailto:ronaldormalmeida@gmail.com">email</a></p>
            <p className="cinza">Pesquisador Associado:</p>
            <p>Dirceu André Gerardi<br />(MPGPP FGV/FGV PROJETOS)<br /><a href="mailto:andregerardi3@gmail.com">email</a></p>
            <p className="cinza">Apoio Técnico:</p>
            <p>Arthur Prates Domingos -(UNICAMP) - <a href="mailto:arthurpidomingos@gmail.com">email</a></p>
            <p>Ian Victor Rubini Ruiz - (Unicamp) - <a href="mailto:ianvrr@gmail.com">email</a></p>
            <p>Victor Ernesto Merete Castilho - (UNICAMP) - <a href="mailto:ernestomerete@gmail.com">email</a></p>
            <p>Yago Carvalho Rodrigues - (Consultoria) - <a href="mailto:yago.cr@hotmail.com">email</a></p>
          </div>
        </Expander>
      </div>
    </section>
  )
}

/**
 * "Sobre este banco": lista de pesquisas + estatísticas calculadas só com as linhas da eleição aberta.
 * prefixos = candidatos da eleição (ex.: ['lul','bol','ciro']); um recorte conta como coletado
 * quando ao menos um candidato tem o dado.
 */
export function SobreBanco({ rows, prefixos, ano, arquivo, children, mM = 7, mM15 = 15 }) {
  const nomes = (lista) => lista.map(nomeInstituto).join(', ') || '—'
  const institutos = unicos(rows.map((r) => r.nome_instituto)).sort()
  const porColeta = (tipo) => rows.filter((r) => String(r.tipo_coleta).trim().toLowerCase() === tipo)
  const n = (sufixo) => rows.filter((r) => prefixos.some((p) => typeof r[`${p}_${sufixo}`] === 'number' && r[`${p}_${sufixo}`] >= 1)).length
  const recortes = [['Católicos', 'cat'], ['Evangélicos', 'ev'], ['Espíritas', 'espi'], ['Umbanda/Candomblé', 'umb_can'], ['Outras religiosidades', 'out'], ['Sem religião', 'non'], ['Ateus', 'ateu']]
    .map(([rotulo, seg]) => [rotulo, n(`${seg}_1t`)])
    .filter(([, total]) => total > 0)
  const faixa = (col) => <>{minimo(rows, col)}% e {maximo(rows, col)}%</>

  const metodologiaConteudo = ano === '2022' ? (
    <div className="metodologia">
      <p className="centro"><b>Explicação:</b></p>
      <p>1. O banco de dados é atualizado constantemente com informações sobre a intenção de voto e a rejeição dos candidatos por religião.</p>
      <p>2. Os institutos de pesquisa consultados são: {nomes(institutos)};</p>
      <p>3. O agregador de pesquisas por religião compila os dados de levantamentos nacionais realizados pelos institutos. Para as eleições de 2022, os dados foram coletados a partir de janeiro;</p>
      <p>4. O agregador permite também a pesquisa por Instituto separadamente. Não nos responsabilizamos pelas amostras ou técnicas utilizadas pelos diversos institutos;</p>
      <p>5. Para a composição do banco de dados são consideradas apenas pesquisas nacionais, bem como informações dos candidatos no primeiro e no segundo turnos das eleições presidenciais.</p>
      <p>6. Devido à irregularidade na coleta e ao tamanho da amostra, dados referentes a segmentos demograficamente minoritários tal como candomblé/umbanda e outros apresentam margens de erro maiores, uma vez que a amostra destas religiões não é representativa do conjunto da população brasileira. Assim, quando possível, decidiu-se incluí-las na categoria "Outras religiosidades". Os institutos de pesquisa não divulgaram as intenções de voto da categoria espíritas no segundo das eleições, por esse motivo não há gráficos do segmento;</p>
      <p>7. Vale destacar que os dados censitários, principais referências para a construção da amostragem das pesquisas, estão defasados. Os valores de amostragem variam conforme os critérios próprios de cada instituto de pesquisa. Os institutos em 2022 utilizara dados o IBGE de 2010, da PNAD de 2021 e 2022 e do TSE. As informações de corte religioso nem sempre estão disponíveis nas pesquisas compartilhadas publicamente ou não constam nos documentos registrados no sistema <a href="https://www.tse.jus.br/eleicoes/pesquisa-eleitorais/consulta-as-pesquisas-registradas" target="_blank" rel="noreferrer">PesqEle</a> mantido pelo TSE, dado que não é obrigatório, segundo o artigo 33 da <a href="https://www.tse.jus.br/legislacao/codigo-eleitoral/lei-das-eleicoes/sumario-lei-das-eleicoes-lei-nb0-9.504-de-30-de-setembro-de-1997" target="_blank" rel="noreferrer">Lei nº 9.504/1997</a>. Para termos uma noção do universo amostrado pelos institutos: os <i>católicos</i> variaram entre {faixa('am_cat')} dos entrevistados; os <i>evangélicos</i>, entre {faixa('am_ev')}; os <i>espíritas</i>, entre {faixa('am_espi')}; o <i>candomblé/umbanda</i>, entre {faixa('am_umb_can')}; <i>"outras religiosidades"</i>, entre {faixa('am_out')}; os <i>sem religião</i>, entre {faixa('am_non')}; e <i>os ateus</i>, entre {faixa('am_ateu')}.</p>
      <p>8. Em relação às pesquisas, considerou-se a última data quando os entrevistadores colheram as respostas e não a data da divulgação, que por interesses diversos, podem ser adiadas por semanas;</p>
      <p>9. Partindo da data da última coleta das pesquisas, calculou-se a média móvel de diversas variáveis correspondendo a {mM} dias. Para o caso da rejeição geral utilizou-se a média móvel de {mM15} dias;</p>
      <p>10. Para obter a média móvel foram usados dados de uma série temporal e aplicado o seguinte código Python <code>rolling().mean()</code>. Uma explicação detalhada da utilização deste código pode ser <a href="https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.rolling.html" target="_blank" rel="noreferrer">vista aqui</a>;</p>
      <p>11. Ao calcular a média móvel de {mM} dias, por exemplo, os {mM} primeiros resultados são omitidos da série temporal e não aparecem nos gráficos. O objetivo principal da aplicação deste método é reduzir as oscilações no intuito de deixar as linhas dos gráficos mais fluídas. Existem algumas técnicas estatísticas que reduzem o ruído dos dados da série temporal, tais como <i>weighted moving average, kernel smoother</i>, entre outras;</p>
      <p>12. O resumo das médias móveis apresentado no primeiro e no segundo turnos considera e mostra o último valor da média obtida para cada candidato. O dado é atualizado automaticamente à medida que novas pesquisas são inseridas no banco de dados;</p>
      <p>13. Para deixar os gráficos limpos optou-se por não inserir a margem de erro na linha da média móvel. Nos recortes por religião a margem de erro nas eleições de 2022 variou entre 2% até 8,5%, de acordo com os institutos. Uma lista com as informações amostrais de cada pesquisa, por eleição, incluindo a margem de erro, pode ser obtida no item "pesquisas eleitorais utilizadas";</p>
      <p>14. As imagens dos candidatos utilizadas provêm das seguintes fontes: <a href="https://oglobo.globo.com/epoca/o-que-dizem-os-autores-dos-programas-dos-presidenciaveis-sobre-combate-as-mudancas-climaticas-23128520" target="_blank" rel="noreferrer">Ciro Gomes</a>, <a href="https://www.dw.com/pt-br/o-brasil-na-imprensa-alem%C3%A3-29-05/a-48968730/" target="_blank" rel="noreferrer">Lula</a>, <a href="https://www.poder360.com.br/poderdata/poderdata-lula-tem-50-contra-40-de-bolsonaro-no-2o-turno/" target="_blank" rel="noreferrer">Bolsonaro</a>.</p>
    </div>
  ) : ano === '2026' ? (
    <div className="metodologia">
      <p>1. O banco de dados é atualizado constantemente com informações sobre a intenção de voto e a rejeição dos candidatos por religião.</p>
      <p>2. Os institutos de pesquisa consultados são: {nomes(institutos)};</p>
      <p>3. O agregador de pesquisas por religião compila os dados de levantamentos nacionais em relação a duas variáveis eleitorais centrais: a intenção de voto e a rejeição à candidatura. Para as eleições de 2026, os dados foram coletados a partir de janeiro;</p>
      <p>4. O agregador permite também a pesquisa por Instituto separadamente. Não nos responsabilizamos pelas amostras ou técnicas utilizadas pelos diversos institutos;</p>
      <p>5. Para a composição do banco de dados são consideradas apenas pesquisas nacionais, bem como informações dos candidatos no primeiro e no segundo turnos das eleições presidenciais.</p>
      <p>6. Devido à irregularidade na coleta e ao tamanho da amostra, dados referentes a segmentos demograficamente minoritários tal como candomblé/umbanda e outros apresentam margens de erro maiores, uma vez que a amostra destas religiões não é representativa do conjunto da população brasileira. Assim, quando possível, decidiu-se incluí-las na categoria "Outras religiosidades". Os institutos de pesquisa não divulgaram as intenções de voto da categoria espíritas no segundo das eleições, por esse motivo não há gráficos do segmento;</p>
      <p>7. Os dados censitários utilizam informações do Censo 2022 (IBGE),da PNADc de 2025 e do TSE para a composição da amostra. Os valores de amostragem variam conforme os critérios próprios de cada instituto de pesquisa. As informações de corte religioso nem sempre estão disponíveis nas pesquisas compartilhadas publicamente ou não constam nos documentos registrados no sistema <a href="https://www.tse.jus.br/eleicoes/pesquisa-eleitorais/consulta-as-pesquisas-registradas" target="_blank" rel="noreferrer">PesqEle</a> mantido pelo TSE, dado que não é obrigatório, segundo o artigo 33 da <a href="https://www.tse.jus.br/legislacao/codigo-eleitoral/lei-das-eleicoes/sumario-lei-das-eleicoes-lei-nb0-9.504-de-30-de-setembro-de-1997" target="_blank" rel="noreferrer">Lei nº 9.504/1997</a>. Para termos uma noção do universo amostrado pelos institutos: os <i>católicos</i> variaram entre {faixa('am_cat')} dos entrevistados; os <i>evangélicos</i>, entre {faixa('am_ev')}; os <i>espíritas</i>, entre {faixa('am_espi')}; o <i>candomblé/umbanda</i>, entre {faixa('am_umb_can')}; <i>"outras religiosidades"</i>, entre {faixa('am_out')}; os <i>sem religião</i>, entre {faixa('am_non')}; e <i>os ateus</i>, entre {faixa('am_ateu')}.</p>
      <p>8. Em relação às pesquisas, considerou-se a última data quando os entrevistadores colheram as respostas e não a data da divulgação, que por interesses diversos, podem ser adiadas por semanas;</p>
      <p>9. Partindo da data da última coleta das pesquisas, calculou-se a média móvel de diversas variáveis correspondendo a dias variáveis. Para o caso da rejeição geral utilizou-se a média móvel de dias variáveis;</p>
      <p>10. Para obter a média móvel foram usados dados de uma série temporal e aplicado o seguinte código Python <code>rolling().mean()</code>. Uma explicação detalhada da utilização deste código pode ser <a href="https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.rolling.html" target="_blank" rel="noreferrer">vista aqui</a>;</p>
      <p>11. Ao calcular a média móvel, os primeiros resultados são omitidos da série temporal e não aparecem nos gráficos. O objetivo principal da aplicação deste método é reduzir as oscilações no intuito de deixar as linhas dos gráficos mais fluídas. Existem algumas técnicas estatísticas que reduzem o ruído dos dados da série temporal, tais como <i>weighted moving average, kernel smoother</i>, entre outras;</p>
      <p>12. O resumo das médias móveis apresentado no primeiro e no segundo turnos considera e mostra o último valor da média obtida para cada candidato. O dado é atualizado automaticamente à medida que novas pesquisas são inseridas no banco de dados;</p>
      <p>13. Para deixar os gráficos mais limpos optou-se por não inserir a margem de erro na linha da média móvel. Nos recortes por religião a margem de erro nas eleições de 2026 variou entre 2% até 8,5%, de acordo com os institutos. Uma lista com as informações amostrais de cada pesquisa, por eleição, incluindo a margem de erro, pode ser obtida no item "pesquisas eleitorais utilizadas";</p>
      <p>14. As imagens dos candidatos utilizadas provêm das seguintes fontes: <a href="https://www.dw.com/pt-br/o-brasil-na-imprensa-alem%C3%A3-29-05/a-48968730/" target="_blank" rel="noreferrer">Lula</a>, <a href="https://www.poder360.com.br/poder-eleicoes/flavio-bolsonaro-vai-aos-eua-e-aguarda-reuniao-com-trump/" target="_blank" rel="noreferrer">Flávio Bolsonaro</a>, <a href="https://www.sinjus.org.br/apos-aumentar-o-proprio-salario-em-300-zema-quer-congelar-salarios-dos-servidores-por-9-anos/" target="_blank" rel="noreferrer">Romeu Zema</a>, <a href="https://agenciauva.net/2026/09/06/toffoli-libera-campanha-de-renan-santos-dois-dias-apos-suspensao/" target="_blank" rel="noreferrer">Renan Dantas</a>, <a href="https://infograficos.oglobo.globo.com/politica/tem-que-ler-persona-ronaldo-caiado.html" target="_blank" rel="noreferrer">Ronaldo Caiado</a>, <a href="https://exame.com/brasil/quaest-com-10-no-1o-turno-de-quem-augusto-cury-roubou-votos/" target="_blank" rel="noreferrer">Augusto Cury</a>.</p>
    </div>
  ) : (
    <div className="metodologia">
      <p>Metodologia não disponível para este ano.</p>
    </div>
  )

  return (
    <section className="sobre-banco coluna-central" aria-label={`Sobre o banco de ${ano}`}>
      {children}
      <Expander titulo="Descubra aqui como o agregador foi construído">
        {metodologiaConteudo}
      </Expander>
      <Expander titulo={`Verifique as pesquisas eleitorais utilizadas (${ano})`}>
        <ListaPesquisas rows={rows} arquivo={arquivo} />
      </Expander>
      <Expander titulo={`Estatísticas do agregador (${ano})`}>
        <dl className="estatisticas grade">
          <div><dt>Abrangência das pesquisas</dt><dd>Nacional</dd></div>
          <div><dt>Total de pesquisas mapeadas</dt><dd className="forte">{rows.length}</dd></div>
          <div><dt>Institutos analisados</dt><dd>{nomes(institutos)}</dd></div>
          <div>
            <dt>Institutos por tipo de sondagem</dt>
            <dd><i>Telefone:</i> {nomes(unicos(porColeta('telefone').map((r) => r.nome_instituto)))}<br /><i>Presencial:</i> {nomes(unicos(porColeta('presencial').map((r) => r.nome_instituto)))}</dd>
          </div>
          <div><dt>Pesquisas segundo método de coleta</dt><dd>Telefone: {porColeta('telefone').length}<br />Presencial: {porColeta('presencial').length}</dd></div>
          <div><dt>Pesquisas com dados gerais</dt><dd className="forte">1º turno: {n('ger_1t')}<br />2º turno: {n('ger_2t')}</dd></div>
          <div><dt>Pesquisas com perguntas sobre religião</dt><dd className="forte">1º turno: {n('cat_1t')}<br />2º turno: {n('cat_2t')}</dd></div>
          <div>
            <dt>Pesquisas com amostra por religião (1º turno)</dt>
            <dd>{recortes.length ? recortes.map(([rotulo, total]) => <span key={rotulo}>{rotulo}: {total}<br /></span>) : '—'}</dd>
          </div>
        </dl>
      </Expander>
    </section>
  )
}

# Agregador de pesquisas eleitorais por religião — Streamlit + React

O site continua sendo um app Streamlit (mesmo `streamlit run app.py`, mesmo deploy, mesmas
planilhas e fotos na pasta). O que mudou é a interface: ela agora é um aplicativo React,
hospedado dentro do Streamlit como um *custom component*.

```
app.py                      moldura Streamlit (30 linhas): page_config + chama o componente
dados.py                    planilhas, cache, CAND_2026, SEG_2026, fotos, m_m  → payload JSON
exportar_payload.py         gera dados de teste para desenvolver o React sem o Streamlit
requirements.txt
agregador_component/
  __init__.py               declare_component (aponta para frontend/build)
  frontend/
    build/                  ← React já compilado (é isto que vai ao ar; precisa estar no git)
    src/
      main.jsx, streamlit.js   ponte com o Streamlit (recebe o payload, ajusta a altura do iframe)
      App.jsx                  hero, informações, escolha da eleição, rodapé
      pages/                   Info, Eleicao2022, Eleicao2026, blocos compartilhados
      components/              Expander, Caixa, Seletor, Pills, Metrica, Resumo, Grafico (Plotly)
      lib/stats.js             filtro > 1, média móvel (= pandas rolling), CSV
      lib/figuras.js           as duas funções que montam todos os gráficos
      config/eleicao2022.js    candidatos, religiões e o que cada bloco de 2022 exibe
      config/eventos2022.js    marcos da campanha anotados nos gráficos (Moro desiste, debate...)
      styles.css               o mesmo visual do premium_css
```

## Colocar no ar

1. Copie para esta pasta os arquivos que já ficavam ao lado do app:
   `resultados_pesquisas_lula_bolsonaro_religião.xlsx`, `agregador-pesquisas-eleitorais-2026-final.xlsx`,
   as fotos (`lula_perfil.jpg`, `bolso_image.jpeg`, `ciro_perfil.jpg`, `flavio_perfil.jpg`...) e
   `palacio-da-alvorada-interior-black-so-agregador-branco.jpg`.
2. `pip install -r requirements.txt`
3. `streamlit run app.py`

No Streamlit Cloud é só subir o repositório **incluindo `agregador_component/frontend/build/`**.
Não é preciso Node no servidor.

## Rotina de atualização

| Quero...                                   | Onde                                                        | Precisa recompilar? |
|--------------------------------------------|-------------------------------------------------------------|---------------------|
| incluir pesquisas novas                    | planilhas `.xlsx`                                           | não                 |
| trocar candidato/cor/foto de 2026          | `dados.py` (`CAND_2026`, `IMG_2026`)                        | não                 |
| mudar janela da média móvel                | `dados.py` (`m_m`, `m_m15`)                                 | não                 |
| excluir/incluir institutos                 | `dados.py`                                                  | não                 |
| mudar textos, layout, gráficos, anotações  | `agregador_component/frontend/src/`                         | sim                 |

Recompilar: `cd agregador_component/frontend && npm install && npm run build` (e commitar `build/`).

## Desenvolver o frontend

```
python exportar_payload.py                       # gera public/dev-payload.json com os dados reais
cd agregador_component/frontend && npm run dev   # http://localhost:3001, com recarga automática
```
Ou, dentro do Streamlit com recarga automática: `AGREGADOR_DEV=1 streamlit run app.py`
(com o `npm run dev` rodando em paralelo).

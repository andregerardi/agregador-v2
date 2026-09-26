# Segurança do agregador (v2.3.0)

O site é público e só de leitura: não tem login, formulário nem banco de dados que receba dados de
visitantes. Os riscos reais são (1) conteúdo malicioso entrar pelas planilhas/configuração e ser
executado no navegador dos visitantes, (2) vazamento de informação interna, (3) dependências
vulneráveis e (4) sequestro da conta/repositório. As medidas abaixo cobrem esses pontos.

## No navegador (frontend React)
| Medida | Onde | O que evita |
|---|---|---|
| Content-Security-Policy restritiva (sem script inline, sem `eval`, sem conexões externas) | `vite.config.js` → `build/index.html` | XSS, roubo de dados por script injetado |
| Validação de origem no `postMessage` | `src/streamlit.js` | página externa injetar dados falsos no site |
| Saneamento de todo o payload (tipos, tamanhos, cores, só `data:image/` em imagens, remoção de `<` `>`) | `src/lib/seguranca.js` | HTML/links maliciosos vindos da planilha virarem marcação nos gráficos |
| Neutralização de fórmulas no CSV (`=`, `+`, `-`, `@`) | `src/lib/stats.js` | "CSV injection" em quem abre o arquivo no Excel |
| Links externos com `rel="noopener noreferrer"`; logo externo com `referrerPolicy="no-referrer"` | componentes | `window.opener`, vazamento de referrer |
| Nenhum `dangerouslySetInnerHTML`, `eval` ou `innerHTML` | todo o `src/` | XSS |

## No servidor (Python/Streamlit)
| Medida | Onde | O que evita |
|---|---|---|
| Só as colunas usadas pelo site vão para o navegador | `dados.py` → `_colunas_publicas` | vazar anotações/contatos de colunas extras da planilha |
| Erros detalhados só no log; visitante vê mensagem genérica | `dados.py`, `.streamlit/config.toml` (`showErrorDetails=false`) | expor caminhos e versões do servidor |
| Planilha remota só por HTTPS de `docs.google.com` | `dados.py` → `_url_permitida` | servidor baixar arquivo de endereço arbitrário |
| XSRF e CORS ligados, arquivos estáticos desligados, upload mínimo | `.streamlit/config.toml` | CSRF, leitura das planilhas por URL |
| Faixas de versão nas dependências + Dependabot semanal | `requirements.txt`, `.github/dependabot.yml` | bibliotecas com falha conhecida |
| `secrets.toml`, `.env`, chaves fora do git | `.gitignore` | segredo publicado por engano |

## O que depende de você (não dá para resolver no código)
1. **Verificação em duas etapas (2FA)** no GitHub e na conta do Streamlit Cloud — quem controla o repositório controla o site.
2. No GitHub: *Settings → Code security* → ligar **Dependabot alerts**, **Secret scanning** e **Push protection**.
3. *Settings → Branches* → proteger o `main` (exigir Pull Request). Evita publicação acidental.
4. Se usar a planilha do Google (`URL_2026`): compartilhe como **leitor**, e só quem precisa edita.
5. Não escreva caminhos da sua máquina em `dados.py` (repositório público): use a variável de ambiente `AGREGADOR_DADOS`.
6. Ao aceitar um PR do Dependabot para o npm: `npm install && npm run build` e commitar `build/`.

## Limites conhecidos
- Cabeçalhos HTTP como HSTS e `frame-ancestors` são definidos pela hospedagem (Streamlit Cloud), não pelo app.
- O iframe do componente usa `allow-scripts` + `allow-same-origin` — é o padrão do Streamlit e não é configurável.
- Proteção contra negação de serviço (DDoS) é da plataforma de hospedagem.

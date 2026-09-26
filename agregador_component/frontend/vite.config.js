import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pacote from './package.json' with { type: 'json' }

// SEGURANÇA — Content-Security-Policy: o navegador só executa/carrega o que está nesta lista.
// Mesmo que alguém consiga injetar HTML na página, scripts de fora e envio de dados para fora são bloqueados.
// Para usar imagem/fonte de outro domínio, acrescente o domínio aqui e recompile.
const CSP = [
  "default-src 'none'",
  "script-src 'self'",                                        // só o JS do próprio build; nada inline, nada de eval
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // o Plotly e o React aplicam estilos inline
  "font-src https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://cebrap.org.br https://www.larunicamp.com.br",
  "connect-src 'self'",                                       // nenhum dado sai para terceiros
  "base-uri 'none'",
  "form-action 'none'",
  "object-src 'none'",
].join('; ')

const seguranca = {
  name: 'seguranca',
  apply: 'build', // em `npm run dev` o Vite precisa de scripts inline para a recarga automática
  transformIndexHtml: (html) =>
    html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="${CSP}" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />`),
}

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    seguranca,
    // grava build/versao.txt: o app.py lê esse arquivo para conferir se o build é o atual
    { name: 'versao', generateBundle() { this.emitFile({ type: 'asset', fileName: 'versao.txt', source: pacote.version }) } },
  ],
  // versão exibida no rodapé do site: serve para conferir qual build está no ar
  define: { __VERSAO__: JSON.stringify(pacote.version) },
  // './' é obrigatório: o Streamlit serve o componente a partir de um caminho interno
  // (/component/agregador_component.agregador/...), não da raiz do site.
  base: './',
  // public/ guarda só o dev-payload.json (dados de teste): não vai para o build
  publicDir: command === 'serve' ? 'public' : false,
  build: { outDir: 'build', chunkSizeWarningLimit: 2000 },
  server: { port: 3001 },
}))

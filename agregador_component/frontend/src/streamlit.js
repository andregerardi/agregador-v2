// Ponte mínima com o Streamlit (protocolo de "custom components").
// Evita a dependência streamlit-component-lib (e o apache-arrow que vem junto):
// como o Python envia apenas JSON, as três mensagens abaixo bastam.

const dentroDoStreamlit = window.parent !== window

// SEGURANÇA — o componente é servido pelo próprio Streamlit, logo a página-mãe tem a MESMA origem.
// Só aceitamos mensagens vindas dela e só enviamos mensagens para ela. Sem isso, qualquer página que
// conseguisse embutir este iframe poderia injetar um "payload" falso via postMessage.
// (em `npm run dev` o iframe roda em localhost:3001 e a mãe em localhost:8501: aí a origem é livre)
const ORIGEM_MAE = import.meta.env.DEV ? '*' : window.location.origin

function enviar(type, dados = {}) {
  window.parent.postMessage({ isStreamlitMessage: true, type, ...dados }, ORIGEM_MAE)
}

function mensagemConfiavel(evento) {
  if (evento.source !== window.parent) return false
  return ORIGEM_MAE === '*' || evento.origin === ORIGEM_MAE
}

export const Streamlit = {
  dentroDoStreamlit,

  /** Registra o callback que recebe os argumentos enviados pelo Python. */
  aoRenderizar(callback) {
    window.addEventListener('message', (evento) => {
      if (!mensagemConfiavel(evento)) return
      if (evento.data?.type === 'streamlit:render') callback(evento.data.args ?? {})
    })
    enviar('streamlit:componentReady', { apiVersion: 1 })
  },

  /** Ajusta a altura do iframe ao conteúdo. */
  ajustarAltura(altura) {
    enviar('streamlit:setFrameHeight', { height: Math.ceil(altura) })
  },

  /** Devolve um valor ao Python (retorno da função do componente). */
  enviarValor(valor) {
    enviar('streamlit:setComponentValue', { value: valor, dataType: 'json' })
  },
}

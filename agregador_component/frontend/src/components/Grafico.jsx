import React from 'react'
import Plotly from 'plotly.js-basic-dist-min'
import criarPlot from 'react-plotly.js/factory'

// O pacote "basic" do Plotly já inclui scatter (linhas e pontos) — tudo o que o site usa —
// e pesa ~1/3 do pacote completo.
const Plot = (criarPlot.default ?? criarPlot)(Plotly)

const CONFIG = {
  responsive: true,
  displaylogo: false,
  locale: 'pt-BR',
  modeBarButtonsToRemove: ['lasso2d', 'select2d'],
  toImageButtonOptions: { format: 'png', filename: 'agregador-religiao', scale: 2 },
}

/** Equivalente ao st.plotly_chart(fig, use_container_width=True) */
export default function Grafico({ figura }) {
  if (!figura) return null
  return (
    <div className="grafico">
      <Plot
        data={figura.data}
        layout={figura.layout}
        config={CONFIG}
        useResizeHandler
        style={{ width: '100%', height: figura.layout.height }}
      />
    </div>
  )
}

import React, { useState } from 'react'
import { Caixa, Metrica, Divisor } from './ui.jsx'
import { pct1, temDados, ultimaMedia } from '../lib/stats.js'

/**
 * Resumo por candidato: um checkbox por candidato que abre a foto + um card por segmento
 * com a última média móvel. Serve para 2022 e 2026, voto e rejeição.
 *
 * candidatos: [{ id, nome, foto }]
 * segmentos:  [{ id, rotulo }]
 * coluna:     (idCandidato, idSegmento) => nome da coluna
 */
export default function Resumo({ rows, candidatos, segmentos, coluna, janela, minPeriods, ocultarVazios = false }) {
  const [abertos, setAbertos] = useState({})

  return (
    <div>
      {candidatos.map((c) => {
        const cards = segmentos
          .map((s) => ({ ...s, col: coluna(c.id, s.id) }))
          .filter((s) => !ocultarVazios || temDados(rows, s.col))
        if (!cards.length) return null

        return (
          <div key={c.id}>
            <Caixa rotulo={c.nome} marcado={!!abertos[c.id]} aoMudar={(v) => setAbertos((a) => ({ ...a, [c.id]: v }))} />
            {abertos[c.id] && (
              <>
                <div className="resumo-linha">
                  {c.foto ? <img className="foto" src={c.foto} alt={c.nome} /> : <span className="foto foto-vazia">{c.nome}</span>}
                  <div className="resumo-cards">
                    {cards.map((s) => (
                      <Metrica key={s.id} rotulo={s.rotulo} valor={pct1(ultimaMedia(rows, s.col, janela, minPeriods))} />
                    ))}
                  </div>
                </div>
                <Divisor />
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

"""Componente Streamlit que hospeda o frontend React do agregador.

Uso:
    from agregador_component import agregador
    agregador(payload=dados)

O frontend já compilado fica em frontend/build e é servido pelo próprio Streamlit —
não é preciso Node no servidor (Streamlit Cloud incluso).

Desenvolvimento do frontend com recarga automática:
    cd agregador_component/frontend && npm install && npm run dev
    AGREGADOR_DEV=1 streamlit run app.py
"""
import os
from pathlib import Path

import streamlit.components.v1 as components

_DEV = os.environ.get("AGREGADOR_DEV") == "1"
_BUILD = Path(__file__).parent / "frontend" / "build"

if _DEV:
    _componente = components.declare_component("agregador", url="http://localhost:3001")
else:
    if not (_BUILD / "index.html").exists():
        raise RuntimeError(
            f"Frontend não compilado: {_BUILD} não existe. "
            "Rode 'npm install && npm run build' em agregador_component/frontend."
        )
    _componente = components.declare_component("agregador", path=str(_BUILD))


def agregador(payload: dict, key: str = "agregador"):
    """Renderiza o site. `payload` precisa ser serializável em JSON."""
    return _componente(payload=payload, key=key, default=None)

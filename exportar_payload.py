"""Gera frontend/public/dev-payload.json para desenvolver o React sem o Streamlit (npm run dev).

    python exportar_payload.py
"""
import json
from pathlib import Path

from dados import montar_payload

destino = Path(__file__).parent / 'agregador_component' / 'frontend' / 'public' / 'dev-payload.json'
destino.parent.mkdir(exist_ok=True)
destino.write_text(json.dumps(montar_payload.__wrapped__(), ensure_ascii=False), encoding='utf-8')
print('ok ->', destino)

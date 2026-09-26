########################################################################
## Agregador de pesquisas eleitorais por religião                     ##
## Streamlit (dados + hospedagem)  +  React (interface)               ##
########################################################################
import streamlit as st

st.set_page_config(
    page_title="Agregador de pesquisas eleitorais por religião",
    page_icon="chart_with_upwards_trend",
    layout="wide",
    initial_sidebar_state="collapsed",
    menu_items={
        'About': "##### Cientista de dados: Dirceu André Gerardi. \n **E-mail:** andregerardi3@gmail.com"
    },
)

import sys
from pathlib import Path
# Garante que o diretório atual (raiz do projeto) esteja no sys.path
# para que o `agregador_component` possa ser importado.
ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from agregador_component import agregador  # noqa: E402  (precisa vir depois do set_page_config)
from dados import montar_payload           # noqa: E402

## O Streamlit vira só a "moldura": some com menu/rodapé, zera as margens e usa o mesmo fundo
## do site, para o iframe do React ocupar a página inteira sem emendas visíveis.
st.markdown("""
<style>
#MainMenu, footer, header {visibility: hidden;}
.stApp {background: #F7F6F3;}
.block-container {padding: 0 !important; max-width: 100% !important;}
iframe[title="agregador_component.agregador"] {width: 100%; border: none; display: block;}
</style>
""", unsafe_allow_html=True)

agregador(payload=montar_payload())

"""
Wrapper para o Streamlit Cloud
Streamlit Cloud procura por streamlit_app.py por padrão
"""
import sys
from pathlib import Path

# Importa e executa o app.py
exec(open(Path(__file__).parent / 'app.py').read())

"""Carga dos bancos de dados e montagem do payload enviado ao frontend React.

Tudo o que é *dado* ou *configuração editável* continua aqui, em Python:
planilhas, institutos excluídos, candidatos de 2026, fotos, janelas da média móvel.
O React cuida só da apresentação (e do cálculo da média móvel no navegador).
"""
import base64
import datetime as dt
import io
import json
import logging
import os
import re
from pathlib import Path
from urllib.parse import urlparse

import pandas as pd
import streamlit as st
from PIL import Image

PASTA = Path(__file__).parent
log = logging.getLogger('agregador')

#################
## configurações#
#################

## MÉDIA MÓVEL 7 dias
m_m = 7
## MÉDIA MÓVEL 15 DIAS (EXCLUSIVO PARA O GRÁFICO DE REJEIÇÃO GERAL)
m_m15 = 15

ARQUIVO_2022 = 'resultados_pesquisas_lula_bolsonaro_religião.xlsx'
## retirei do banco as pesquisas da 'prpesquisas' em função dos questionamentos públicos quanto ao método
INSTITUTOS_2022 = ['fsb', 'futura', 'mda', 'voxpopuli', 'quaest', 'ipec', 'poderdata', 'datafolha', 'idea', 'ipespe']

## Possíveis locais onde os arquivos podem estar
LOCAIS_ALTERNATIVOS = [
    Path(__file__).parent,  # pasta do dados.py (agregador_component)
    Path(__file__).parent.parent,  # pasta acima (agregador)
    Path(__file__).parent.parent / 'agregador_component',  # agregador_component
    Path('X:\\base\\app-agregador-pesquisas-main\\app-agregador-pesquisas-main'),  # caminho direto dos dados históricos
]
## SEGURANÇA: prefira informar pastas extras pela variável de ambiente AGREGADOR_DADOS em vez de
## escrever caminhos da sua máquina aqui (o repositório é público). Ex.: set AGREGADOR_DADOS=X:\\base\\...
if os.environ.get('AGREGADOR_DADOS'):
    LOCAIS_ALTERNATIVOS.insert(0, Path(os.environ['AGREGADOR_DADOS']))

def _buscar_arquivo(nome: str) -> Path:
    """Procura o arquivo em múltiplas localizações. Retorna o primeiro Path encontrado."""
    for local in LOCAIS_ALTERNATIVOS:
        caminho = local / nome
        if caminho.exists():
            return caminho
    # Se não encontrou, retorna a primeira localização (deixa pandas gerar erro apropriado)
    return LOCAIS_ALTERNATIVOS[0] / nome

ARQUIVO_2026 = 'agregador-pesquisas-eleitorais-2026-final.xlsx'
## planilha do Google (opcional). Se preenchida, é lida primeiro; se falhar, usa o arquivo local.
URL_2026 = ''  # 'https://docs.google.com/spreadsheets/d/<ID>/export?format=xlsx'
INSTITUTOS_FORA_2026 = ['prpesquisas']

## candidatos de 2022. Para alterar nome exibido, cor da linha ou escala dos pontos, edite aqui.
## escalas disponíveis no frontend: peach, ice, Oranges, Greens, Purples, Greys
CAND_2022 = {
    'lul':    {'nome': 'Lula',              'cor': 'rgba(215, 0, 0, 0.8)', 'escala': 'peach'},
    'bol':    {'nome': 'Jair Bolsonaro',    'cor': 'royalblue',            'escala': 'ice'},
    'ciro':   {'nome': 'Ciro Gomes',        'cor': '#FFB233',              'escala': 'Greys'},
}

## candidatos de 2026. Para alterar nome exibido, cor da linha ou escala dos pontos, edite aqui.
## escalas disponíveis no frontend: peach, ice, Oranges, Greens, Purples, Greys
CAND_2026 = {
    'lul':    {'nome': 'Lula',                      'cor': 'rgba(215, 0, 0, 0.8)', 'escala': 'peach'},
    'bol':    {'nome': 'Flávio Bolsonaro',          'cor': 'royalblue',            'escala': 'ice'},
    'caiado': {'nome': 'Ronaldo Caiado',            'cor': '#FF6B35',              'escala': 'Oranges'},
    'cury':   {'nome': 'Augusto Cury',              'cor': '#FFA500',              'escala': 'Greys'},
    'zema':   {'nome': 'Romeu Zema',                'cor': 'seagreen',             'escala': 'Greens'},
    'renan':  {'nome': 'Renan Santos',              'cor': '#7B4FBF',              'escala': 'Purples'},
}

## segmentos religiosos (sufixos das colunas da planilha)
SEG_2026 = {
    'ger': 'Geral', 'cat': 'Católicos', 'ev': 'Evangélicos', 'espi': 'Espíritas',
    'umb_can': 'Umb./Cand.', 'out': 'Otras religiosidades', 'non': 'Sem religião', 'ateu': 'Ateus',
}

## imagens de perfil (opcionais): basta acrescentar o arquivo na pasta e mapear aqui
IMG_2022 = {'lul': 'lula_perfil.jpg', 'bol': 'bolso_image.jpeg', 'ciro': 'ciro_perfil.jpg'}
IMG_2026 = {'lul': 'lula_perfil.jpg', 'bol': 'flavio_perfil.jpg', 'caiado': 'caiado_perfil.jpg',
            'zema': 'zema_perfil.jpg', 'renan': 'renan_perfil.jpg', 'cury': 'cury_perfil.jpg'}
IMG_AGREGADOR = 'palacio-da-alvorada-interior-black-so-agregador-branco.jpg'
## logo do CEBRAP nos gráficos: se este arquivo existir na pasta, é usado; senão, o frontend
## busca o logo no site do CEBRAP (como no app original).
IMG_LOGO_CEBRAP = 'logo-cebrap.png'


#################
## segurança   ##
#################

def _url_permitida(url: str) -> bool:
    """A planilha remota só pode vir por HTTPS e do Google — evita que uma URL trocada por engano
    (ou de má-fé) faça o servidor baixar arquivos de um endereço qualquer."""
    u = urlparse(url)
    return u.scheme == 'https' and u.hostname in {'docs.google.com', 'drive.google.com'}


_META = {'nome_instituto', 'data', 'sigla', 'registro_tse', 'entrevistados', 'margem_erro', 'confiança', 'tipo_coleta'}


def _colunas_publicas(df: pd.DataFrame, candidatos: dict) -> pd.DataFrame:
    """Minimização de dados: TUDO o que vai no payload fica visível a qualquer visitante (basta abrir as
    ferramentas do navegador). Por isso só seguem as colunas que o site usa; anotações, contatos,
    links internos ou qualquer coluna extra da planilha ficam no servidor."""
    cands = '|'.join(map(re.escape, candidatos))
    segs = '|'.join(map(re.escape, SEG_2026))
    padrao = re.compile(rf'^(?:(?:{cands})_(?:{segs})(?:_rej)?_[12]t|bra_\w+_[12]t|am_\w+)$')
    manter = [c for c in df.columns if str(c) in _META or padrao.match(str(c))]
    return df[manter]


#####################
## carga dos bancos##
#####################

@st.cache_data(persist=True)
def load_dados():
    arquivo = _buscar_arquivo(ARQUIVO_2022)
    banco = pd.read_excel(arquivo)
    df = banco[banco['nome_instituto'].isin(INSTITUTOS_2022)]
    return df.reset_index(drop=True)


@st.cache_data(ttl=600, show_spinner='Carregando os dados das eleições de 2026...')
def load_dados_2026():
    """Carrega o banco de 2026 (Google Sheets, se configurado, com fallback para o arquivo local)."""
    banco, origem = None, 'arquivo local'
    if URL_2026 and not _url_permitida(URL_2026):
        log.warning('URL_2026 ignorada: só são aceitas URLs https de docs.google.com')
    elif URL_2026:
        try:
            banco, origem = pd.read_excel(URL_2026), 'planilha do Google'
        except Exception:
            banco = None
    if banco is None:
        arquivo = _buscar_arquivo(ARQUIVO_2026)
        banco = pd.read_excel(arquivo)

    banco.columns = [str(c).strip() for c in banco.columns]
    if 'nome_instituto' in banco.columns:
        banco['nome_instituto'] = banco['nome_instituto'].astype(str).str.strip().str.lower()
        banco = banco[~banco['nome_instituto'].isin(INSTITUTOS_FORA_2026)]
    if 'data' in banco.columns:
        banco['data'] = pd.to_datetime(banco['data'], errors='coerce')
        banco = banco.sort_values('data')
    return banco.reset_index(drop=True), origem


##########################
## conversões para JSON ##
##########################

def _registros(df: pd.DataFrame) -> list:
    """DataFrame -> lista de dicts JSON (NaN vira null, datas viram ISO)."""
    df = df.copy()
    df.columns = [str(c) for c in df.columns]
    return json.loads(df.to_json(orient='records', date_format='iso', force_ascii=False))


def _imagem(nome: str, lado: int = 240, png: bool = False):
    """Arquivo de imagem -> data URI (redimensionado, para o payload ficar leve). None se não existir."""
    try:
        # Procura a imagem em múltiplos locais
        caminho_img = _buscar_arquivo(nome)
        img = Image.open(caminho_img).convert('RGBA' if png else 'RGB')
    except Exception:
        return None
    img.thumbnail((lado, lado))
    buf = io.BytesIO()
    img.save(buf, format='PNG' if png else 'JPEG', **({} if png else {'quality': 85}))
    tipo = 'png' if png else 'jpeg'
    return f'data:image/{tipo};base64,' + base64.b64encode(buf.getvalue()).decode()


def _fotos(mapa: dict) -> dict:
    return {k: uri for k, v in mapa.items() if (uri := _imagem(v))}


@st.cache_data(ttl=600, show_spinner='Preparando o site...')
def montar_payload() -> dict:
    agre = _imagem(IMG_AGREGADOR, lado=400)
    logo = _imagem(IMG_LOGO_CEBRAP, lado=400, png=True)

    e2022 = {'rows': _registros(_colunas_publicas(load_dados(), CAND_2022)), 'fotos': _fotos(IMG_2022), 'agre': agre, 'logo': logo}
    e2022.update({'candidatos': CAND_2022, 'segmentos': SEG_2026})

    try:
        df26, origem = load_dados_2026()
        e2026 = {'rows': _registros(_colunas_publicas(df26, CAND_2026)), 'origem': origem}
    except Exception:  # o site de 2022 continua no ar mesmo sem a planilha de 2026
        log.exception('Falha ao carregar o banco de 2026')  # o detalhe (caminhos etc.) fica só no log do servidor
        e2026 = {'rows': [], 'origem': None, 'erro': True}
    e2026.update({'candidatos': CAND_2026, 'segmentos': SEG_2026, 'fotos': _fotos(IMG_2026), 'agre': agre, 'logo': logo})

    return {
        'config': {'m_m': m_m, 'm_m15': m_m15, 'atualizacao': dt.datetime.today().strftime('%d/%m/%Y')},
        'e2022': e2022,
        'e2026': e2026,
    }

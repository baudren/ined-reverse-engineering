import pandas as pd
import requests
import streamlit as st

source = "https://www.ined.fr/fr/tout-savoir-population/jeux/population-demain/"
backend = "https://www.ined.fr/_modules/SimulateurPopulation/query.php"


def get_zones():
    response = requests.get(backend, params={"query": "getZones", "params": "{}"})
    return pd.DataFrame.from_records(response.json())[["pays_id", "pays_nom_fr"]]

def get_countries():
    response = requests.get(backend, params={"query": "getPays_fr", "params": "{}"})
    return pd.DataFrame.from_records(response.json())[["pays_id", "pays_nom_fr"]]

def get_data(id):
    response = requests.get(backend, params={"query": "getDataForZoneSim", "params": f'{{"id": "{id}"}}'})
    print(response.url)
    return pd.DataFrame.from_records(response.json())

st.header("INED")

with st.form("zone_dl"):
    st.write("Charger les données d'origine")
    submitted = st.form_submit_button("Go")
    if submitted:
        zones, countries = get_zones(), get_countries()
        # for now hardcoding France (Métropolitaine) id
        data = get_data(250)
        st.dataframe(pd.merge(data, countries, how='inner', left_on='fk_pays_id', right_on='pays_id'))

with st.sidebar:
    expectancy = st.slider("Espérance de vie", 15, 90, 75)
    fecundity = st.slider("Nbre d'enfant par femme", 0.0, 14.0, 2.0, step=0.05)
    ratio = st.slider("Garcons/Filles", 0.0, 100.0, 52.0, step=0.1)

# use plotly https://plotly.com/python/v3/population-pyramid-charts/ to display
# simulate until 2100
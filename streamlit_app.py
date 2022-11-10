import pandas as pd
import streamlit as st
from backend import get_zones, get_countries, get_data

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
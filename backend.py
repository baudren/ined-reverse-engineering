import requests
import pandas as pd


source = "https://www.ined.fr/fr/tout-savoir-population/jeux/population-demain/"
backend = "https://www.ined.fr/_modules/SimulateurPopulation/query.php"


def get_zones():
    response = requests.get(backend, params={"query": "getZones", "params": "{}"})
    return pd.DataFrame.from_records(response.json())[["pays_id", "pays_nom_fr"]]


def get_countries():
    response = requests.get(backend, params={"query": "getPays_fr", "params": "{}"})
    return pd.DataFrame.from_records(response.json())[["pays_id", "pays_nom_fr"]]


def get_data(id: int):
    response = requests.get(backend, params={"query": "getDataForZoneSim", "params": f'{{"id": "{id}"}}'})
    return pd.DataFrame.from_records(response.json())

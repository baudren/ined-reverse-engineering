import math
import pandas as pd
import numpy as np

from backend import get_data

# Load data for computation
# access it with a0.loc[age, "value"]
a0 = pd.read_csv('data/a0.csv')
a1 = pd.read_csv('data/a1.csv')
proba_babies = pd.read_csv('data/proba_babies.csv')


class Simulation:

    year: int
    life_expectancy: int
    fecundity: float
    ratio: float

    data: pd.DataFrame  # total history of the simulation, to output in csv format
    male: pd.DataFrame  # male population for the current year of the simulation
    female: pd.DataFrame # female population for the current year of the simulation

    def __init__(self, life_expectancy, fecundity, ratio, year=2022):
        self.year = year
        self.life_expectancy = life_expectancy
        self.fecundity = fecundity
        self.ratio = ratio
        self.load_initial_data()

    def load_initial_data(self):
        # from query.php initially, then official data
        raw = get_data(250)  # hardcoding France
        raw = raw.loc[raw["popu_annee"] == self.year]  # Only getting the starting year

        # Extract relevant parts of the data
        columns = [f"popu_age{age}" for age in range(0, 101)]
        male = raw.loc[raw["popu_sexe"] == "Male", columns]
        female = raw.loc[raw["popu_sexe"] == "Female", columns]

        # Rename columns for simpler display
        rename_mapping = {f"popu_age{age}": age for age in range(0, 101)}
        male.rename(columns=rename_mapping, inplace=True)
        female.rename(columns=rename_mapping, inplace=True)

    def start_simulation(self):
        while self.year <= 2100:
            self.year += 1


def compute_babies_for_women_at_age(age, nbr_of_women, fecondity_param):
    babies = nbr_of_women * math.pow(proba_babies.loc[age, "value"], 100.0/fecondity_param) * fecondity_param / 128.0
    return babies if babies >= 0 else 0


def compute_women_for_age(age):
    pass


def compute_men_for_age(age):
    pass


if __name__ == "__main__":
    simulation = Simulation(80, 1.2, 52.1)
    simulation.start_simulation()

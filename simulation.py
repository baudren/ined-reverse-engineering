import math
import pandas as pd

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
    data: pd.DataFrame

    def __init__(self, life_expectancy, fecundity, ratio, year=2022):
        self.year = year
        self.life_expectancy = life_expectancy
        self.fecundity = fecundity
        self.ratio = ratio
        self.load_initial_data()

    def load_initial_data(self):
        # from query.php initially, then official data
        self.data = pd.DataFrame()

    def start_simulation(self):
        while self.year <= 2100:
            self.year += 1


def compute_babies_for_women_at_age(age, nbr_of_women, fecondity_param):
    babies = nbr_of_women * math.pow(proba_babies.loc[age, "proba"], 100.0/fecondity_param) * fecondity_param / 128.0
    return babies if babies >= 0 else 0


def compute_women_for_age(age):
    pass


def compute_men_for_age(age):
    pass


if __name__ == "__main__":
    print(compute_babies_for_women_at_age(15, 100_000, 1.8))
    print(a0.loc[0, "value"])
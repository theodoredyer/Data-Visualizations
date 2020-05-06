import pandas as pd 
import numpy as np

# inputs
csv_name = 'EPCSmallMillionBTU.csv'
index_col_name = 'Country'

columns_of_interest = ('L2, L3, L4, L5, L6, L7, L8, L9, L10')

# Read input file, set the index
df = pd.read_csv('EPCSmallMillionBTU.csv', index_col=index_col_name)

# Transpose the columns to rows
df = df.transpose()

# Unamed column fix
df.reset_index(inplace=True)
df.rename(columns={'index': 'Year'}, inplace=True)
df.set_index('Year', inplace=True)

print(columns_of_interest)
# columns_of_interest = columns_of_interest.split(',')
df = df[columns_of_interest].copy()

df.to_csv('out.csv', index=True)
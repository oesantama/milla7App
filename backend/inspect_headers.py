import pandas as pd
import os

base_path = os.path.abspath(os.path.join(os.getcwd(), '../..'))
xls_path = os.path.join(base_path, 'plan normal.xls')
csv_path = os.path.join(base_path, 'plan R.csv')

print(f"Buscando archivos en: {base_path}")

def inspect_xls():
    if not os.path.exists(xls_path):
        print(f"No encontrado: {xls_path}")
        return

    try:
        # Leer fila de encabezados (fila 2, indice 1)
        df = pd.read_excel(xls_path, header=1) 
        columns = df.columns.tolist()
        
        # Columnas de interes segun usuario (Indices 0-based: A=0, B=1, ... AK=36)
        # A, B, D, F, H, I, J, R, S, AC, AJ
        indices = [0, 1, 3, 5, 7, 8, 9, 17, 18, 28, 35]
        
        print("\n--- Plan Normal (.xls) ---")
        print(f"Total Columnas: {len(columns)}")
        for i in indices:
            if i < len(columns):
                print(f"Columna {chr(65+i) if i<26 else '??'} ({i}): {columns[i]}")
            else:
                print(f"Indice {i} fuera de rango")
    except Exception as e:
        print(f"Error leyendo xls: {e}")

def inspect_csv():
    if not os.path.exists(csv_path):
        print(f"No encontrado: {csv_path}")
        return

    try:
        # Asumimos header en primera fila para CSV
        df = pd.read_csv(csv_path, sep=None, engine='python')
        print("\n--- Plan R (.csv) ---")
        print("Columnas encontradas:")
        for col in df.columns:
            print(f"- {col}")
    except Exception as e:
        print(f"Error leyendo csv: {e}")

inspect_xls()
inspect_csv()

"""
Script auxiliar para crear un archivo Excel de ejemplo
"""
import pandas as pd

# Datos de ejemplo
data = {
    'first_lastname': ['Franco Lavayen', 'Maria Garcia', 'Juan Perez', 'Ana Rodriguez', 'Carlos Martinez'],
    'nickname': ['Fran', 'Mary', 'Juancho', 'Anita', 'Carlitos'],
    'guest_from': ['husband', 'wife', 'husband', 'wife', 'husband'],
    'cost_per_person': [150.00, 150.00, 100.00, 120.00, 100.00],
    'guest_code': ['FL-0000000002', 'MG-0000000003', 'JP-0000000004', 'AR-0000000005', 'CM-0000000006'],
    'confirmed': [False, True, False, True, False],
    'num_companions': [2, 1, 0, 2, 1],
    'notes': ['Amigo cercano', 'Familia', 'Compañero trabajo', 'Prima', 'Vecino']
}

# Crear DataFrame
df = pd.DataFrame(data)

# Guardar como Excel
output_file = 'invitados_ejemplo.xlsx'
df.to_excel(output_file, index=False, engine='openpyxl')

print(f"✅ Archivo '{output_file}' creado exitosamente")
print(f"📊 Total de registros: {len(df)}")
print("\nColumnas:")
for col in df.columns:
    print(f"  - {col}")
print("\n⚠️  NOTA: La columna 'guest_code' es OBLIGATORIA")
print("   Usa la fórmula: =UPPER(LEFT(A2,1)&MID(A2,2,1))&\"-\"&TEXT(ROW(),\"0000000000\")")
print("   Luego copia y pega como valores para fijar los códigos")

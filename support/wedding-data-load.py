"""
Script para cargar invitados desde Excel a Supabase PostgreSQL
Características:
- Carga modular y basada en clases
- Genera guest_code único para cada invitado
- Permite sobrescribir datos existentes
- Manejo de errores robusto
"""

import os
import pandas as pd
from supabase import create_client, Client
from typing import List, Dict, Optional
import hashlib
from datetime import datetime
import re
from dotenv import load_dotenv


class SupabaseGuestLoader:
    """Clase principal para cargar invitados a Supabase"""
    
    def __init__(self, supabase_url: str, supabase_key: str):
        """
        Inicializa la conexión con Supabase
        
        Args:
            supabase_url: URL de tu proyecto Supabase
            supabase_key: API Key de Supabase (service_role para operaciones admin)
        """
        self.client: Client = create_client(supabase_url, supabase_key)
        self.table_name = os.getenv('GUESTS_TABLE_NAME')
        
    def validate_guest_data(self, guest: Dict) -> bool:
        """
        Valida que los datos del invitado sean correctos
        
        Args:
            guest: Diccionario con datos del invitado
            
        Returns:
            True si los datos son válidos, False en caso contrario
        """
        required_fields = ['first_lastname', 'nickname', 'guest_from', 'guest_code']
        
        for field in required_fields:
            if field not in guest or not guest[field] or pd.isna(guest[field]):
                print(f"⚠️  Warning: Falta el campo requerido '{field}' en: {guest}")
                return False
                
        # Validar guest_from
        if 'guest_from' in guest and guest['guest_from'] not in ['wife', 'husband', None]:
            print(f"⚠️  Warning: guest_from debe ser 'wife' o 'husband', encontrado: {guest['guest_from']}")
            return False
            
        return True
    
    def prepare_guest_data(self, row: pd.Series, index: int) -> Dict:
        """
        Prepara los datos de un invitado desde una fila de Excel
        
        Args:
            row: Fila del DataFrame de pandas
            index: Índice de la fila
            
        Returns:
            Diccionario con los datos preparados
        """
        # Obtener guest_code del Excel (campo requerido)
        guest_code = str(row['guest_code']).strip()
        first_name = str(row['first_lastname']).strip().split(' ')[0]
        last_name = str(row['first_lastname']).strip().split(' ')[1] if len(str(row['first_lastname']).strip().split(' ')) > 1 else ''

        # Preparar datos
        guest_data = {
            'first_name': first_name,
            'last_name': last_name,
            'nickname': str(row['nickname']).strip(),
            'guest_from': str(row['guest_from']).strip(),
            'cost_per_person': str(row['cost_per_person']).strip(),
            'guest_code': guest_code,
        }
        
        # Campos opcionales
        optional_fields = {
            'confirmed': 'confirmed',
            'num_companions': 'num_companions',
            'notes': 'notes'
        }
        
        for excel_col, db_col in optional_fields.items():
            if excel_col in row.index and not pd.isna(row[excel_col]):
                value = row[excel_col]
                
                # Conversión de tipos
                if db_col == 'confirmed':
                    guest_data[db_col] = bool(value)
                elif db_col in ['num_companions']:
                    guest_data[db_col] = int(value)
                elif db_col == 'cost_per_person':
                    guest_data[db_col] = float(value)
        
        return guest_data
    
    def check_existing_guest(self, guest_code: str) -> Optional[Dict]:
        """
        Verifica si un invitado ya existe en la base de datos por guest_code
        
        Args:
            guest_code: Código único del invitado
            
        Returns:
            Datos del invitado existente o None
        """
        try:
            response = self.client.table(self.table_name)\
                .select("*")\
                .eq('guest_code', guest_code)\
                .execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            print(f"❌ Error verificando invitado existente: {e}")
            return None
    
    def upsert_guest(self, guest_data: Dict, overwrite: bool = True) -> bool:
        """
        Inserta o actualiza un invitado en la base de datos
        
        Args:
            guest_data: Datos del invitado
            overwrite: Si True, actualiza datos existentes
            
        Returns:
            True si la operación fue exitosa
        """
        try:
            # Verificar si existe por guest_code
            existing = self.check_existing_guest(guest_data['guest_code'])
            
            if existing:
                if overwrite:
                    # Actualizar datos existentes (mantiene el guest_code)
                    update_data = {**guest_data}
                    update_data['updated_at'] = datetime.now().isoformat()
                    
                    response = self.client.table(self.table_name)\
                        .update(update_data)\
                        .eq('id', existing['id'])\
                        .execute()
                    
                    print(f"✅ Actualizado: {guest_data['first_name']} {guest_data['last_name']} (Code: {guest_data['guest_code']})")
                    return True
                else:
                    print(f"⏭️  Saltado (ya existe): {guest_data['first_name']} {guest_data['last_name']} (Code: {guest_data['guest_code']})")
                    return False
            else:
                # Insertar nuevo
                response = self.client.table(self.table_name)\
                    .insert(guest_data)\
                    .execute()
                
                print(f"✅ Insertado: {guest_data['first_name']} {guest_data['last_name']} (Code: {guest_data['guest_code']})")
                return True
                
        except Exception as e:
            print(f"❌ Error con {guest_data.get('first_name', 'desconocido')} {guest_data['last_name']} (Code: {guest_data.get('guest_code', 'N/A')}): {e}")
            return False
    
    def load_from_excel(self, excel_path: str, overwrite: bool = True) -> Dict[str, int]:
        """
        Carga todos los invitados desde un archivo Excel
        
        Args:
            excel_path: Ruta al archivo Excel
            overwrite: Si True, sobrescribe datos existentes
            
        Returns:
            Diccionario con estadísticas de la carga
        """
        print(f"\n{'='*60}")
        print(f"🎉 CARGANDO INVITADOS A SUPABASE")
        print(f"{'='*60}\n")
        print(f"📂 Archivo: {excel_path}")
        print(f"🔄 Sobrescribir: {'Sí' if overwrite else 'No'}\n")
        
        # Leer Excel
        try:
            df = pd.read_excel(excel_path)
            print(f"📊 Total de registros en Excel: {len(df)}\n")
        except Exception as e:
            print(f"❌ Error leyendo archivo Excel: {e}")
            return {'success': 0, 'failed': 0, 'skipped': 0}
        
        # Estadísticas
        stats = {
            'success': 0,
            'failed': 0,
            'skipped': 0
        }
        
        # Procesar cada fila
        for index, row in df.iterrows():
            # Validar datos
            if not self.validate_guest_data(row.to_dict()):
                stats['failed'] += 1
                continue
            
            # Preparar datos
            guest_data = self.prepare_guest_data(row, index)
            
            # Cargar a Supabase
            success = self.upsert_guest(guest_data, overwrite)
            
            if success:
                stats['success'] += 1
            else:
                if overwrite:
                    stats['failed'] += 1
                else:
                    stats['skipped'] += 1
        
        # Resumen
        print(f"\n{'='*60}")
        print(f"📈 RESUMEN DE CARGA")
        print(f"{'='*60}")
        print(f"✅ Exitosos: {stats['success']}")
        print(f"❌ Fallidos: {stats['failed']}")
        print(f"⏭️  Saltados: {stats['skipped']}")
        print(f"{'='*60}\n")
        
        return stats
    
    def delete_all_guests(self) -> bool:
        """
        CUIDADO: Elimina todos los invitados de la base de datos
        Usar solo para testing o reseteo completo
        
        Returns:
            True si la operación fue exitosa
        """
        try:
            response = self.client.table(self.table_name)\
                .delete()\
                .neq('id', '00000000-0000-0000-0000-000000000000')\
                .execute()
            
            print("🗑️  Todos los invitados han sido eliminados")
            return True
        except Exception as e:
            print(f"❌ Error eliminando invitados: {e}")
            return False


def main():
    """Función principal de ejemplo"""
    
    # Cargar variables de entorno
    load_dotenv()
    
    # Configuración
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')  # Usar service_role para operaciones admin
    EXCEL_FILE = 'wedding-guests.xlsx'  # Cambiar por tu archivo
    
    # Validar configuración
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Error: Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env")
        return
    
    if not os.path.exists(EXCEL_FILE):
        print(f"❌ Error: No se encuentra el archivo {EXCEL_FILE}")
        print("\n📋 Ejemplo de estructura del Excel:")
        print("   first_lastname | nickname | guest_from | cost_per_person | guest_code     | confirmed | num_companions | notes")
        print("   Franco Lavayen | Fran     | husband    | 150.00          | FL-0000000001  | False     | 2              | VIP")
        print("\n⚠️  IMPORTANTE: La columna 'guest_code' es OBLIGATORIA y debe ser única")
        return
    
    # Crear loader
    loader = SupabaseGuestLoader(SUPABASE_URL, SUPABASE_KEY)
    
    # Opción 1: Cargar con sobrescritura (recomendado para actualizaciones)
    stats = loader.load_from_excel(EXCEL_FILE, overwrite=True)
    
    # Opción 2: Cargar solo nuevos (sin sobrescribir existentes)
    # stats = loader.load_from_excel(EXCEL_FILE, overwrite=False)
    
    # Opción 3: Reseteo completo (¡CUIDADO! - descomentar solo si estás seguro)
    # loader.delete_all_guests()
    # stats = loader.load_from_excel(EXCEL_FILE, overwrite=True)


if __name__ == "__main__":
    main()

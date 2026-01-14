import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'milla7.settings')
django.setup()

def list_tables():
    with connection.cursor() as cursor:
        # Get all tables in public schema
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        
        print(f"--- DATABASE SCHEMA REPORT ({len(tables)} Tables Found) ---")
        
        for (table_name,) in tables:
            print(f"\n[TABLE] {table_name}")
            cursor.execute(f"""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = '{table_name}' 
                ORDER BY ordinal_position;
            """)
            columns = cursor.fetchall()
            for col_name, data_type, is_nullable in columns:
                null_str = "NULL" if is_nullable == 'YES' else "NOT NULL"
                print(f"  - {col_name} ({data_type}, {null_str})")

if __name__ == '__main__':
    list_tables()

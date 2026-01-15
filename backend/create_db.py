"""
Script për të krijuar database në PostgreSQL
"""
import psycopg2
from psycopg2 import sql

# Të dhënat e lidhjes
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': input("Shkruaj password-in për PostgreSQL user 'postgres': "),
    'database': 'postgres'  # Lidhemi në postgres për të krijuar database të ri
}

try:
    # Lidhemi në PostgreSQL
    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = True
    cursor = conn.cursor()
    
    # Krijo database nëse nuk ekziston
    cursor.execute(
        sql.SQL("SELECT 1 FROM pg_database WHERE datname = %s"),
        ['fitness_tracker']
    )
    
    if cursor.fetchone():
        print("Database 'fitness_tracker' ekziston tashmë!")
    else:
        cursor.execute(
            sql.SQL("CREATE DATABASE {}").format(
                sql.Identifier('fitness_tracker')
            )
        )
        print("Database 'fitness_tracker' u krijua me sukses!")
    
    cursor.close()
    conn.close()
    
except psycopg2.Error as e:
    print(f"Gabim: {e}")
    print("\nSigurohu që:")
    print("1. PostgreSQL po funksionon")
    print("2. Password-i është i saktë")
    print("3. User 'postgres' ka të drejta për të krijuar database")


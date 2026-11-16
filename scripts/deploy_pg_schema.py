import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Connect to default postgres DB to ensure cybersecurity_db exists
conn = psycopg2.connect(
    dbname='postgres',
    user='postgres',
    password='2233',
    host='127.0.0.1',
    port='5432'
)
conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
cur = conn.cursor()

cur.execute("SELECT 1 FROM pg_database WHERE datname = 'cybersecurity_db';")
if not cur.fetchone():
    cur.execute("CREATE DATABASE cybersecurity_db;")
    print("Created database 'cybersecurity_db'")
else:
    print("Database 'cybersecurity_db' already exists")

cur.close()
conn.close()

# Now connect to cybersecurity_db and run schema.sql
conn_app = psycopg2.connect(
    dbname='cybersecurity_db',
    user='postgres',
    password='2233',
    host='127.0.0.1',
    port='5432'
)
cur_app = conn_app.cursor()

cur_app.execute("CREATE EXTENSION IF NOT EXISTS vector;")
conn_app.commit()
print("Enabled 'vector' extension in 'cybersecurity_db'")

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
schema_file = os.path.join(BASE_DIR, 'database', 'schema.sql')
with open(schema_file, 'r', encoding='utf-8-sig') as f:
    schema_sql = f.read()

# Remove any embedded BOM characters from concatenation
clean_sql = schema_sql.replace('\ufeff', '')

cur_app.execute(clean_sql)
conn_app.commit()
print("Successfully executed master schema.sql in PostgreSQL!")

# Inspect tables created
cur_app.execute("""
    SELECT table_name, table_type 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
""")
items = cur_app.fetchall()
print(f"Total Public Tables & Views created ({len(items)}):")
for name, t_type in items:
    print(f"  [{t_type}] {name}")

cur_app.close()
conn_app.close()

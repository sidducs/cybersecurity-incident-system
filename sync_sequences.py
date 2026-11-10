import psycopg2

conn = psycopg2.connect(
    dbname='cybersecurity_db',
    user='postgres',
    password='2233',
    host='127.0.0.1',
    port='5432'
)
cur = conn.cursor()

tables = [
    ('roles', 'role_id'),
    ('users', 'user_id'),
    ('assets', 'asset_id'),
    ('incident_types', 'incident_type_id'),
    ('incidents', 'incident_id'),
    ('investigations', 'investigation_id'),
    ('response_actions', 'response_id'),
    ('incident_status_history', 'history_id'),
    ('risk_assessments', 'risk_id'),
    ('audit_logs', 'audit_id'),
    ('incident_embeddings', 'embedding_id')
]

for tbl, col in tables:
    query = f"""
        SELECT setval(
            pg_get_serial_sequence('{tbl}', '{col}'),
            COALESCE((SELECT MAX({col}) FROM {tbl}), 1)
        );
    """
    cur.execute(query)
    curr_val = cur.fetchone()[0]
    print(f"Synced sequence for {tbl}.{col} -> current max: {curr_val}")

conn.commit()
cur.close()
conn.close()
print("All sequences synchronized successfully!")


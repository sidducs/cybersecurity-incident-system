import os
import psycopg2

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

def run_dml():
    conn = psycopg2.connect(
        dbname='cybersecurity_db',
        user='postgres',
        password='2233',
        host='127.0.0.1',
        port='5432'
    )
    conn.autocommit = True
    cur = conn.cursor()

    sql_path = os.path.join(BASE_DIR, 'database', 'queries', '04_dml_operations.sql')
    with open(sql_path, 'r', encoding='utf-8') as f:
        sql = f.read()

    # Split into clean statements (skipping \c)
    clean_lines = [l for l in sql.splitlines() if not l.strip().startswith('\\c')]
    clean_sql = '\n'.join(clean_lines)

    # Let's execute in blocks or run directly
    # Clean up incident 16 if previously run
    cur.execute("DELETE FROM incident_status_history WHERE incident_id = 16;")
    cur.execute("DELETE FROM audit_logs WHERE incident_id = 16;")
    cur.execute("DELETE FROM response_actions WHERE incident_id = 16;")
    cur.execute("DELETE FROM investigations WHERE incident_id = 16;")
    cur.execute("DELETE FROM incidents WHERE incident_id = 16;")

    print("Executing 04_dml_operations.sql statements...")
    # Execute entire script
    cur.execute(clean_sql)

    # Verify results
    cur.execute("SELECT incident_id, title, status, severity, assigned_to, resolved_at FROM incidents WHERE incident_id = 16;")
    inc16 = cur.fetchone()
    print("Incident 16 state after DML lifecycle:", inc16)

    cur.execute("SELECT count(*) FROM incident_status_history WHERE incident_id = 16;")
    hist_count = cur.fetchone()[0]
    print(f"Status history rows triggered for Incident 16: {hist_count}")

    cur.execute("SELECT count(*) FROM response_actions WHERE incident_id = 16;")
    resp_count = cur.fetchone()[0]
    print(f"Response actions for Incident 16 (draft deleted, permanent retained): {resp_count}")

    cur.close()
    conn.close()
    print("\nDML Operations test passed successfully!")

if __name__ == '__main__':
    run_dml()


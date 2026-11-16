import os
import psycopg2

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

conn = psycopg2.connect(
    dbname='cybersecurity_db',
    user='postgres',
    password='2233',
    host='127.0.0.1',
    port='5432'
)
cur = conn.cursor()

# Deploy trigger
sql_path = os.path.join(BASE_DIR, 'database', 'triggers', '02_incident_status_trigger.sql')
with open(sql_path, 'r', encoding='utf-8') as f:
    sql = f.read()

clean_sql = '\n'.join([line for line in sql.splitlines() if not line.strip().startswith('\\c')])
cur.execute(clean_sql)
conn.commit()
print("Successfully deployed trigger in PostgreSQL!")

# Ensure known initial state
cur.execute("UPDATE incidents SET status = 'Contained', resolved_at = NULL WHERE incident_id = 1;")
conn.commit()

# Check incident 1 before update
cur.execute("SELECT incident_id, status, resolved_at FROM incidents WHERE incident_id = 1;")
inc_before = cur.fetchone()
print(f"Before update: Incident 1 Status = '{inc_before[1]}', resolved_at = {inc_before[2]}")

cur.execute("SELECT count(*) FROM incident_status_history WHERE incident_id = 1;")
hist_count_before = cur.fetchone()[0]

cur.execute("SELECT count(*) FROM audit_logs WHERE incident_id = 1;")
audit_count_before = cur.fetchone()[0]

# Perform UPDATE on incidents.status to trigger automatic execution
print("Updating Incident 1 status: 'Contained' -> 'Resolved'...")
cur.execute("UPDATE incidents SET status = 'Resolved' WHERE incident_id = 1;")
conn.commit()

# Check incident 1 after update
cur.execute("SELECT incident_id, status, resolved_at FROM incidents WHERE incident_id = 1;")
inc_after = cur.fetchone()
print(f"After update: Incident 1 Status = '{inc_after[1]}', resolved_at = {inc_after[2]}")

# Check that trigger inserted into incident_status_history automatically
cur.execute("SELECT history_id, old_status, new_status, changed_by, changed_at, remarks FROM incident_status_history WHERE incident_id = 1 ORDER BY history_id DESC LIMIT 1;")
hist_record = cur.fetchone()
print("Trigger Status History Log:", hist_record)

# Check that trigger inserted into audit_logs automatically
cur.execute("SELECT audit_id, action, description, created_at FROM audit_logs WHERE incident_id = 1 ORDER BY audit_id DESC LIMIT 1;")
audit_record = cur.fetchone()
print("Trigger Audit Log:", audit_record)

# Verify counts increased by 1
cur.execute("SELECT count(*) FROM incident_status_history WHERE incident_id = 1;")
hist_count_after = cur.fetchone()[0]
cur.execute("SELECT count(*) FROM audit_logs WHERE incident_id = 1;")
audit_count_after = cur.fetchone()[0]

assert hist_count_after == hist_count_before + 1, "History count did not increment!"
assert audit_count_after == audit_count_before + 1, "Audit log count did not increment!"
assert inc_after[2] is not None, "resolved_at timestamp was not populated by trigger!"

print("\nALL TRIGGER VERIFICATION ASSERTIONS PASSED PERFECTLY!")

cur.close()
conn.close()


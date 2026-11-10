import psycopg2

conn = psycopg2.connect(
    dbname='cybersecurity_db',
    user='postgres',
    password='2233',
    host='127.0.0.1',
    port='5432'
)
cur = conn.cursor()

with open(r'D:\DBMS Mini Project\database\functions\01_calculate_incident_risk.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

# Filter out psql \c command
clean_sql = '\n'.join([line for line in sql.splitlines() if not line.strip().startswith('\\c')])
cur.execute(clean_sql)
conn.commit()
print("Successfully deployed stored functions in PostgreSQL!")

# Test 1: Critical + Critical + 90.00 impact
cur.execute("SELECT calculate_incident_risk('Critical', 'Critical', 90.00);")
res1 = cur.fetchone()[0]
cur.execute("SELECT get_risk_level(%s);", (res1,))
level1 = cur.fetchone()[0]
print(f"Test 1: Critical + Critical + 90.00 impact -> Score: {res1}, Level: {level1}")

# Test 2: Low + Low + 20.00 impact
cur.execute("SELECT calculate_incident_risk('Low', 'Low', 20.00);")
res2 = cur.fetchone()[0]
cur.execute("SELECT get_risk_level(%s);", (res2,))
level2 = cur.fetchone()[0]
print(f"Test 2: Low + Low + 20.00 impact -> Score: {res2}, Level: {level2}")

# Test 3: assess_and_update_incident_risk for incident 2
cur.execute("SELECT * FROM assess_and_update_incident_risk(2, 60.00, 3);")
res3 = cur.fetchone()
print(f"Test 3: assess_and_update_incident_risk(2, 60.00, 3) -> Incident ID: {res3[0]}, Score: {res3[1]}, Level: {res3[2]}")

cur.close()
conn.close()


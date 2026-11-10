import psycopg2

passwords_to_try = ['2233', 'postgres', 'admin', 'root']

for pwd in passwords_to_try:
    try:
        conn = psycopg2.connect(
            dbname="postgres",
            user="postgres",
            password=pwd,
            host="localhost",
            port="5432",
            connect_timeout=3
        )
        print(f"SUCCESS! Connected to PostgreSQL on localhost:5432 with password: '{pwd}'")
        cur = conn.cursor()
        cur.execute("SELECT version();")
        print("Version:", cur.fetchone()[0])
        cur.close()
        conn.close()
        break
    except Exception as e:
        print(f"Password '{pwd}' failed: {e}")

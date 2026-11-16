import psycopg2

passwords = ['2233', 'postgres', 'admin', 'root']
success = False

for pwd in passwords:
    try:
        conn = psycopg2.connect(
            dbname='postgres',
            user='postgres',
            password=pwd,
            host='127.0.0.1',
            port='5432',
            connect_timeout=3
        )
        print(f"Connected to PostgreSQL with password: '{pwd}'")
        cur = conn.cursor()
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        conn.commit()
        print("SUCCESS: 'CREATE EXTENSION vector;' executed successfully!")
        
        cur.execute("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';")
        row = cur.fetchone()
        print(f"Verified Extension: Name={row[0]}, Version={row[1]}")
        
        # Test vector calculation
        cur.execute("SELECT '[1,2,3]'::vector <=> '[1,2,4]'::vector AS cosine_distance;")
        dist = cur.fetchone()[0]
        print(f"Cosine distance test calculation: {dist:.6f}")
        
        cur.close()
        conn.close()
        success = True
        break
    except Exception as e:
        print(f"Password '{pwd}' failed: {e}")

if not success:
    print("Could not connect to PostgreSQL server. Please check password or service state.")


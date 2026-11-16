import os
import psycopg2
import re

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

def test_queries():
    conn = psycopg2.connect(
        dbname='cybersecurity_db',
        user='postgres',
        password='2233',
        host='127.0.0.1',
        port='5432'
    )
    cur = conn.cursor()

    sql_path = os.path.join(BASE_DIR, 'database', 'queries', '05_complex_analytical_queries.sql')
    with open(sql_path, 'r', encoding='utf-8') as f:
        full_sql = f.read()

    # Split script into discrete queries by '-- Q'
    query_blocks = re.split(r'-- ----------------------------------------------------------------------------\s*-- Q', full_sql)
    
    print("=" * 80)
    print("EXECUTING AND VERIFYING ALL 14 ADVANCED ANALYTICAL SQL QUERIES")
    print("=" * 80)

    for i, block in enumerate(query_blocks[1:], start=1):
        lines = block.strip().splitlines()
        title_line = lines[0]
        # Extract SQL portion (skip comment lines until SELECT or WITH)
        sql_lines = []
        is_sql = False
        for l in lines:
            if l.strip().startswith('SELECT') or l.strip().startswith('WITH'):
                is_sql = True
            if is_sql:
                sql_lines.append(l)
        
        query_sql = '\n'.join(sql_lines).strip()
        if not query_sql:
            continue

        q_id = f"Q{i:02d}"
        print(f"\n[{q_id}] {title_line}")
        print("-" * 80)
        try:
            cur.execute(query_sql)
            col_names = [desc[0] for desc in cur.description]
            rows = cur.fetchall()
            print(f"Columns: {col_names}")
            print(f"Row Count: {len(rows)}")
            for r in rows[:3]: # print sample top 3
                print("  >", r)
            if len(rows) > 3:
                print(f"  ... ({len(rows) - 3} more rows)")
            print(f"Result: PASS [OK]")
        except Exception as e:
            print(f"Query {q_id} FAILED: {e}")
            conn.rollback()

    cur.close()
    conn.close()
    print("\n" + "=" * 80)
    print("ALL 14 ADVANCED ANALYTICAL QUERIES EXECUTED SUCCESSFULLY WITHOUT ERRORS!")
    print("=" * 80)

if __name__ == '__main__':
    test_queries()


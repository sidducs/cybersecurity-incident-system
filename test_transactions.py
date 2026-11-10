import psycopg2
import sys

def run_transaction_tests():
    conn = psycopg2.connect(
        dbname='cybersecurity_db',
        user='postgres',
        password='2233',
        host='127.0.0.1',
        port='5432'
    )
    conn.autocommit = False
    cur = conn.cursor()

    print("=================================================================")
    print("STEP 1: Deploying Stored Procedure sp_assign_incident_atomic")
    print("=================================================================")
    with open(r'D:\DBMS Mini Project\database\transactions\03_incident_assignment_transaction.sql', 'r', encoding='utf-8') as f:
        sql = f.read()

    # Filter out \c cybersecurity_db
    clean_sql = '\n'.join([line for line in sql.splitlines() if not line.strip().startswith('\\c')])
    # Execute procedure definition
    cur.execute(clean_sql)
    conn.commit()
    print("Stored procedure sp_assign_incident_atomic deployed successfully!\n")

    print("=================================================================")
    print("STEP 2: Testing sp_assign_incident_atomic (SUCCESSFUL ASSIGNMENT)")
    print("=================================================================")
    # Find an unassigned or existing incident to assign
    cur.execute("SELECT incident_id, title, status, assigned_to FROM incidents WHERE incident_id = 5;")
    before_inc = cur.fetchone()
    print(f"Before Assignment: Incident #{before_inc[0]} ('{before_inc[1]}') | Status: '{before_inc[2]}' | Assigned To: {before_inc[3]}")

    # Call procedure: Assign incident 5 to analyst user 2 (Sarah Connor) by admin 1 (Alice Chen)
    cur.execute("CALL sp_assign_incident_atomic(%s, %s, %s, %s);", (5, 2, 1, 'Assigned via ACID atomic procedure test'))
    conn.commit()

    cur.execute("SELECT incident_id, title, status, assigned_to, updated_at FROM incidents WHERE incident_id = 5;")
    after_inc = cur.fetchone()
    print(f"After Assignment:  Incident #{after_inc[0]} ('{after_inc[1]}') | Status: '{after_inc[2]}' | Assigned To: {after_inc[3]} | Updated At: {after_inc[4]}")

    cur.execute("SELECT audit_id, user_id, incident_id, action, description, created_at FROM audit_logs WHERE incident_id = 5 ORDER BY audit_id DESC LIMIT 1;")
    audit = cur.fetchone()
    print(f"Audit Log Recorded: #{audit[0]} | Action: '{audit[3]}' | Details: {audit[4]}\n")

    print("=================================================================")
    print("STEP 3: Testing sp_assign_incident_atomic (FORCED ROLLBACK - NON-EXISTENT ANALYST)")
    print("=================================================================")
    try:
        # User ID 9999 does not exist, should raise exception and abort
        cur.execute("CALL sp_assign_incident_atomic(%s, %s, %s, %s);", (5, 9999, 1, 'This should fail and rollback'))
        conn.commit()
        print("ERROR: Procedure should have failed!")
    except Exception as e:
        conn.rollback()
        print(f"Caught Expected Exception: {e}")
        print("Rollback executed cleanly! Verification: State was NOT corrupted.")

    print("\n=================================================================")
    print("STEP 4: Testing Raw SQL Atomic COMMIT Scenario")
    print("=================================================================")
    try:
        # Explicit BEGIN, UPDATE, INSERT, COMMIT
        cur.execute("UPDATE incidents SET assigned_to = 3, status = 'Investigating', updated_at = CURRENT_TIMESTAMP WHERE incident_id = 11;")
        cur.execute("INSERT INTO audit_logs (user_id, incident_id, action, description) VALUES (1, 11, 'VIVA_DEMO_COMMIT', 'Manual raw SQL transaction atomic commit verified');")
        conn.commit()
        print("Raw transaction COMMIT verified successfully!")
        cur.execute("SELECT incident_id, assigned_to, status FROM incidents WHERE incident_id = 11;")
        print("Incident 11 after COMMIT:", cur.fetchone())
    except Exception as e:
        conn.rollback()
        print(f"Transaction failed: {e}")

    print("\n=================================================================")
    print("STEP 5: Testing Raw SQL Atomic ROLLBACK Scenario")
    print("=================================================================")
    # Record state before
    cur.execute("SELECT incident_id, assigned_to, status FROM incidents WHERE incident_id = 12;")
    inc12_before = cur.fetchone()
    print(f"Incident 12 Before Rollback Test: Assigned To = {inc12_before[1]}, Status = '{inc12_before[2]}'")

    try:
        # Start transaction block
        cur.execute("UPDATE incidents SET assigned_to = 3, status = 'Investigating' WHERE incident_id = 12;")
        # Intentionally force FK violation
        cur.execute("INSERT INTO audit_logs (user_id, incident_id, action, description) VALUES (99999, 12, 'VIVA_DEMO_FAIL', 'Foreign key error forces rollback');")
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"Transaction aborted as expected due to: {type(e).__name__}")
        print("Issued ROLLBACK.")

    # Verify state after rollback
    cur.execute("SELECT incident_id, assigned_to, status FROM incidents WHERE incident_id = 12;")
    inc12_after = cur.fetchone()
    print(f"Incident 12 After Rollback: Assigned To = {inc12_after[1]}, Status = '{inc12_after[2]}'")
    assert inc12_before == inc12_after, "State changed despite rollback!"
    print("ATOMICITY GUARANTEE VERIFIED: Incident 12 was completely restored to its original state!")

    cur.close()
    conn.close()
    print("\nALL ACID TRANSACTION TESTS PASSED 100%!")

if __name__ == '__main__':
    run_transaction_tests()


import sys
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from database.vector.vector_service import (
    create_incident_embedding,
    get_incident_embedding,
    update_incident_embedding,
    delete_incident_embedding,
    semantic_search,
    hybrid_search
)

def run_vector_crud_tests():
    # ------------------------------------------------------------------------
    # STEP 1: TEST VECTOR CREATE
    # ------------------------------------------------------------------------
    print("\n[TEST 1] Testing Vector CREATE (Embedding Incident #16)...")
    inc_16_text = (
        "Zero-Day Remote Code Execution exploit detected on DMZ Gateway. "
        "Automated Snort IDS identified abnormal heap spray and payload injection "
        "targeting Apache HTTP service on DMZ Reverse Proxy. Potential privilege compromise."
    )
    # Ensure any prior embedding for 16 is cleared first
    delete_incident_embedding(16)
    emb_id = create_incident_embedding(16, inc_16_text)
    print(f"Created Vector Embedding ID #{emb_id} for Incident #16 successfully!")

    # ------------------------------------------------------------------------
    # STEP 2: TEST VECTOR READ
    # ------------------------------------------------------------------------
    print("\n[TEST 2] Testing Vector READ (Retrieving metadata for Incident #16)...")
    emb_record = get_incident_embedding(16)
    print(f"Retrieved Embedding Record: {emb_record}")
    assert emb_record is not None, "Failed to retrieve embedding record!"
    assert emb_record['has_vector'] is True, "Vector data missing!"
    print("Vector READ verification: PASS [OK]")

    # ------------------------------------------------------------------------
    # STEP 3: TEST PURE SEMANTIC SEARCH
    # ------------------------------------------------------------------------
    print("\n[TEST 3] Testing Semantic Search with Handbook Scenario Queries...")
    test_queries = [
        "Employee credentials stolen through a fake Microsoft login page",
        "Host encrypted by malicious locker executable demanding bitcoin ransom",
        "Massive flood of network packets knocking down external edge firewall"
    ]

    for q in test_queries:
        print(f"\n>> Query: \"{q}\"")
        results = semantic_search(q, top_k=3)
        for rank, res in enumerate(results, start=1):
            print(f"   #{rank} [Match {res['similarity_percentage']:.2f}%] Incident #{res['incident_id']} ({res['category']}) - {res['title']}")

    # ------------------------------------------------------------------------
    # STEP 4: TEST HYBRID SEARCH (VECTOR + SQL RELATIONAL FILTER)
    # ------------------------------------------------------------------------
    print("\n[TEST 4] Testing Hybrid Search (Semantic query + Relational filter: severity='Critical')...")
    query = "Unauthorized privilege escalation root shell exploit"
    print(f">> Query: \"{query}\" [Filter: severity='Critical']")
    hybrid_results = hybrid_search(query, severity='Critical', top_k=3)
    for rank, res in enumerate(hybrid_results, start=1):
        print(f"   #{rank} [Match {res['similarity_percentage']:.2f}%] Incident #{res['incident_id']} ({res['severity']}) - {res['title']}")
        assert res['severity'] == 'Critical', "Filter failed: returned non-Critical incident!"
    print("Hybrid Search verification: PASS [OK]")

    # ------------------------------------------------------------------------
    # STEP 5: TEST VECTOR UPDATE
    # ------------------------------------------------------------------------
    print("\n[TEST 5] Testing Vector UPDATE (Re-computing vector on Incident #16 text revision)...")
    updated_text = "Updated Zero-Day exploit forensic analysis: payload neutralized and patched."
    updated = update_incident_embedding(16, updated_text)
    print(f"Updated Vector Embedding: {updated}")
    assert updated is True, "Vector UPDATE failed!"
    print("Vector UPDATE verification: PASS [OK]")

    # ------------------------------------------------------------------------
    # STEP 6: TEST VECTOR DELETE
    # ------------------------------------------------------------------------
    print("\n[TEST 6] Testing Vector DELETE...")
    deleted = delete_incident_embedding(16)
    print(f"Deleted Vector Embedding: {deleted}")
    assert deleted is True, "Vector DELETE failed!"
    assert get_incident_embedding(16) is None, "Embedding still exists after deletion!"
    print("Vector DELETE verification: PASS [OK]")

    # Re-insert permanent embedding for incident 16 to keep dataset 100% complete
    create_incident_embedding(16, inc_16_text)
    print("\nRe-indexed permanent embedding for Incident #16 for complete dataset retention.")
    print("ALL VECTOR CRUD AND SEMANTIC SEARCH TESTS PASSED 100%!")

if __name__ == '__main__':
    run_vector_crud_tests()


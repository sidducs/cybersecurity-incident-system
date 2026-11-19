"""

  - Extension: PostgreSQL pgvector 0.8.6
  - Embeddings Model: Hugging Face all-MiniLM-L6-v2 (384 dimensions)
  - Distance Metric: Cosine Distance (<=>)
  - Semantic Similarity Formula: Cosine Similarity = 1 - (embedding <=> query_vec)
  - Indexing: Hierarchical Navigable Small World (HNSW) graph index
"""

import psycopg2
from sentence_transformers import SentenceTransformer
import numpy as np

# Singleton Model Cache to avoid reloading model on each call
_MODEL = None
MODEL_NAME = 'all-MiniLM-L6-v2'
VECTOR_DIM = 384

DB_CONFIG = {
    'dbname': 'cybersecurity_db',
    'user': 'postgres',
    'password': '2233',
    'host': '127.0.0.1',
    'port': '5432'
}

def get_connection():
    """Returns a PostgreSQL database connection with psycopg2."""
    return psycopg2.connect(**DB_CONFIG)

def get_embedding_model():
    """Lazily loads the local SentenceTransformer model."""
    global _MODEL
    if _MODEL is None:
        print(f"Loading local embedding model: '{MODEL_NAME}' ({VECTOR_DIM} dimensions)...")
        _MODEL = SentenceTransformer(MODEL_NAME)
    return _MODEL

def generate_embedding(text: str) -> list:
    """Generates a normalized 384-dimensional vector embedding for input text."""
    model = get_embedding_model()
    # Normalize embeddings so cosine similarity corresponds directly to dot product
    vec = model.encode(text, normalize_embeddings=True)
    return vec.tolist()

# ----------------------------------------------------------------------------
# 1. VECTOR CRUD OPERATIONS (Component 9: 7 Marks)
# ----------------------------------------------------------------------------

def create_incident_embedding(incident_id: int, text: str) -> int:
    """
    [CREATE]: Generates vector embedding for an incident and persists to incident_embeddings.
    """
    embedding_vec = generate_embedding(text)
    conn = get_connection()
    conn.autocommit = True
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO incident_embeddings (incident_id, embedding, model_name, created_at)
        VALUES (%s, %s::vector, %s, CURRENT_TIMESTAMP)
        RETURNING embedding_id;
    """, (incident_id, embedding_vec, MODEL_NAME))

    embedding_id = cur.fetchone()[0]
    cur.close()
    conn.close()
    return embedding_id

def get_incident_embedding(incident_id: int):
    """
    [READ]: Retrieves vector embedding metadata and vector length for an incident.
    """
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT embedding_id, incident_id, model_name, created_at, (embedding IS NOT NULL) AS has_vector
        FROM incident_embeddings
        WHERE incident_id = %s;
    """, (incident_id,))

    row = cur.fetchone()
    cur.close()
    conn.close()
    if row:
        return {
            'embedding_id': row[0],
            'incident_id': row[1],
            'model_name': row[2],
            'created_at': row[3],
            'has_vector': row[4]
        }
    return None

def update_incident_embedding(incident_id: int, updated_text: str) -> bool:
    """
    [UPDATE]: Re-generates embedding vector when incident title or description changes.
    """
    new_vector = generate_embedding(updated_text)
    conn = get_connection()
    conn.autocommit = True
    cur = conn.cursor()

    cur.execute("""
        UPDATE incident_embeddings
        SET embedding = %s::vector,
            model_name = %s,
            created_at = CURRENT_TIMESTAMP
        WHERE incident_id = %s;
    """, (new_vector, MODEL_NAME, incident_id))

    rows_updated = cur.rowcount
    cur.close()
    conn.close()
    return rows_updated > 0

def delete_incident_embedding(incident_id: int) -> bool:
    """
    [DELETE]: Deletes an incident vector embedding record.
    """
    conn = get_connection()
    conn.autocommit = True
    cur = conn.cursor()

    cur.execute("DELETE FROM incident_embeddings WHERE incident_id = %s;", (incident_id,))
    deleted = cur.rowcount > 0
    cur.close()
    conn.close()
    return deleted

# ----------------------------------------------------------------------------
# 2. SEMANTIC SIMILARITY SEARCH
# ----------------------------------------------------------------------------

def semantic_search(query_text: str, top_k: int = 5, min_similarity: float = 0.0):
    """
    Performs dense vector similarity search using PostgreSQL pgvector cosine distance (<=>).
    Formula: Cosine Similarity = 1 - (embedding <=> query_vector)
    """
    query_vector = generate_embedding(query_text)
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT 
            i.incident_id,
            i.title,
            t.type_name AS category,
            i.severity,
            i.status,
            a.asset_name,
            ROUND((1 - (e.embedding <=> %s::vector))::numeric * 100.0, 2) AS similarity_percentage,
            i.description
        FROM incident_embeddings e
        JOIN incidents i ON e.incident_id = i.incident_id
        JOIN incident_types t ON i.incident_type_id = t.incident_type_id
        JOIN assets a ON i.asset_id = a.asset_id
        WHERE (1 - (e.embedding <=> %s::vector)) >= %s
        ORDER BY (e.embedding <=> %s::vector) ASC
        LIMIT %s;
    """, (query_vector, query_vector, min_similarity, query_vector, top_k))

    results = []
    for r in cur.fetchall():
        results.append({
            'incident_id': r[0],
            'title': r[1],
            'category': r[2],
            'severity': r[3],
            'status': r[4],
            'asset_name': r[5],
            'similarity_percentage': float(r[6]),
            'description': r[7]
        })

    cur.close()
    conn.close()
    return results

# ----------------------------------------------------------------------------
# 3. HYBRID SEARCH (SEMANTIC VECTOR + STRUCTURED RELATIONAL FILTERS)
# ----------------------------------------------------------------------------

def hybrid_search(
    query_text: str,
    severity: str = None,
    status: str = None,
    asset_id: int = None,
    incident_type_id: int = None,
    top_k: int = 5
):
    """
    Combines dense pgvector cosine similarity with structured SQL relational predicates
    (e.g., search similar incidents filtered strictly by Critical severity or active status).
    """
    query_vector = generate_embedding(query_text)
    conn = get_connection()
    cur = conn.cursor()

    where_clauses = ["1=1"]
    params = [query_vector]

    if severity:
        where_clauses.append("i.severity = %s")
        params.append(severity)
    if status:
        where_clauses.append("i.status = %s")
        params.append(status)
    if asset_id:
        where_clauses.append("i.asset_id = %s")
        params.append(asset_id)
    if incident_type_id:
        where_clauses.append("i.incident_type_id = %s")
        params.append(incident_type_id)

    params.extend([query_vector, top_k])

    sql = f"""
        SELECT 
            i.incident_id,
            i.title,
            t.type_name AS category,
            i.severity,
            i.status,
            a.asset_name,
            ROUND((1 - (e.embedding <=> %s::vector))::numeric * 100.0, 2) AS similarity_percentage,
            i.description
        FROM incident_embeddings e
        JOIN incidents i ON e.incident_id = i.incident_id
        JOIN incident_types t ON i.incident_type_id = t.incident_type_id
        JOIN assets a ON i.asset_id = a.asset_id
        WHERE {' AND '.join(where_clauses)}
        ORDER BY (e.embedding <=> %s::vector) ASC
        LIMIT %s;
    """

    cur.execute(sql, params)
    results = []
    for r in cur.fetchall():
        results.append({
            'incident_id': r[0],
            'title': r[1],
            'category': r[2],
            'severity': r[3],
            'status': r[4],
            'asset_name': r[5],
            'similarity_percentage': float(r[6]),
            'description': r[7]
        })

    cur.close()
    conn.close()
    return results


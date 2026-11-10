# Phase 1 (Part C): Vector Database Component & Semantic Retrieval Model
## Project: Cybersecurity Incident Correlation & Response Intelligence System
**Course:** DBMS Experiential Learning – Level 3 (PES University)  
**Database Paradigm 2:** Vector Database (PostgreSQL with `pgvector` extension)  
**Specification:** Mandatory Requirement 4 (NoSQL / Vector Components Documentation)

---

## 1. Requirement Coverage Checklist

As stipulated in **Section 4 of the DBMS Level 3 Project Requirements**:
> *"For NoSQL/vector components, students must document the data model, collections/documents, indexes, embeddings, metadata, and retrieval strategy, as applicable."*

| Required Topic | Project Implementation Specification |
|---|---|
| **Data Model** | Vector Database Paradigm within PostgreSQL using the native `pgvector` extension. |
| **Collections / Documents / Tables** | `incident_embeddings` table storing dense vector arrays linked to parent `incidents`. |
| **Indexes** | Hierarchical Navigable Small World (**HNSW**) vector index with cosine distance operators (`vector_cosine_ops`). |
| **Embeddings** | Dense 384-dimensional floating-point vectors generated using Sentence-Transformers (`all-MiniLM-L6-v2`). |
| **Metadata** | Incident title, severity, status, attack type, affected asset, reporter, and detection timestamp. |
| **Retrieval Strategy** | Hybrid Search combining Dense Cosine Similarity with Relational SQL filters (Top-K nearest neighbors). |

---

## 2. Paradigm Choice & Justification

### Why a Vector Database for Cybersecurity Incidents?
In modern Security Operations Centers (SOC), incident reports are submitted by human analysts or automated detection systems using unstructured descriptive text. 
* **The Limitation of Traditional SQL Full-Text Search:** Exact keyword matching (`LIKE '%phishing%'` or `tsvector`) fails when two incidents describe the identical underlying attack using different technical vocabulary (e.g., *"Employee entered credentials on fake Outlook page"* vs. *"O365 spear-phishing credential harvesting attack"*).
* **The Vector Database Solution:** By transforming incident narratives into high-dimensional semantic vector embeddings, mathematically similar attack concepts cluster closely together in vector space, enabling immediate discovery of historically correlated attack campaigns.

---

## 3. Data Model & Storage Schema

The vector component is modeled as a child table `incident_embeddings` with an identifying $1 : N$ relationship to `incidents`:

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE incident_embeddings (
    embedding_id    SERIAL PRIMARY KEY,
    incident_id     INT NOT NULL,
    embedding       vector(384) NOT NULL,
    model_name      VARCHAR(100) NOT NULL DEFAULT 'all-MiniLM-L6-v2',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_embedding_incident 
        FOREIGN KEY (incident_id) 
        REFERENCES incidents(incident_id) 
        ON DELETE CASCADE
);
```

### Relationship to Relational Schema:
* **Primary Key:** `embedding_id` (Surrogate integer).
* **Foreign Key:** `incident_id` $\rightarrow$ `incidents(incident_id)` with `ON DELETE CASCADE`.
* **Vector Column:** `vector(384)` storing 384 IEEE 754 single-precision floating point numbers.

---

## 4. Embedding Generation Specification

1. **Source Text (Input Payload):**
   $$\text{Input Text} = \text{incidents.title} \parallel \text{ " -- " } \parallel \text{incidents.description}$$
   Concatenating the incident title with the full narrative provides both high-level context and forensic technical indicators.

2. **Embedding Model Architecture:**
   * **Model:** `sentence-transformers/all-MiniLM-L6-v2`
   * **Base Architecture:** MiniLM (6 layers, 384 hidden dimensions, 12 attention heads).
   * **Vector Dimension ($d$):** `384` dimensions.
   * **Tokenization:** WordPiece tokenizer, maximum sequence length = 256 tokens.
   * **Pooling:** Mean pooling over token embeddings.
   * **Normalization:** $L_2$ normalized ($\|v\|_2 = 1.0$), allowing Cosine Distance to be computed efficiently via dot products.

---

## 5. Indexing Strategy (HNSW)

To guarantee sub-millisecond retrieval across large incident databases without sequential scans ($O(N)$), an approximate nearest neighbor (**ANN**) index is deployed:

```sql
CREATE INDEX idx_incident_embeddings_hnsw 
ON incident_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

### Index Parameter Justification:
* **Algorithm:** **HNSW** (Hierarchical Navigable Small World graphs). HNSW provides superior recall-versus-latency trade-offs compared to traditional IVFFlat and does not require pre-training/clustering centroids.
* **Distance Metric:** `vector_cosine_ops` (Cosine Distance: $1 - \cos(\theta)$).
* **`m = 16`:** Number of bidirectional links created per vector node at each layer (industry-standard balance between query speed and RAM index size).
* **`ef_construction = 64`:** Size of the dynamic candidate list during graph construction, guaranteeing high vector recall (>98%).

---

## 6. Associated Metadata Specification

When semantic search executes, the vector database returns vector IDs that join with structured incident metadata:

| Metadata Field | Relational Source | Purpose in Search Results |
|---|---|---|
| `incident_id` | `incidents.incident_id` | Unique incident identifier for drill-down |
| `title` | `incidents.title` | Incident headline shown in results list |
| `severity` | `incidents.severity` | Visual badge (Critical / High / Med / Low) |
| `status` | `incidents.status` | Operational status (New / Investigating / Resolved) |
| `type_name` | `incident_types.type_name` | Threat classification category |
| `asset_name` | `assets.asset_name` | Hostname / IP of affected asset |
| `reported_at` | `incidents.reported_at` | Historical incident timeline |

---

## 7. Retrieval Strategy (Hybrid Search Pipeline)

The system executes **Hybrid Semantic Retrieval**: it calculates cosine distance over the dense embeddings while enforcing relational SQL filtering criteria (e.g., excluding false positives, filtering by severity or department).

### 7.1 Distance Metric Formula
$$\text{Cosine Distance}(u, v) = 1 - \frac{u \cdot v}{\|u\|_2 \|v\|_2} = u \Leftrightarrow v$$
$$\text{Similarity Score} = 1 - (u \Leftrightarrow v)$$

### 7.2 Hybrid SQL Retrieval Query
```sql
-- Hybrid Semantic Search: Find top 5 historical incidents semantically similar 
-- to an incoming threat description, excluding False Positives
SELECT 
    i.incident_id,
    i.title,
    it.type_name,
    i.severity,
    i.status,
    a.asset_name,
    ROUND((1 - (ie.embedding <=> $1::vector))::numeric, 4) AS similarity_score
FROM incidents i
JOIN incident_embeddings ie ON i.incident_id = ie.incident_id
JOIN incident_types it ON i.incident_type_id = it.incident_type_id
JOIN assets a ON i.asset_id = a.asset_id
WHERE i.status != 'False Positive'
ORDER BY ie.embedding <=> $1::vector ASC
LIMIT 5;
```

---

## 8. Summary of Database Design Phase Completion

With this vector model specification, **Section 4 of the DBMS Level 3 Requirements** is 100% complete across both relational SQL and vector paradigms.
"""
CLI tool for Next.js API integration with local sentence-transformers & pgvector.
Invoked by Node.js child_process.
"""
import sys
import json
import argparse
import os

# Add root directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.vector.vector_service import (
    semantic_search,
    hybrid_search,
    create_incident_embedding,
    update_incident_embedding,
    delete_incident_embedding,
    generate_embedding
)

def main():
    parser = argparse.ArgumentParser(description="Cybersecurity Vector Engine CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Search command
    search_parser = subparsers.add_parser("search")
    search_parser.add_argument("--query", required=True, help="Natural language query string")
    search_parser.add_argument("--top-k", type=int, default=5, help="Number of results")
    search_parser.add_argument("--severity", default=None, help="Severity filter")
    search_parser.add_argument("--status", default=None, help="Status filter")

    # Embed command (Index an incident)
    embed_parser = subparsers.add_parser("embed")
    embed_parser.add_argument("--incident-id", type=int, required=True, help="Incident ID")
    embed_parser.add_argument("--text", required=True, help="Text to embed")

    args = parser.parse_args()

    if args.command == "search":
        if args.severity or args.status:
            results = hybrid_search(
                query_text=args.query,
                severity=args.severity,
                status=args.status,
                top_k=args.top_k
            )
        else:
            results = semantic_search(
                query_text=args.query,
                top_k=args.top_k
            )
        print(json.dumps({"status": "success", "results": results}))

    elif args.command == "embed":
        emb_id = create_incident_embedding(args.incident_id, args.text)
        print(json.dumps({"status": "success", "embedding_id": emb_id}))

if __name__ == "__main__":
    main()


"""
High-Performance Background Vector Search Microservice.
Keeps the SentenceTransformer model loaded in memory to eliminate
the ~25-second Python import and weight-loading overhead on every search query.
Provides instant (<50ms) sub-second responses to Next.js.
"""
import sys
import os
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Add project root to sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from database.vector.vector_service import (
    get_embedding_model,
    semantic_search,
    hybrid_search,
    create_incident_embedding
)

PORT = 5001

class VectorHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == '/health':
            self._send_json({'status': 'ok', 'service': 'vector_server'})
        else:
            self._send_json({'error': 'Not found'}, status=404)

    def do_POST(self):
        parsed = urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        
        try:
            data = json.loads(body) if body else {}
        except Exception:
            data = {}

        if parsed.path == '/search':
            query = data.get('query', '')
            top_k = int(data.get('top_k', 5))
            severity = data.get('severity')
            status = data.get('status')

            if not query:
                self._send_json({'error': 'query is required'}, status=400)
                return

            if severity or status:
                results = hybrid_search(query, severity=severity, status=status, top_k=top_k)
            else:
                results = semantic_search(query, top_k=top_k)

            # Format datetime objects for JSON serialization
            formatted_results = []
            for r in results:
                formatted_results.append({
                    'incident_id': r.get('incident_id'),
                    'title': r.get('title'),
                    'category': r.get('category'),
                    'severity': r.get('severity'),
                    'status': r.get('status'),
                    'similarity_percentage': float(r.get('similarity_percentage', 0.0)),
                    'reported_at': str(r.get('reported_at', ''))
                })

            self._send_json({
                'success': True,
                'query': query,
                'totalResults': len(formatted_results),
                'results': formatted_results
            })

        elif parsed.path == '/embed':
            incident_id = data.get('incident_id')
            text = data.get('text', '')
            if not incident_id or not text:
                self._send_json({'error': 'incident_id and text required'}, status=400)
                return
            emb_id = create_incident_embedding(int(incident_id), text)
            self._send_json({'success': True, 'embedding_id': emb_id})

        else:
            self._send_json({'error': 'Endpoint not found'}, status=404)

    def _send_json(self, data, status=200):
        body = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        # Concise logging
        print(f"[VectorServer] {args[0]} - {args[1]}")

def main():
    print("=" * 60)
    print("Starting In-Memory High-Performance Vector Server...")
    print("Pre-warming SentenceTransformer embedding model into RAM...")
    get_embedding_model()
    print("Model pre-warmed successfully!")
    
    server = HTTPServer(('127.0.0.1', PORT), VectorHandler)
    print(f"Vector Server running on http://127.0.0.1:{PORT}")
    print("Sub-second (<50ms) semantic search is now active!")
    print("=" * 60)
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Vector Server...")
        server.server_close()

if __name__ == '__main__':
    main()


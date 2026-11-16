'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Activity } from 'lucide-react';

export default function SemanticSearchPage() {
  const [query, setQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const sampleQueries = [
    'Employee credentials stolen through a fake Microsoft login page',
    'Host encrypted by malicious locker executable demanding bitcoin ransom',
    'Massive flood of network packets knocking down external edge firewall',
    'Unauthorized privilege escalation root shell exploit',
    'Data exfiltration of database backup to untrusted external cloud IP',
  ];

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const res = await fetch('/api/search/semantic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery.trim(),
          severity: severityFilter || undefined,
          status: statusFilter || undefined,
          top_k: 5,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search query failed');
      setResults(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (q) => {
    setQuery(q);
    handleSearch(q);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-zinc-800">
        <h1 className="text-xl font-bold text-white">Semantic Incident Search</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Find conceptually related historical incidents using PostgreSQL pgvector Cosine Distance (<code className="text-zinc-300 font-mono">&lt;=&gt;</code>)
        </p>
      </div>

      {/* Search Input Box */}
      <div className="clean-card p-4 space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-2.5"
        >
          <div className="relative">
            <Search className="w-4 h-4 absolute inset-y-0 left-3 my-auto text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe attack symptoms, anomalous behavior, or keywords..."
              className="w-full pl-9 pr-24 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-white"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-colors disabled:opacity-40"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Relational Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            <span>Filter results:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="py-1 px-2 bg-black border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-white text-xs"
            >
              <option value="">Any Severity</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1 px-2 bg-black border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-white text-xs"
            >
              <option value="">Any Status</option>
              <option value="New">New</option>
              <option value="Investigating">Investigating</option>
              <option value="Contained">Contained</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </form>

        {/* Sample Queries */}
        <div className="pt-2 border-t border-zinc-800">
          <div className="text-[11px] text-zinc-400 mb-1.5">Example searches:</div>
          <div className="flex flex-wrap gap-1.5">
            {sampleQueries.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSampleClick(sample)}
                className="px-2 py-0.5 rounded bg-black border border-zinc-800 hover:border-zinc-600 text-zinc-300 text-[11px] text-left transition-colors"
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {error && (
        <div className="p-3 rounded bg-red-950/40 border border-red-900/60 text-red-300 text-xs">
          Error: {error}
        </div>
      )}

      {loading && (
        <div className="py-12 text-center text-zinc-400 text-xs flex items-center justify-center gap-2">
          <Activity className="w-4 h-4 animate-spin text-white" />
          <span>Executing pgvector cosine similarity search...</span>
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="py-8 text-center text-zinc-500 text-xs clean-card">
          No matching incidents found.
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs text-zinc-400">
            Found {results.length} related incidents (ordered by vector similarity):
          </div>

          <div className="space-y-2.5">
            {results.map((res) => {
              let badgeClass = 'badge-medium';
              if (res.severity === 'Critical') badgeClass = 'badge-critical';
              if (res.severity === 'High') badgeClass = 'badge-high';
              if (res.severity === 'Low') badgeClass = 'badge-low';

              return (
                <div key={res.incident_id} className="clean-card p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-400">#{res.incident_id}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${badgeClass}`}>
                        {res.severity}
                      </span>
                      <span className="text-[11px] text-zinc-300 bg-black px-1.5 py-0.5 rounded border border-zinc-800">
                        {res.category}
                      </span>
                    </div>

                    <div className="font-mono text-xs text-white font-semibold">
                      {res.similarity_percentage}% Match
                    </div>
                  </div>

                  <h3 className="font-medium text-white text-sm">{res.title}</h3>

                  <p className="text-xs text-zinc-400 line-clamp-2">
                    {res.description}
                  </p>

                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-zinc-500 text-[11px]">Asset: {res.asset_name}</span>
                    <Link
                      href={`/incidents/${res.incident_id}`}
                      className="text-zinc-300 hover:text-white flex items-center gap-1 text-xs underline"
                    >
                      <span>View Incident</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

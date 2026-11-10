'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, Cpu, Sparkles, Filter, AlertTriangle, ArrowRight, Activity, Layers, SlidersHorizontal 
} from 'lucide-react';

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
          top_k: 6,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Vector search failed');
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
          <Cpu className="w-6 h-6 text-cyan-400" />
          <span>AI Vector Threat Correlation Engine</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono">
            all-MiniLM-L6-v2 · 384 Dim · HNSW Index
          </span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Searches semantic similarity using pgvector Cosine Distance (<code className="text-cyan-300">&lt;=&gt;</code>) to find conceptually related incidents even when phrasing differs completely.
        </p>
      </div>

      {/* Search Input Box & Hybrid Filters */}
      <div className="cyber-card p-6 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-3"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-5 h-5 text-cyan-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter freeform cyber threat description, suspicious anomaly, or attack symptoms..."
              className="w-full pl-11 pr-24 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-2 bottom-2 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold font-mono flex items-center gap-1.5 transition-all disabled:opacity-40"
            >
              {loading ? <Activity className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? 'Vectorizing...' : 'Correlate'}</span>
            </button>
          </div>

          {/* Hybrid Relational Filters */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Hybrid SQL Filters:
            </span>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="py-1 px-2.5 bg-slate-900 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="">Any Severity</option>
              <option value="Critical">Critical Only</option>
              <option value="High">High Only</option>
              <option value="Medium">Medium Only</option>
              <option value="Low">Low Only</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1 px-2.5 bg-slate-900 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="">Any Status</option>
              <option value="New">New</option>
              <option value="Investigating">Investigating</option>
              <option value="Contained">Contained</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </form>

        {/* Sample Scenario Prompts */}
        <div className="pt-3 border-t border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono mb-2">
            Try Evaluation Handbook Scenarios:
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSampleClick(sample)}
                className="px-2.5 py-1 rounded bg-slate-900/80 border border-slate-700/80 hover:border-cyan-500/50 hover:bg-cyan-950/30 text-slate-300 text-[11px] font-mono transition-colors text-left"
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 text-red-300 text-xs">
          Error: {error}
        </div>
      )}

      {loading && (
        <div className="py-16 text-center text-cyan-400 font-mono text-xs flex items-center justify-center gap-2">
          <Activity className="w-4 h-4 animate-spin" />
          <span>COMPUTING 384-DIMENSIONAL COSINE DISTANCES IN PGVECTOR...</span>
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="py-12 text-center text-slate-500 font-mono text-xs cyber-card">
          No incidents matched the vector similarity threshold or relational filter.
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span>
              Top {results.length} Semantically Correlated Incidents (Ranked by Cosine Similarity)
            </span>
            <span className="text-cyan-400">Index: HNSW (M=16, ef_construction=64)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((res, index) => {
              const sim = res.similarity_percentage;
              let matchColor = 'text-cyan-400';
              let barColor = 'from-cyan-600 to-cyan-400';
              if (sim >= 60) {
                matchColor = 'text-emerald-400';
                barColor = 'from-emerald-600 to-emerald-400';
              } else if (sim < 40) {
                matchColor = 'text-amber-400';
                barColor = 'from-amber-600 to-amber-400';
              }

              let badgeClass = 'cyber-badge-medium';
              if (res.severity === 'Critical') badgeClass = 'cyber-badge-critical';
              if (res.severity === 'High') badgeClass = 'cyber-badge-high';
              if (res.severity === 'Low') badgeClass = 'cyber-badge-low';

              return (
                <div key={res.incident_id} className="cyber-card p-5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    {/* Header line */}
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">#{res.incident_id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeClass}`}>
                          {res.severity}
                        </span>
                        <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          {res.category}
                        </span>
                      </div>

                      {/* Similarity Pill */}
                      <div className={`font-mono font-bold text-xs ${matchColor} flex items-center gap-1`}>
                        <span>{sim}% Match</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
                        style={{ width: `${Math.min(sim * 1.3, 100)}%` }}
                      />
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-slate-100 text-sm">{res.title}</h3>

                    {/* Description preview */}
                    <p className="text-xs text-slate-400 font-mono line-clamp-3 bg-slate-900/60 p-2.5 rounded border border-slate-800">
                      {res.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">Asset: <strong className="text-slate-300">{res.asset_name}</strong></span>
                    <Link
                      href={`/incidents/${res.incident_id}`}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                    >
                      <span>Investigate</span>
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


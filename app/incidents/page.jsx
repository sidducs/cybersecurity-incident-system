'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, Plus, Search, Filter, ArrowUpDown, ChevronRight, Activity 
} from 'lucide-react';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (severityFilter) params.append('severity', severityFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/incidents?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setIncidents(data.incidents || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [severityFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchIncidents();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-cyan-400" />
            <span>Incident Registry & Triage Directory</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Enterprise Master Threat Catalog with Real-Time Forensic Tracking & ACID State Transitions
          </p>
        </div>

        <Link
          href="/incidents/new"
          className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-cyan-950/60 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Incident</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="cyber-card p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Keyword Search */}
          <div className="sm:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by title, keywords, or CVE payload..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Severity Filter */}
          <div className="sm:col-span-3">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Investigating">Investigating</option>
              <option value="Contained">Contained</option>
              <option value="Resolved">Resolved</option>
              <option value="False Positive">False Positive</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="sm:col-span-1">
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold flex items-center justify-center transition-colors"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Incidents Table */}
      <div className="cyber-card p-5">
        {loading ? (
          <div className="py-16 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
            <Activity className="w-4 h-4 animate-spin text-cyan-400" />
            <span>FETCHING INCIDENTS FROM DATABASE...</span>
          </div>
        ) : incidents.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-mono text-xs">
            No incidents matched your query criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Incident Title & Vector</th>
                  <th className="py-3 px-3">Classification</th>
                  <th className="py-3 px-3">Severity</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Target Asset</th>
                  <th className="py-3 px-3">Assigned Analyst</th>
                  <th className="py-3 px-3">Risk Score</th>
                  <th className="py-3 px-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {incidents.map((inc) => {
                  let badgeClass = 'cyber-badge-medium';
                  if (inc.severity === 'Critical') badgeClass = 'cyber-badge-critical';
                  if (inc.severity === 'High') badgeClass = 'cyber-badge-high';
                  if (inc.severity === 'Low') badgeClass = 'cyber-badge-low';

                  return (
                    <tr key={inc.incident_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 text-cyan-400 font-bold">#{inc.incident_id}</td>
                      <td className="py-3 px-3 max-w-sm">
                        <div className="font-sans font-semibold text-slate-100 truncate">
                          {inc.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {inc.description}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-slate-300 font-mono text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {inc.classification}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeClass}`}>
                          {inc.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-slate-300 font-mono text-[11px]">{inc.status}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-200">{inc.asset_name}</div>
                        <div className="text-[10px] text-slate-500">{inc.asset_criticality}</div>
                      </td>
                      <td className="py-3 px-3">
                        {inc.assigned_to_name ? (
                          <span className="text-slate-200">{inc.assigned_to_name}</span>
                        ) : (
                          <span className="text-amber-400/80 italic font-sans">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold text-red-400">
                        {inc.risk_score}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/incidents/${inc.incident_id}`}
                          className="p-1.5 rounded bg-slate-900 border border-slate-700 hover:border-cyan-500 text-cyan-400 inline-flex items-center transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


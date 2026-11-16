'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, ChevronRight, Activity } from 'lucide-react';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [scope, setScope] = useState('all'); // 'all' or 'assigned'

  useEffect(() => {
    try {
      const saved = localStorage.getItem('soc_user');
      if (saved) {
        const u = JSON.parse(saved);
        setCurrentUser(u);
        if (u.roleName === 'Security Analyst') {
          setScope('assigned');
        }
      }
    } catch (e) {}
  }, []);

  const fetchIncidents = async (currentScope = scope, user = currentUser) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (severityFilter) params.append('severity', severityFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (currentScope === 'assigned' && user?.userId) {
        params.append('assigned_to', user.userId);
      }

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
    fetchIncidents(scope, currentUser);
  }, [severityFilter, statusFilter, scope, currentUser]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchIncidents();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-white">Security Incidents</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Directory of all reported security incidents and investigations</p>
        </div>

        <Link
          href="/incidents/new"
          className="px-3 py-1.5 rounded bg-white hover:bg-zinc-200 text-black text-xs font-semibold flex items-center gap-1.5 transition-colors w-fit"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Incident</span>
        </Link>
      </div>

      {/* Scope Switcher for Security Analyst */}
      {currentUser?.roleName === 'Security Analyst' && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setScope('assigned')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              scope === 'assigned'
                ? 'bg-white text-black'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Assigned to Me ({currentUser.fullName})
          </button>
          <button
            type="button"
            onClick={() => setScope('all')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              scope === 'all'
                ? 'bg-white text-black'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            All Organization Incidents
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="clean-card p-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5 items-center">
          {/* Keyword Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute inset-y-0 left-2.5 my-auto text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or description..."
              className="w-full pl-8 pr-3 py-1.5 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-white"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full sm:w-auto py-1.5 px-2.5 bg-black border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-white"
          >
            <option value="">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto py-1.5 px-2.5 bg-black border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-white"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Investigating">Investigating</option>
            <option value="Contained">Contained</option>
            <option value="Resolved">Resolved</option>
            <option value="False Positive">False Positive</option>
          </select>

          {/* Search Button */}
          <button
            type="submit"
            className="w-full sm:w-auto px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Incidents Table */}
      <div className="clean-card p-4">
        {loading ? (
          <div className="py-12 text-center text-zinc-400 text-xs flex items-center justify-center gap-2">
            <Activity className="w-4 h-4 animate-spin text-white" />
            <span>Loading incidents...</span>
          </div>
        ) : incidents.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs">
            No incidents found matching the specified filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="py-2.5 px-2.5">ID</th>
                  <th className="py-2.5 px-2.5">Title</th>
                  <th className="py-2.5 px-2.5">Category</th>
                  <th className="py-2.5 px-2.5">Severity</th>
                  <th className="py-2.5 px-2.5">Status</th>
                  <th className="py-2.5 px-2.5">Asset</th>
                  <th className="py-2.5 px-2.5">Assigned To</th>
                  <th className="py-2.5 px-2.5 text-right">Risk</th>
                  <th className="py-2.5 px-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {incidents.map((inc) => {
                  let badgeClass = 'badge-medium';
                  if (inc.severity === 'Critical') badgeClass = 'badge-critical';
                  if (inc.severity === 'High') badgeClass = 'badge-high';
                  if (inc.severity === 'Low') badgeClass = 'badge-low';

                  return (
                    <tr key={inc.incident_id} className="hover:bg-zinc-800/30">
                      <td className="py-2.5 px-2.5 font-mono text-zinc-400">#{inc.incident_id}</td>
                      <td className="py-2.5 px-2.5 max-w-sm">
                        <div className="font-medium text-white truncate">{inc.title}</div>
                        <div className="text-[11px] text-zinc-400 truncate">{inc.description}</div>
                      </td>
                      <td className="py-2.5 px-2.5 text-zinc-300">{inc.classification}</td>
                      <td className="py-2.5 px-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${badgeClass}`}>
                          {inc.severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 text-zinc-300">{inc.status}</td>
                      <td className="py-2.5 px-2.5 text-zinc-300">{inc.asset_name}</td>
                      <td className="py-2.5 px-2.5 text-zinc-400">
                        {inc.assigned_to_name || <span className="text-zinc-500 italic">Unassigned</span>}
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-mono text-zinc-100 font-semibold">
                        {inc.risk_score}
                      </td>
                      <td className="py-2.5 px-2.5 text-right">
                        <Link
                          href={`/incidents/${inc.incident_id}`}
                          className="text-zinc-300 hover:text-white text-xs inline-flex items-center gap-0.5 underline"
                        >
                          <span>View</span>
                          <ChevronRight className="w-3.5 h-3.5" />
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

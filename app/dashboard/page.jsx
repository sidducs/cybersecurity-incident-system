'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Activity } from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-zinc-400 text-xs">
          <Activity className="w-4 h-4 animate-spin text-white" />
          <span>Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 rounded bg-red-950/40 border border-red-900/60 text-red-300 text-xs">
        Error loading dashboard: {error}
      </div>
    );
  }

  const { metrics, incidentTypes, severityBreakdown, highPriorityQueue, topAssets } = data;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-white">Incidents Dashboard</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Overview of reported security incidents and system triage status</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </Link>

          <Link
            href="/incidents/new"
            className="px-3 py-1.5 rounded bg-white hover:bg-zinc-200 text-black text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Incident</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="clean-card p-4">
          <div className="text-xs text-zinc-400">Total Incidents</div>
          <div className="text-2xl font-bold text-white mt-1">{metrics.total_incidents}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Average Risk: {metrics.avg_risk_score} / 100</div>
        </div>

        <div className="clean-card p-4">
          <div className="text-xs text-amber-400">Active Incidents</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{metrics.active_incidents}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">New or in investigation</div>
        </div>

        <div className="clean-card p-4">
          <div className="text-xs text-red-400">Critical Priority</div>
          <div className="text-2xl font-bold text-red-400 mt-1">{metrics.active_critical}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Unresolved critical items</div>
        </div>

        <div className="clean-card p-4">
          <div className="text-xs text-emerald-400">Resolved</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{metrics.resolved_incidents}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Remediated and closed</div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Incident Classification Distribution */}
        <div className="clean-card p-4 lg:col-span-2">
          <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-3">
            Incidents by Classification Type
          </h2>
          <div className="space-y-2.5">
            {incidentTypes.map((item) => {
              const maxCount = Math.max(...incidentTypes.map((t) => parseInt(t.count, 10)), 1);
              const percentage = Math.round((parseInt(item.count, 10) / maxCount) * 100);
              return (
                <div key={item.type_name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-200">{item.type_name}</span>
                    <span className="text-zinc-400 font-mono">{item.count}</span>
                  </div>
                  <div className="w-full h-1.5 rounded bg-zinc-900 overflow-hidden">
                    <div
                      className="h-full bg-white rounded transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity Breakdown & Top Target Assets */}
        <div className="space-y-4">
          <div className="clean-card p-4">
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-3">
              Severity Distribution
            </h2>
            <div className="grid grid-cols-2 gap-2 text-center">
              {severityBreakdown.map((s) => {
                let badgeClass = 'badge-medium';
                if (s.severity === 'Critical') badgeClass = 'badge-critical';
                if (s.severity === 'High') badgeClass = 'badge-high';
                if (s.severity === 'Low') badgeClass = 'badge-low';
                return (
                  <div key={s.severity} className={`p-2 rounded ${badgeClass}`}>
                    <div className="text-[11px] font-medium">{s.severity}</div>
                    <div className="text-lg font-bold mt-0.5">{s.count}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="clean-card p-4">
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-2">
              Frequently Targeted Assets
            </h2>
            <div className="space-y-1.5 text-xs">
              {topAssets.map((asset) => (
                <div
                  key={asset.asset_name}
                  className="flex items-center justify-between p-1.5 rounded bg-black border border-zinc-800 text-xs"
                >
                  <span className="text-zinc-200 truncate">{asset.asset_name}</span>
                  <span className="text-zinc-400 font-medium font-mono shrink-0 ml-2">
                    {asset.attack_count} events
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* High-Priority Queue Table */}
      <div className="clean-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">
            High Priority Incidents
          </h2>
          <Link href="/incidents" className="text-xs text-zinc-400 hover:text-white">
            View All Incidents →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="py-2 px-2.5">ID</th>
                <th className="py-2 px-2.5">Title</th>
                <th className="py-2 px-2.5">Severity</th>
                <th className="py-2 px-2.5">Status</th>
                <th className="py-2 px-2.5">Asset</th>
                <th className="py-2 px-2.5">Assigned To</th>
                <th className="py-2 px-2.5 text-right">Risk Score</th>
                <th className="py-2 px-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {highPriorityQueue.map((inc) => {
                let badgeClass = 'badge-high';
                if (inc.severity === 'Critical') badgeClass = 'badge-critical';
                return (
                  <tr key={inc.incident_id} className="hover:bg-zinc-800/30">
                    <td className="py-2 px-2.5 font-mono text-zinc-400">#{inc.incident_id}</td>
                    <td className="py-2 px-2.5 text-zinc-200 max-w-xs truncate font-medium">
                      {inc.title}
                    </td>
                    <td className="py-2 px-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${badgeClass}`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 text-zinc-400">{inc.status}</td>
                    <td className="py-2 px-2.5 text-zinc-300">{inc.asset_name}</td>
                    <td className="py-2 px-2.5 text-zinc-400">
                      {inc.assigned_analyst || <span className="text-zinc-500 italic">Unassigned</span>}
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono text-zinc-100 font-semibold">
                      {inc.risk_score}
                    </td>
                    <td className="py-2 px-2.5 text-right">
                      <Link
                        href={`/incidents/${inc.incident_id}`}
                        className="text-zinc-300 hover:text-white underline text-xs"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

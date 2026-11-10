'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, ShieldAlert, CheckCircle2, Flame, Server, 
  ArrowUpRight, Plus, Search, Activity
} from 'lucide-react';

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
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <Activity className="w-4 h-4 animate-spin text-blue-500" />
          <span>Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 rounded bg-red-950/50 border border-red-800 text-red-200 text-xs">
        Error loading dashboard: {error}
      </div>
    );
  }

  const { metrics, incidentTypes, severityBreakdown, highPriorityQueue, topAssets } = data;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Incidents Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">Summary of reported security incidents and system triage status</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </Link>

          <Link
            href="/incidents/new"
            className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Incident</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="clean-card p-4">
          <div className="text-xs text-slate-400">Total Incidents</div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{metrics.total_incidents}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Average Risk: {metrics.avg_risk_score} / 100</div>
        </div>

        <div className="clean-card p-4">
          <div className="text-xs text-amber-400">Active Incidents</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{metrics.active_incidents}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">New or in investigation</div>
        </div>

        <div className="clean-card p-4">
          <div className="text-xs text-red-400">Critical Priority</div>
          <div className="text-2xl font-bold text-red-400 mt-1">{metrics.active_critical}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Unresolved critical items</div>
        </div>

        <div className="clean-card p-4">
          <div className="text-xs text-emerald-400">Resolved</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{metrics.resolved_incidents}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Remediated & closed</div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Incident Classification Distribution */}
        <div className="clean-card p-4 lg:col-span-2">
          <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wide mb-3">
            Incidents by Classification Type
          </h2>
          <div className="space-y-2.5">
            {incidentTypes.map((item) => {
              const maxCount = Math.max(...incidentTypes.map((t) => parseInt(t.count, 10)), 1);
              const percentage = Math.round((parseInt(item.count, 10) / maxCount) * 100);
              return (
                <div key={item.type_name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{item.type_name}</span>
                    <span className="text-slate-400 font-mono">{item.count}</span>
                  </div>
                  <div className="w-full h-1.5 rounded bg-slate-900 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded transition-all duration-300"
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
            <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wide mb-3">
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
            <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wide mb-2">
              Frequently Targeted Assets
            </h2>
            <div className="space-y-1.5 text-xs">
              {topAssets.map((asset) => (
                <div
                  key={asset.asset_name}
                  className="flex items-center justify-between p-1.5 rounded bg-slate-900/40 text-xs"
                >
                  <span className="text-slate-300 truncate">{asset.asset_name}</span>
                  <span className="text-amber-400 font-medium font-mono shrink-0 ml-2">
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
          <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
            High Priority Queue
          </h2>
          <Link href="/incidents" className="text-xs text-blue-400 hover:text-blue-300">
            View All Incidents →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
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
            <tbody className="divide-y divide-slate-800">
              {highPriorityQueue.map((inc) => {
                let badgeClass = 'badge-high';
                if (inc.severity === 'Critical') badgeClass = 'badge-critical';
                return (
                  <tr key={inc.incident_id} className="hover:bg-slate-700/20">
                    <td className="py-2 px-2.5 font-mono text-slate-400">#{inc.incident_id}</td>
                    <td className="py-2 px-2.5 text-slate-200 max-w-xs truncate font-medium">
                      {inc.title}
                    </td>
                    <td className="py-2 px-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${badgeClass}`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 text-slate-400">{inc.status}</td>
                    <td className="py-2 px-2.5 text-slate-300">{inc.asset_name}</td>
                    <td className="py-2 px-2.5 text-slate-400">
                      {inc.assigned_analyst || <span className="text-slate-500 italic">Unassigned</span>}
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono text-slate-200 font-semibold">
                      {inc.risk_score}
                    </td>
                    <td className="py-2 px-2.5 text-right">
                      <Link
                        href={`/incidents/${inc.incident_id}`}
                        className="text-blue-400 hover:text-blue-300 text-xs"
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

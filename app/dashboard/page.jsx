'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, ShieldAlert, CheckCircle2, Flame, Server, 
  ArrowUpRight, Plus, Search, Activity, Clock
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
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400">
          <Activity className="w-6 h-6 animate-spin" />
          <span className="text-sm font-mono tracking-wider">CONNECTING TO SOC INTELLIGENCE ENGINE...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 text-red-300">
        Error loading dashboard: {error}
      </div>
    );
  }

  const { metrics, incidentTypes, severityBreakdown, highPriorityQueue, topAssets } = data;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <span>SOC Command Center</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
              LIVE POSTGRESQL + PGVECTOR
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time Threat Correlation, Automated Forensic Triage & Multi-Factor Risk Prioritization
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/search"
            className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/60 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Vector Search</span>
          </Link>

          <Link
            href="/incidents/new"
            className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-cyan-950/60"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Security Incident</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Incidents */}
        <div className="cyber-card p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase font-mono">Total Ingested</span>
            <AlertTriangle className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-slate-100 font-mono">{metrics.total_incidents}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
            <span>Avg Risk:</span>
            <span className="text-cyan-400 font-bold">{metrics.avg_risk_score} / 100</span>
          </div>
        </div>

        {/* Active Threats */}
        <div className="cyber-card p-4 border-amber-500/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase font-mono">Active Triage</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-amber-400 font-mono">{metrics.active_incidents}</div>
          <div className="text-[11px] text-amber-400/80 mt-1 font-mono">
            New / Investigating / Contained
          </div>
        </div>

        {/* Critical Unresolved */}
        <div className="cyber-card p-4 border-red-500/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase font-mono">Critical Backlog</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-red-400 font-mono">{metrics.active_critical}</div>
          <div className="text-[11px] text-red-400/80 mt-1 font-mono">
            Requiring Emergency Response
          </div>
        </div>

        {/* Resolved */}
        <div className="cyber-card p-4 border-emerald-500/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase font-mono">Resolved & Closed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400 font-mono">{metrics.resolved_incidents}</div>
          <div className="text-[11px] text-emerald-400/80 mt-1 font-mono">
            Automated Audit Resolution
          </div>
        </div>
      </div>

      {/* Analytics Grid: Threat Vectors & Severity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attack Classification Distribution (Q01) */}
        <div className="cyber-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
              Threat Classification Taxonomy (Q01)
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">GROUP BY t.type_name</span>
          </div>

          <div className="space-y-3">
            {incidentTypes.map((item) => {
              const maxCount = Math.max(...incidentTypes.map((t) => parseInt(t.count, 10)), 1);
              const percentage = Math.round((parseInt(item.count, 10) / maxCount) * 100);
              return (
                <div key={item.type_name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{item.type_name}</span>
                    <span className="font-mono text-cyan-400 font-semibold">{item.count}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity Distribution & Target Assets */}
        <div className="cyber-card p-5 space-y-6">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
                Severity Breakdown (Q02)
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {severityBreakdown.map((s) => {
                let badgeClass = 'cyber-badge-medium';
                if (s.severity === 'Critical') badgeClass = 'cyber-badge-critical';
                if (s.severity === 'High') badgeClass = 'cyber-badge-high';
                if (s.severity === 'Low') badgeClass = 'cyber-badge-low';
                return (
                  <div key={s.severity} className={`p-3 rounded-lg ${badgeClass} text-center`}>
                    <div className="text-xs font-semibold">{s.severity}</div>
                    <div className="text-xl font-bold font-mono mt-0.5">{s.count}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
                Attack Hotspots (Q06)
              </h3>
              <Server className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="space-y-2">
              {topAssets.map((asset) => (
                <div
                  key={asset.asset_name}
                  className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800 text-xs"
                >
                  <div>
                    <div className="font-mono font-semibold text-slate-200">{asset.asset_name}</div>
                    <div className="text-[10px] text-slate-500">{asset.department}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono text-amber-400 font-bold">
                      {asset.attack_count} attacks
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* High-Priority Incidents Dispatch Queue (v_high_priority_incidents) */}
      <div className="cyber-card p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-400" />
              <span>High-Priority Triage Queue (View: v_high_priority_incidents)</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Filtered by Critical/High Severity & Active Status, Ranked by Quantitative Risk Score
            </p>
          </div>
          <Link
            href="/incidents"
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Incident Title</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Target Asset</th>
                <th className="py-2.5 px-3">Assigned Analyst</th>
                <th className="py-2.5 px-3">Risk Score</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {highPriorityQueue.map((inc) => {
                let badgeClass = 'cyber-badge-high';
                if (inc.severity === 'Critical') badgeClass = 'cyber-badge-critical';
                return (
                  <tr key={inc.incident_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">#{inc.incident_id}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-200 max-w-xs truncate font-medium">
                      {inc.title}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeClass}`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-slate-300 font-mono text-[11px]">{inc.status}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{inc.asset_name}</td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {inc.assigned_analyst || (
                        <span className="text-amber-400/80 italic font-sans">Unassigned</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-red-400">
                      {inc.risk_score ? `${inc.risk_score}` : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        href={`/incidents/${inc.incident_id}`}
                        className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-cyan-500 text-cyan-400 text-[11px] font-mono transition-colors"
                      >
                        Triage →
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

